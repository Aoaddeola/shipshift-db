export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context?: Record<string, any>;
}

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
