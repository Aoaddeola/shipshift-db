// src/auth/third-party-auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { AppConfigService } from '../../config/config.service.js';
import { OAuthCallbackDto, OAuthUnlinkDto } from './oauth-callback.dto.js';
import { ThirdPartyAuthService, AuthResult } from './oauth.service.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';

@Controller('auth/oauth')
export class ThirdPartyAuthController {
  constructor(
    private readonly thirdPartyAuthService: ThirdPartyAuthService,
    private readonly appConfigService: AppConfigService,
  ) {}

  // Helper method to build URLSearchParams safely
  private buildSearchParams(params: Record<string, string>): URLSearchParams {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value);
      }
    });
    return searchParams;
  }

  // OAuth Initiation Endpoints (GET)
  @Get('google')
  async initiateGoogleAuth(
    @Query('redirect_uri') redirectUri: string,
    @Res() res: Response,
  ) {
    const params = this.buildSearchParams({
      client_id: this.appConfigService.googleClientId,
      redirect_uri: redirectUri || this.appConfigService.googleRedirectUri,
      response_type: 'code',
      scope: 'profile email',
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    return res.redirect(authUrl);
  }

  @Get('github')
  async initiateGitHubAuth(
    @Query('redirect_uri') redirectUri: string,
    @Res() res: Response,
  ) {
    const params = this.buildSearchParams({
      client_id: this.appConfigService.githubClientId,
      redirect_uri: redirectUri || this.appConfigService.githubRedirectUri,
      scope: 'user:email',
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params}`;
    return res.redirect(authUrl);
  }

  @Get('facebook')
  async initiateFacebookAuth(
    @Query('redirect_uri') redirectUri: string,
    @Res() res: Response,
  ) {
    const params = this.buildSearchParams({
      client_id: this.appConfigService.facebookClientId,
      redirect_uri: redirectUri || this.appConfigService.facebookRedirectUri,
      scope: 'email,public_profile',
      response_type: 'code',
    });

    const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?${params}`;
    return res.redirect(authUrl);
  }

  // OAuth Callback Endpoints (POST) - for frontend token exchange
  @Post('google')
  async googleAuth(
    @Body() oauthCallbackDto: OAuthCallbackDto,
  ): Promise<AuthResult> {
    return this.thirdPartyAuthService.handleGoogleAuth(
      oauthCallbackDto.code,
      oauthCallbackDto.redirectUri,
    );
  }

  @Post('github')
  async githubAuth(
    @Body() oauthCallbackDto: OAuthCallbackDto,
  ): Promise<AuthResult> {
    return this.thirdPartyAuthService.handleGitHubAuth(
      oauthCallbackDto.code,
      oauthCallbackDto.redirectUri,
    );
  }

  @Post('facebook')
  async facebookAuth(
    @Body() oauthCallbackDto: OAuthCallbackDto,
  ): Promise<AuthResult> {
    return this.thirdPartyAuthService.handleFacebookAuth(
      oauthCallbackDto.code,
      oauthCallbackDto.redirectUri,
    );
  }

  // OAuth Callback Endpoints (GET) - for direct browser redirects
  @Get('google/callback')
  async googleAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      if (!code) {
        throw new Error('No authorization code received');
      }

      const redirectUri = this.appConfigService.googleRedirectUri;
      const result = await this.thirdPartyAuthService.handleGoogleAuth(
        code,
        redirectUri,
      );

      // Redirect to frontend with tokens
      const frontendParams = this.buildSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken || '',
        user: JSON.stringify(result.user),
      });

      const frontendUrl = `${this.appConfigService.frontendUrl}/auth/callback?${frontendParams}`;
      return res.redirect(frontendUrl);
    } catch (error) {
      const frontendParams = this.buildSearchParams({
        error: error.message,
      });
      const frontendUrl = `${this.appConfigService.frontendUrl}/auth/callback?${frontendParams}`;
      return res.redirect(frontendUrl);
    }
  }

  @Get('github/callback')
  async githubAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      if (!code) {
        throw new Error('No authorization code received');
      }

      const redirectUri = this.appConfigService.githubRedirectUri;
      const result = await this.thirdPartyAuthService.handleGitHubAuth(
        code,
        redirectUri,
      );

      const frontendParams = this.buildSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken || '',
        user: JSON.stringify(result.user),
      });

      const frontendUrl = `${this.appConfigService.frontendUrl}/auth/callback?${frontendParams}`;
      return res.redirect(frontendUrl);
    } catch (error) {
      const frontendParams = this.buildSearchParams({
        error: error.message,
      });
      const frontendUrl = `${this.appConfigService.frontendUrl}/auth/callback?${frontendParams}`;
      return res.redirect(frontendUrl);
    }
  }

  @Get('facebook/callback')
  async facebookAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      if (!code) {
        throw new Error('No authorization code received');
      }

      const redirectUri = this.appConfigService.facebookRedirectUri;
      const result = await this.thirdPartyAuthService.handleFacebookAuth(
        code,
        redirectUri,
      );

      const frontendParams = this.buildSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken || '',
        user: JSON.stringify(result.user),
      });

      const frontendUrl = `${this.appConfigService.frontendUrl}/auth/callback?${frontendParams}`;
      return res.redirect(frontendUrl);
    } catch (error) {
      const frontendParams = this.buildSearchParams({
        error: error.message,
      });
      const frontendUrl = `${this.appConfigService.frontendUrl}/auth/callback?${frontendParams}`;
      return res.redirect(frontendUrl);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('providers')
  async getConnectedProviders(@Req() req) {
    const providers = await this.thirdPartyAuthService.getConnectedProviders(
      req.user.id,
    );
    return { providers };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unlink')
  async unlinkProvider(@Req() req, @Body() oauthUnlinkDto: OAuthUnlinkDto) {
    await this.thirdPartyAuthService.unlinkProvider(
      req.user.id,
      oauthUnlinkDto.provider,
    );
    return { message: 'Provider unlinked successfully' };
  }
}
