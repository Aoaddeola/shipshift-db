/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
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
   * Generate JWT access and refresh tokens
   */
  private async generateTokens(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      userType: user.type,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d', // Refresh token expires in 7 days
    });

    // Store refresh token hash in database (optional)
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
    // You can store the hashed refresh token in the database
    // For simplicity, we're not implementing it here, but you can add it to your user entity
    const hashedToken = await bcrypt.hash(refreshToken, 12);
    await this.userService.updateRefreshToken(userId, hashedToken);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      // Verify the refresh token is still valid in database (optional)
      // const user = await this.userService.findById(payload.sub);
      // if (!user || !user.refreshToken) {
      //   throw new UnauthorizedException('Invalid refresh token');
      // }

      // const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
      // if (!isRefreshTokenValid) {
      //   throw new UnauthorizedException('Invalid refresh token');
      // }

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
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
      console.log('PAYLOAD', payload);

      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      await this.userService.setPassword(payload.sub, newPassword);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
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
        `Verification URL: http://localhost:3000/verify-email?token=${verificationToken}`,
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
