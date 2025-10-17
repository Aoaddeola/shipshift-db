/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/auth/third-party-auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
import { AppConfigService } from '../../config/config.service.js';
import { UserService } from '../../users/user/user.service.js';

export interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthResult {
  user: any;
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class ThirdPartyAuthService {
  private googleClient: OAuth2Client;

  constructor(
    private appConfigService: AppConfigService,
    private jwtService: JwtService,
    // Inject your user service/repository here
    private userService: UserService,
  ) {
    this.googleClient = new OAuth2Client(
      this.appConfigService.googleClientId,
      this.appConfigService.googleClientSecret,
    );
  }

  /**
   * Handle Google OAuth authentication
   */
  async handleGoogleAuth(
    code: string,
    redirectUri: string,
  ): Promise<AuthResult> {
    try {
      // Exchange code for tokens
      const { tokens } = await this.googleClient.getToken({
        code,
        redirect_uri: redirectUri || this.appConfigService.googleRedirectUri,
      });

      if (!tokens.id_token) {
        throw new UnauthorizedException('Failed to get ID token from Google');
      }

      // Verify and decode the ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.appConfigService.googleClientId,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const profile: OAuthProfile = {
        provider: 'google',
        providerId: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
      };

      return await this.processOAuthProfile(profile);
    } catch (error) {
      throw new UnauthorizedException(
        `Google authentication failed: ${error.message}`,
      );
    }
  }

  /**
   * Handle GitHub OAuth authentication
   */
  async handleGitHubAuth(
    code: string,
    redirectUri: string,
  ): Promise<AuthResult> {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: this.appConfigService.githubClientId,
            client_secret: this.appConfigService.githubClientSecret,
            code,
            redirect_uri: redirectUri,
          }),
        },
      );

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        throw new UnauthorizedException(
          'Failed to get access token from GitHub',
        );
      }

      // Get user profile from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Your-App-Name',
        },
      });

      const userData = await userResponse.json();

      // Get user email (requires additional request if not public)
      let email = userData.email;
      if (!email) {
        const emailsResponse = await fetch(
          'https://api.github.com/user/emails',
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              'User-Agent': 'Your-App-Name',
            },
          },
        );
        const emails = await emailsResponse.json();
        const primaryEmail = emails.find(
          (email: any) => email.primary && email.verified,
        );
        email = primaryEmail ? primaryEmail.email : userData.email;
      }

      const profile: OAuthProfile = {
        provider: 'github',
        providerId: userData.id.toString(),
        email: email,
        name: userData.name || userData.login,
        picture: userData.avatar_url,
        accessToken: tokenData.access_token,
      };

      return await this.processOAuthProfile(profile);
    } catch (error) {
      throw new UnauthorizedException(
        `GitHub authentication failed: ${error.message}`,
      );
    }
  }

  /**
   * Handle Facebook OAuth authentication
   */
  async handleFacebookAuth(
    code: string,
    redirectUri: string,
  ): Promise<AuthResult> {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch(
        'https://graph.facebook.com/v17.0/oauth/access_token',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const url = new URL(
        'https://graph.facebook.com/v17.0/oauth/access_token',
      );
      url.searchParams.append(
        'client_id',
        this.appConfigService.facebookClientId,
      );
      url.searchParams.append(
        'client_secret',
        this.appConfigService.facebookClientSecret,
      );
      url.searchParams.append('code', code);
      url.searchParams.append('redirect_uri', redirectUri);

      const response = await fetch(url.toString());
      const tokenData = await response.json();

      if (!tokenData.access_token) {
        throw new UnauthorizedException(
          'Failed to get access token from Facebook',
        );
      }

      // Get user profile from Facebook
      const userResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`,
      );
      const userData = await userResponse.json();

      const profile: OAuthProfile = {
        provider: 'facebook',
        providerId: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture?.data?.url,
        accessToken: tokenData.access_token,
      };

      return await this.processOAuthProfile(profile);
    } catch (error) {
      throw new UnauthorizedException(
        `Facebook authentication failed: ${error.message}`,
      );
    }
  }

  /**
   * Process OAuth profile and create/update user
   */
  private async processOAuthProfile(
    profile: OAuthProfile,
  ): Promise<AuthResult> {
    // Find existing user by provider ID or email
    let user = await this.findUserByProviderId(
      profile.provider,
      profile.providerId,
    );

    if (!user) {
      // Try to find by email
      user = await this.findUserByEmail(profile.email);

      if (user) {
        // Link existing account with this provider
        await this.linkProviderToUser(user.id, profile);
      } else {
        // Create new user
        user = await this.createUserFromOAuthProfile(profile);
      }
    } else {
      // Update existing user's provider info
      await this.updateUserProviderInfo(user.id, profile);
    }

    // Generate JWT tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Generate JWT access and refresh tokens
   */
  private async generateTokens(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      provider: user.provider,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.appConfigService.jwtRefreshExpiration,
      secret: this.appConfigService.jwtRefreshSecret,
    });

    // Store refresh token using bcrypt rounds from config
    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * Find user by provider ID
   */
  private async findUserByProviderId(
    provider: string,
    providerId: string,
  ): Promise<any> {
    // Implement your database query here
    // Example:
    return this.userService.findByProviderId(provider, providerId);
  }

  /**
   * Find user by email
   */
  private async findUserByEmail(email: string): Promise<any> {
    // Implement your database query here
    // Example:
    return this.userService.findByEmail(email);
  }

  /**
   * Create user from OAuth profile
   */
  private async createUserFromOAuthProfile(
    profile: OAuthProfile,
  ): Promise<any> {
    // Implement user creation logic here
    // Example:
    // return this.userService.create({
    //   email: profile.email,
    //   name: profile.name,
    //   avatar: profile.picture,
    //   provider: profile.provider,
    //   providerId: profile.providerId,
    //   isVerified: true, // OAuth emails are typically verified
    // });
    return {
      id: 'generated-id',
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
      provider: profile.provider,
      providerId: profile.providerId,
      isVerified: true,
    }; // Replace with actual implementation
  }

  /**
   * Link provider to existing user
   */
  private async linkProviderToUser(
    userId: string,
    profile: OAuthProfile,
  ): Promise<void> {
    // Implement provider linking logic here
    // Example:
    await this.userService.linkOAuthProvider(userId, profile);
  }

  /**
   * Update user's provider information
   */
  private async updateUserProviderInfo(
    userId: string,
    profile: OAuthProfile,
  ): Promise<void> {
    // Implement update logic here
    // Example:
    await this.userService.unlinkOAuthProvider(userId, profile.provider);
  }

  /**
   * Store refresh token in database
   */
  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedToken = await bcrypt.hash(refreshToken, 12);
    // Store hashedToken in database associated with userId
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: any): any {
    const { password, refreshToken, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Unlink provider from user account
   */
  async unlinkProvider(userId: string, provider: string): Promise<void> {
    // Implement provider unlinking logic
    // Example:
    await this.userService.unlinkOAuthProvider(userId, provider);
  }

  /**
   * Get connected providers for a user
   */
  async getConnectedProviders(userId: string): Promise<string[]> {
    // Implement logic to get user's connected providers
    // Example:
    return this.userService.getConnectedProviders(userId);
  }
}
