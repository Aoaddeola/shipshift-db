// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailVerificationContext {
  name: string;
  verificationUrl: string;
  expirationHours: number;
}

export interface PasswordResetContext {
  name: string;
  resetUrl: string;
  expirationMinutes: number;
}

export interface WelcomeContext {
  name: string;
  loginUrl: string;
}

export interface PasswordChangedContext {
  name: string;
  loginUrl: string;
  timestamp: string;
}

export interface OAuthLinkedContext {
  name: string;
  provider: string;
  timestamp: string;
}

export interface SecurityAlertContext {
  name: string;
  timestamp: string;
  device?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly fromEmail: string;
  private readonly appName: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.fromEmail =
      this.configService.get('EMAIL_FROM') || 'noreply@yourapp.com';
    this.appName = this.configService.get('APP_NAME') || 'Your App';
    this.baseUrl =
      this.configService.get('BASE_URL') || 'http://localhost:3000';

    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get('EMAIL_HOST') || process.env.EMAIL_HOST;
    const port = parseInt(
      this.configService.get('EMAIL_PORT') || process.env.EMAIL_PORT!,
    );
    const secure = this.configService.get('EMAIL_SECURE') === 'true';
    const user =
      this.configService.get('EMAIL_USER') || process.env.EMAIL_USER!;
    const pass =
      this.configService.get('EMAIL_PASS') || process.env.EMAIL_PASS!;

    // For development without SMTP credentials
    if (!host || !user || !pass) {
      this.logger.warn(
        'SMTP credentials not found. Using development transport.',
      );
      this.setupDevelopmentTransport();
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    } as nodemailer.TransportOptions);

    this.verifyTransporter();
  }

  private async setupDevelopmentTransport() {
    try {
      // Create a test account with ethereal.email for development
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.logger.log(`Development email transport configured`);
      this.logger.log(
        `Ethereal credentials: ${testAccount.user} / ${testAccount.pass}`,
      );

      await this.verifyTransporter();
    } catch (error) {
      this.logger.error('Failed to create test email account:', error);
      this.setupNullTransport();
    }
  }

  private setupNullTransport() {
    // Null transport for when email is not configured
    this.transporter = nodemailer.createTransport({
      send: (mail, callback) => {
        this.logger.log('Email sending disabled - no transport configured');
        this.logger.log(`Would send email to: ${mail.data.to}`);
        this.logger.log(`Subject: ${mail.data.subject}`);
        callback(null, { messageId: 'null-transport' });
      },
    } as any);
  }

  private async verifyTransporter() {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('Failed to verify SMTP connection:', error);
    }
  }

  /**
   * Send email verification message
   */
  async sendVerificationEmail(
    to: string,
    context: EmailVerificationContext,
  ): Promise<boolean> {
    const subject = `Verify your email for ${this.appName}`;
    const html = this.getVerificationTemplate(context);

    return this.sendEmail(to, subject, html);
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(
    to: string,
    context: WelcomeContext,
  ): Promise<boolean> {
    const subject = `Welcome to ${this.appName}!`;
    const html = this.getWelcomeTemplate(context);

    return this.sendEmail(to, subject, html);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    context: PasswordResetContext,
  ): Promise<boolean> {
    const subject = `Reset your password for ${this.appName}`;
    const html = this.getPasswordResetTemplate(context);

    return this.sendEmail(to, subject, html);
  }

  /**
   * Send password changed confirmation
   */
  async sendPasswordChangedEmail(
    to: string,
    context: PasswordChangedContext,
  ): Promise<boolean> {
    const subject = `Your ${this.appName} password has been changed`;
    const html = this.getPasswordChangedTemplate(context);

    return this.sendEmail(to, subject, html);
  }

  /**
   * Send OAuth provider linked email
   */
  async sendOAuthLinkedEmail(
    to: string,
    context: OAuthLinkedContext,
  ): Promise<boolean> {
    const subject = `New login method added to your ${this.appName} account`;
    const html = this.getOAuthLinkedTemplate(context);

    return this.sendEmail(to, subject, html);
  }

  /**
   * Send account security alert
   */
  async sendSecurityAlertEmail(
    to: string,
    context: SecurityAlertContext,
  ): Promise<boolean> {
    const subject = `Security alert for your ${this.appName} account`;
    const html = this.getSecurityAlertTemplate(context);

    return this.sendEmail(to, subject, html);
  }

  /**
   * Generic email sender using Nodemailer
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: this.fromEmail,
        to,
        subject,
        html,
        text: this.htmlToText(html), // Fallback text version
      };

      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent successfully to ${to}`);
      this.logger.debug(`Message ID: ${result.messageId}`);

      // If using ethereal.email in development, log the preview URL
      const previewUrl = nodemailer.getTestMessageUrl(result);
      if (previewUrl) {
        this.logger.log(`Preview URL: ${previewUrl}`);
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Convert HTML to plain text for email clients that don't support HTML
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Email Templates
   */
  private getVerificationTemplate(context: EmailVerificationContext): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <h2>Hello ${context.name},</h2>
      <p>Thank you for signing up for ${this.appName}! To complete your registration, please verify your email address by clicking the button below:</p>
      
      <p style="text-align: center;">
        <a href="${context.verificationUrl}" class="button">Verify Email Address</a>
      </p>
      
      <p>This verification link will expire in ${context.expirationHours} hours.</p>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p><a href="${context.verificationUrl}">${context.verificationUrl}</a></p>
      
      <p>If you didn't create an account with us, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getWelcomeTemplate(context: WelcomeContext): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10B981; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .button { background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ${this.appName}!</h1>
    </div>
    <div class="content">
      <h2>Hello ${context.name},</h2>
      <p>Your account has been successfully verified and you're now ready to start using ${this.appName}!</p>
      
      <p style="text-align: center;">
        <a href="${context.loginUrl}" class="button">Get Started</a>
      </p>
      
      <p>Here's what you can do now:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Explore our features</li>
        <li>Connect with other users</li>
      </ul>
      
      <p>If you have any questions, feel free to reply to this email or visit our help center.</p>
      
      <p>We're excited to have you on board!</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getPasswordResetTemplate(context: PasswordResetContext): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .button { background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .warning { background: #FEF3C7; padding: 15px; border-radius: 6px; border-left: 4px solid #F59E0B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <h2>Hello ${context.name},</h2>
      <p>We received a request to reset your password for your ${this.appName} account.</p>
      
      <p style="text-align: center;">
        <a href="${context.resetUrl}" class="button">Reset Password</a>
      </p>
      
      <p>This password reset link will expire in ${context.expirationMinutes} minutes.</p>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p><a href="${context.resetUrl}">${context.resetUrl}</a></p>
      
      <div class="warning">
        <p><strong>Important:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getPasswordChangedTemplate(context: PasswordChangedContext): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #6B7280; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .button { background: #6B7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .info { background: #DBEAFE; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Changed</h1>
    </div>
    <div class="content">
      <h2>Hello ${context.name},</h2>
      <p>Your ${this.appName} password was successfully changed on ${context.timestamp}.</p>
      
      <p style="text-align: center;">
        <a href="${context.loginUrl}" class="button">Login to Your Account</a>
      </p>
      
      <div class="info">
        <p><strong>Security Notice:</strong> If you didn't make this change, please contact our support team immediately.</p>
      </div>
      
      <p>For security reasons, this change was logged from our system. If this was you, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getOAuthLinkedTemplate(context: OAuthLinkedContext): string {
    const providerNames: Record<string, string> = {
      google: 'Google',
      github: 'GitHub',
      facebook: 'Facebook',
      twitter: 'Twitter',
    };

    const providerName = providerNames[context.provider] || context.provider;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .info { background: #F3E8FF; padding: 15px; border-radius: 6px; border-left: 4px solid #8B5CF6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Login Method Added</h1>
    </div>
    <div class="content">
      <h2>Hello ${context.name},</h2>
      <p>A new login method has been added to your ${this.appName} account.</p>
      
      <div class="info">
        <p><strong>Provider:</strong> ${providerName}</p>
        <p><strong>Date:</strong> ${context.timestamp}</p>
      </div>
      
      <p>You can now use ${providerName} to sign in to your account.</p>
      
      <p>If you didn't add this login method, please secure your account immediately by:</p>
      <ul>
        <li>Changing your password</li>
        <li>Reviewing your connected accounts</li>
        <li>Contacting support if you suspect unauthorized access</li>
      </ul>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getSecurityAlertTemplate(context: SecurityAlertContext): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .alert { background: #FECACA; padding: 15px; border-radius: 6px; border-left: 4px solid #DC2626; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Security Alert</h1>
    </div>
    <div class="content">
      <h2>Hello ${context.name},</h2>
      
      <div class="alert">
        <p><strong>We detected a new sign-in to your ${this.appName} account.</strong></p>
      </div>
      
      <p><strong>Time:</strong> ${context.timestamp}</p>
      ${context.device ? `<p><strong>Device:</strong> ${context.device}</p>` : ''}
      
      <p>If this was you, you can safely ignore this email.</p>
      
      <p>If you don't recognize this activity, please:</p>
      <ul>
        <li>Change your password immediately</li>
        <li>Review your account security settings</li>
        <li>Contact our support team</li>
      </ul>
      
      <p>For your security, we recommend enabling two-factor authentication and regularly reviewing your account activity.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
