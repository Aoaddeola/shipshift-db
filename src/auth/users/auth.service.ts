/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../../users/user/user.service.js';
import { LoginDto } from './login.dto.js';
import { RegisterDto } from './register.dto.js';

@Injectable()
export class UserAuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  /**
   * Validate user credentials and return user if valid
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  /**
   * Login user with email and password
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Validate user credentials
    const user = await this.validateUser(email, password);

    // Check if user is verified (if you have email verification)
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto) {
    const { name, email, password, confirmPassword, userType } = registerDto;

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = await this.userService.createWithEmail(
      email,
      password,
      name,
      userType,
    );

    const user_ = user.dataValues;

    // Generate tokens
    const tokens = await this.generateTokens(user_);

    // TODO: Implement email sending service
    await this.userService.sendEmailVerification(user.id, tokens.accessToken);

    return {
      user: this.sanitizeUser(user_),
      ...tokens,
    };
  }

  /**
   * Generate JWT access and refresh tokens with different expirations
   */
  private async generateTokens(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      iat: Math.floor(Date.now() / 1000), // Issued at timestamp
    };

    // Access token (short-lived - e.g., 15 minutes)
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Refresh token (long-lived - e.g., 7 days)
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Store hashed refresh token in database
    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * Store refresh token in database
   */
  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedToken = await bcrypt.hash(refreshToken, 12);
    await this.userService.updateRefreshToken(userId, hashedToken);
  }

  /**
   * Validate and refresh access token using refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      Logger.log('Refreshing token...');

      // First verify the refresh token is valid and not expired
      const payload = await this.jwtService.verifyAsync(refreshToken);

      // Get user from database
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if user has a refresh token stored
      if (!user.refreshToken) {
        throw new UnauthorizedException(
          'Refresh token not found. Please login again.',
        );
      }

      // Verify the refresh token matches the stored hash
      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!isRefreshTokenValid) {
        // If token doesn't match, clear the stored token (security measure)
        await this.userService.updateRefreshToken(user.id, null);
        throw new UnauthorizedException(
          'Invalid refresh token. Possible security breach.',
        );
      }

      // Check if refresh token is expired (should be caught by verifyAsync, but double-check)
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        await this.userService.updateRefreshToken(user.id, null);
        throw new UnauthorizedException('Refresh token expired');
      }

      // Generate new tokens (rotating refresh tokens for security)
      const tokens = await this.generateTokens(user);
      const message = 'Tokens refreshed successfully';
      Logger.log(message);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
        message,
      };
    } catch (error) {
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Refresh token expired. Please login again.',
        );
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Re-throw if it's already an UnauthorizedException
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate access token - useful for guards/middleware
   */
  async validateAccessToken(accessToken: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(accessToken);
      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token expired');
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }

  /**
   * Validate and refresh tokens if access token is expired
   * This can be used in an interceptor/guard
   */
  async validateOrRefreshTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<{
    valid: boolean;
    newTokens?: { accessToken: string; refreshToken: string };
    user?: any;
    message?: string;
  }> {
    try {
      // Try to validate access token first
      const payload = await this.jwtService.verifyAsync(accessToken);

      // Access token is valid
      const user = await this.userService.findById(payload.sub);
      return {
        valid: true,
        user: this.sanitizeUser(user),
      };
    } catch (accessTokenError) {
      // Access token is invalid or expired
      if (accessTokenError.name === 'TokenExpiredError' && refreshToken) {
        // Access token expired, try to refresh using refresh token
        try {
          const result = await this.refreshToken(refreshToken);
          return {
            valid: false,
            newTokens: {
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
            },
            user: result.user,
            message: 'Access token expired, new tokens issued',
          };
        } catch (refreshError) {
          // Refresh token is also invalid
          return {
            valid: false,
            message: 'Both access and refresh tokens are invalid',
          };
        }
      }

      // Access token invalid for other reasons (no refresh token provided, etc.)
      return {
        valid: false,
        message: 'Invalid access token',
      };
    }
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: any): any {
    const { password, refreshToken, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string): Promise<void> {
    // Invalidate refresh token in database
    await this.userService.updateRefreshToken(userId, null);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists or not
      return;
    }

    // Generate reset token and send email
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'password_reset' },
      { expiresIn: '1h' },
    );

    await this.userService.sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      await this.userService.setPassword(payload.sub, newPassword);

      // Invalidate all existing refresh tokens for security
      await this.userService.updateRefreshToken(payload.sub, null);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Reset token has expired');
      }
      throw new UnauthorizedException('Invalid reset token');
    }
  }

  /**
   * Extract user ID from verification token
   */
  private getUserIdFromToken(token: string): string {
    try {
      // For email verification tokens, we might use a different secret
      // or we can use the same JWT secret but with a specific payload structure
      const payload = this.jwtService.verify(token);

      return payload.sub;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Verification token has expired');
      }
      throw new UnauthorizedException('Invalid verification token');
    }
  }

  /**
   * Generate email verification token
   */
  private generateEmailVerificationToken(userId: string): string {
    const payload = {
      sub: userId,
      type: 'email_verification',
      timestamp: Date.now(),
    };

    return this.jwtService.sign(payload, {
      expiresIn: '24h', // Verification token expires in 24 hours
    });
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(
    userId: string,
  ): Promise<{ message: string; token?: string }> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate verification token
    const verificationToken = this.generateEmailVerificationToken(userId);

    // In a real application, you would send an email here
    // For now, we'll return the token in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Email verification token for ${user.email}: ${verificationToken}`,
      );
      console.log(
        `Verification URL: ${process.env.FRONTEND_URL}/web2/auth/verify-email?token=${verificationToken}`,
      );
    }

    // TODO: Implement email sending service
    await this.userService.sendEmailVerification(userId, verificationToken);

    return {
      message: 'Verification email sent successfully',
      ...(process.env.NODE_ENV === 'development' && {
        token: verificationToken,
      }),
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string; user: any }> {
    const userId = this.getUserIdFromToken(token);
    console.log('userId', userId);

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Mark email as verified
    await this.userService.verifyEmail(userId);

    // Get updated user
    const updatedUser = await this.userService.findById(userId);
    console.log('updatedUser', updatedUser);

    //
    await this.userService.sendWelcomeEmail(userId);

    return {
      message: 'Email verified successfully',
      user: this.sanitizeUser(updatedUser),
    };
  }
}
