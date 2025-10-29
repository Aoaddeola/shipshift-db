/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/users/user.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import { User } from './user.model.js';
import { OAuthProvider } from '../../auth/oauth/oauth-provider.entity.js';
import { OAuthProfile } from '../../auth/oauth/oauth.service.js';
import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import { EmailService } from '../../notification/email.service.js';
import { UserType } from './user.types.js';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(OAuthProvider)
    private oauthProviderModel: typeof OAuthProvider,
    private emailService: EmailService,
  ) {}

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User): any {
    if (user) user.password = '';
    return user;
  }

  /**
   * Find user by email with OAuth providers
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({
        where: { email },
      });

      if (user) {
        // Manually load OAuth providers
        const oauthProviders = await this.oauthProviderModel.findAll({
          where: { userId: user.id },
        });
        (user as any).oauthProviders = oauthProviders;
      }
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Find user by provider ID and provider name
   */
  async findByProviderId(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    try {
      const oauthProvider = await this.oauthProviderModel.findOne({
        where: { provider, providerId },
      });

      if (!oauthProvider) {
        return null;
      }

      const user = await this.userModel.findOne({
        where: { id: oauthProvider.userId },
      });

      if (user) {
        // Load all OAuth providers for this user
        const oauthProviders = await this.oauthProviderModel.findAll({
          where: { userId: user.id },
        });
        (user as any).oauthProviders = oauthProviders;
      }

      return user!;
    } catch (error) {
      this.logger.error(`Error finding user by provider ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Find user by ID with OAuth providers
   */
  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({
        where: { id },
      });

      if (user) {
        const oauthProviders = await this.oauthProviderModel.findAll({
          where: { userId: user.id },
        });
        (user as any).oauthProviders = oauthProviders;
      }

      return user!;
    } catch (error) {
      this.logger.error(`Error finding user by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new user from OAuth profile
   */
  async createFromOAuthProfile(profile: OAuthProfile): Promise<User> {
    try {
      // Check if provider combination already exists
      await this.checkUniqueProvider(profile.provider, profile.providerId);

      // Check if email already exists
      const existingUser = await this.findByEmail(profile.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create user
      const user = await this.userModel.create({
        email: profile.email,
        name: profile.name,
        avatar: profile.picture,
        isVerified: true, // OAuth providers typically verify emails
      });

      // Create OAuth provider record
      await this.oauthProviderModel.create({
        provider: profile.provider,
        providerId: profile.providerId,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        userId: user.id,
      });

      // Load OAuth providers for the response
      const oauthProviders = await this.oauthProviderModel.findAll({
        where: { userId: user.id },
      });
      (user as any).oauthProviders = oauthProviders;

      this.logger.log(
        `Created new user from OAuth: ${user.email} via ${profile.provider}`,
      );
      return user;
    } catch (error) {
      this.logger.error(`Error creating user from OAuth profile:`, error);
      throw error;
    }
  }
  /**
   * Check if provider combination is unique
   */
  private async checkUniqueProvider(
    provider: string,
    providerId: string,
    excludeUserId?: string,
  ): Promise<void> {
    const whereClause: any = {
      provider,
      providerId,
    };

    if (excludeUserId) {
      whereClause.userId = { [Op.ne]: excludeUserId };
    }

    const existing = await this.oauthProviderModel.findOne({
      where: whereClause,
    });

    if (existing) {
      throw new ConflictException(
        `This ${provider} account is already linked to another user`,
      );
    }
  }

  /**
   * Create user with email and password
   */
  async createWithEmail(
    email: string,
    password: string,
    name: string,
    userType: UserType,
  ): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = randomUUID();

    return await this.userModel.create({
      id,
      email,
      name,
      password: hashedPassword,
      userType: userType,
      isVerified: false,
    });
  }

  /**
   * Link OAuth provider to existing user
   */
  async linkOAuthProvider(
    userId: string,
    profile: OAuthProfile,
  ): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if provider is already linked
    const existingProvider = await this.oauthProviderModel.findOne({
      where: {
        userId,
        provider: profile.provider,
      },
    });

    if (existingProvider) {
      // Update existing provider
      await existingProvider.update({
        providerId: profile.providerId,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
      });
    } else {
      // Add new provider
      await this.oauthProviderModel.create({
        provider: profile.provider,
        providerId: profile.providerId,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        userId,
      });
    }

    // Update user avatar and name if not set
    const updates: Partial<User> = {};
    if (!user.avatar && profile.picture) {
      updates.avatar = profile.picture;
    }
    if (!user.name && profile.name) {
      updates.name = profile.name;
    }

    if (Object.keys(updates).length > 0) {
      await this.userModel.update(updates, {
        where: { id: userId },
      });
    }
  }

  /**
   * Unlink OAuth provider from user
   */
  async unlinkOAuthProvider(userId: string, provider: string): Promise<void> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const oauthProviders = (user as any).oauthProviders || [];
      const hasPassword = !!user.password;
      const hasOtherProviders = oauthProviders.some(
        (p: any) => p.provider !== provider,
      );

      // Prevent unlinking the only authentication method
      if (!hasPassword && (!hasOtherProviders || oauthProviders.length <= 1)) {
        throw new BadRequestException(
          'Cannot unlink the only authentication method. Please set a password first.',
        );
      }

      await this.oauthProviderModel.destroy({
        where: {
          userId,
          provider,
        },
      });

      this.logger.log(
        `Unlinked OAuth provider ${provider} from user ${user.email}`,
      );
    } catch (error) {
      this.logger.error(`Error unlinking OAuth provider:`, error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'avatar' | 'userType'>>,
  ): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userModel.update(updates, {
      where: { id: userId },
    });

    return this.findById(userId);
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findOne({
      where: { id: userId },
      attributes: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('User does not have a password set');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await this.userModel.update(
      { password: hashedNewPassword },
      { where: { id: userId } },
    );
  }

  /**
   * Set password for OAuth-only users
   */
  async setPassword(userId: string, password: string): Promise<void> {
    const user = await this.userModel.findOne({
      where: { id: userId },
      attributes: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // if (user.password) {
    //   throw new BadRequestException('Password already set');
    // }

    const hashedPassword = await bcrypt.hash(password, 12);
    await this.userModel.update(
      { password: hashedPassword },
      { where: { id: userId } },
    );
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<void> {
    await this.userModel.update(
      { isVerified: true },
      { where: { id: userId } },
    );
  }

  /**
   * Get connected providers for user
   */
  async getConnectedProviders(userId: string): Promise<string[]> {
    const providers = await this.oauthProviderModel.findAll({
      where: { userId },
      attributes: ['provider'],
    });

    return providers.map((p) => p.provider);
  }

  /**
   * Validate user credentials (for local login)
   */
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userModel.findOne({
      where: { email },
      attributes: [
        'id',
        'email',
        'password',
        'name',
        'isVerified',
        'avatar',
        'userType',
      ],
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Remove password from returned user object
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;
    return userWithoutPassword as User;
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // This will also delete associated OAuthProviders due to cascade
    await this.userModel.destroy({
      where: { id: userId },
    });
  }

  async create(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    return this.userModel.create(user);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.sanitizeUser(user);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const [affectedCount, updatedUser] = await this.userModel.update(user, {
      where: { id },
      returning: true,
    });
    if (affectedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.sanitizeUser(updatedUser[0]) ?? '';
  }

  async updateUserType(id: string, user: Partial<User>): Promise<User> {
    const [affectedCount, updatedUser] = await this.userModel.update(user, {
      where: { id },
      returning: true,
    });
    if (affectedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.sanitizeUser(updatedUser[0]) ?? '';
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    if (record) {
      await record.destroy();
    }
  }
  /**
   * Update user's refresh token
   */
  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    // If you decide to store refresh tokens in the database
    await this.userModel.update({ refreshToken }, { where: { id: userId } });
  }

  /**
   * Find user by refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    // If you store hashed refresh tokens in the database
    return this.userModel.findOne({
      where: { refreshToken },
    });
    return null; // Implement if you store refresh tokens
  }
  /**
   * Send email verification
   */
  async sendEmailVerification(
    userId: string,
    verificationToken: string,
  ): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const verificationUrl = `${process.env.BASE_URL}/web2/auth/verify-email?token=${verificationToken}`;

    await this.emailService.sendVerificationEmail(user.email, {
      name: user.name,
      verificationUrl,
      expirationHours: 24, // Token expires in 24 hours
    });
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const loginUrl = `${process.env.BASE_URL}/web2/auth`;

    await this.emailService.sendWelcomeEmail(user.email, {
      name: user.name,
      loginUrl,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }

    const resetUrl = `${process.env.BASE_URL}/web2/auth/reset-password?token=${resetToken}`;

    await this.emailService.sendPasswordResetEmail(user.email, {
      name: user.name,
      resetUrl,
      expirationMinutes: 60, // Token expires in 60 minutes
    });
  }

  /**
   * Send password changed confirmation
   */
  async sendPasswordChangedEmail(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const loginUrl = `${process.env.BASE_URL}/web2/auth`;
    const timestamp = new Date().toLocaleString();

    await this.emailService.sendPasswordChangedEmail(user.email, {
      name: user.name,
      loginUrl,
      timestamp,
    });
  }

  /**
   * Send OAuth linked email
   */
  async sendOAuthLinkedEmail(userId: string, provider: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const timestamp = new Date().toLocaleString();

    await this.emailService.sendOAuthLinkedEmail(user.email, {
      name: user.name,
      provider,
      timestamp,
    });
  }

  /**
   * Send security alert
   */
  async sendSecurityAlert(userId: string, device?: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const timestamp = new Date().toLocaleString();

    await this.emailService.sendSecurityAlertEmail(user.email, {
      name: user.name,
      timestamp,
      device,
    });
  }
}
