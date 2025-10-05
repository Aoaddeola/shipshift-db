// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { UserAuthService } from './auth.service.js';
import { LoginDto } from './login.dto.js';
import { RegisterDto } from './register.dto.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';

@Controller('user/auth')
export class AuthController {
  constructor(private readonly authService: UserAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req) {
    await this.authService.logout(req.user.sub);
    return { message: 'Logged out successfully' };
  }

  @Post('verify-email/request')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async requestVerificationEmail(@Req() req) {
    return this.authService.requestEmailVerification(req.user.sub);
  }

  @Post('verify-email/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmVerificationEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // Alternative: GET endpoint for email verification (for clickable links in emails)
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    const result = await this.authService.verifyEmail(token);

    // In a real application, you might redirect to a success page
    return result;
  }

  // Optional: Resend verification email
  @Post('verify-email/resend')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(@Req() req) {
    return this.authService.requestEmailVerification(req.user.sub);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    await this.authService.requestPasswordReset(email);
    return {
      message:
        'If an account with that email exists, a reset link has been sent',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password reset successfully' };
  }
}
