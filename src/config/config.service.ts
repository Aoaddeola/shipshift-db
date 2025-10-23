// src/config/app-config.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './schema.js';

@Injectable()
export class AppConfigService {
  private keyPath = './keys/libp2p-ed25519.key';

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  get nodeEnv(): string {
    return this.configService.get<string>('nodeEnv') || 'development';
  }

  get port(): number {
    return this.configService.get<number>('port') || 3000;
  }

  get ipfsHost(): string {
    return (
      this.configService.get<AppConfig['ipfs']>('ipfs')?.host || '127.0.0.1'
    );
  }

  get ipfsTcpPort(): number {
    return this.configService.get<AppConfig['ipfs']>('ipfs')!.tcpPort;
  }

  get ipfsWsPort(): number {
    return this.configService.get<AppConfig['ipfs']>('ipfs')!.wsPort;
  }

  get orbitdbDirectory(): string {
    return (
      this.configService.get<AppConfig['orbitdb']>('orbitdb')?.directory ||
      './orbitdb'
    );
  }

  get swarmKey(): Uint8Array {
    return Buffer.from(
      this.configService.get<AppConfig['orbitdb']>('orbitdb')!.swarmKey || '',
      'base64',
    );
  }

  get bootstrapNodes(): string[] | undefined {
    return this.configService
      .get<AppConfig['orbitdb']>('orbitdb')
      ?.bootstrapNodes?.split(',');
  }

  get databases(): Record<string, string> {
    return (
      this.configService.get<AppConfig['orbitdb']>('orbitdb')?.databases || {}
    );
  }

  // // Get the entire app configuration (if still needed internally)
  // private get appConfig(): AppConfig {
  //   const config = this.configService.get<AppConfig>('solution');
  //   if (!config) {
  //     throw new Error('Configuration key "solution" not found');
  //   }
  //   return config;
  // }

  get runMode(): string {
    return this.configService.get<AppConfig['runMode']>('runMode')!;
  }

  get debug(): string {
    return this.configService.get<AppConfig['debug']>('debug')!;
  }

  // JWT Configuration
  get jwtAccessSecret(): string {
    return this.configService.get<AppConfig['jwt']>('jwt')!.accessSecret || '';
  }

  get jwtRefreshSecret(): string {
    return this.configService.get<AppConfig['jwt']>('jwt')!.refreshSecret || '';
  }

  get jwtAccessExpiration(): string {
    return (
      this.configService.get<AppConfig['jwt']>('jwt')!.accessExpiration || ''
    );
  }

  get jwtRefreshExpiration(): string {
    return (
      this.configService.get<AppConfig['jwt']>('jwt')!.refreshExpiration || ''
    );
  }

  // OAuth Configuration - Google
  get googleClientId(): string {
    return (
      this.configService.get<AppConfig['oauth']>('oauth')!.google.clientId || ''
    );
  }

  get appName(): string {
    return this.configService.get<AppConfig['appName']>('appName')!;
  }

  get googleClientSecret(): string {
    return this.configService.get<AppConfig['oauth']>('oauth')!.google
      .clientSecret;
  }

  // OAuth Configuration - GitHub
  get githubClientId(): string {
    return this.configService.get<AppConfig['oauth']>('oauth')!.github.clientId;
  }

  get githubClientSecret(): string {
    return this.configService.get<AppConfig['oauth']>('oauth')!.github
      .clientSecret;
  }

  // OAuth Configuration - Facebook
  get facebookClientId(): string {
    return this.configService.get<AppConfig['oauth']>('oauth')!.facebook
      .clientId;
  }

  get facebookClientSecret(): string {
    return this.configService.get<AppConfig['oauth']>('oauth')!.facebook
      .clientSecret;
  }

  // OAuth Configuration - Twitter
  get twitterClientId(): string {
    return this.configService.get<AppConfig['oauth']>('oauth')!.twitter
      .clientId;
  }

  get twitterClientSecret(): string {
    return this.configService.get<AppConfig['oauth']>('oauth')!.twitter
      .clientSecret;
  }

  // URLs Configuration
  get frontendUrl(): string {
    return this.configService.get<AppConfig['urls']>('urls')!.frontend;
  }

  get backendUrl(): string {
    return this.configService.get<AppConfig['urls']>('urls')!.backend;
  }

  // OAuth Redirect URLs
  get googleRedirectUri(): string {
    return `${this.backendUrl}/api/auth/oauth/google/callback`;
  }

  get githubRedirectUri(): string {
    return `${this.backendUrl}/api/auth/oauth/github/callback`;
  }

  get facebookRedirectUri(): string {
    return `${this.backendUrl}/api/auth/oauth/facebook/callback`;
  }

  // Security Configuration
  get bcryptRounds(): number {
    return this.configService.get<AppConfig['security']>('security')!
      .bcryptRounds;
  }

  get rateLimitMax(): number {
    return this.configService.get<AppConfig['security']>('security')!.rateLimit
      .max;
  }

  get rateLimitWindow(): number {
    return this.configService.get<AppConfig['security']>('security')!.rateLimit
      .windowMs;
  }

  get sessionSecret(): string {
    return this.configService.get<AppConfig['security']>('security')!.session
      .secret;
  }

  get sessionMaxAge(): number {
    return this.configService.get<AppConfig['security']>('security')!.session
      .maxAge;
  }

  // Email Configuration
  get emailHost(): string {
    return this.configService.get<AppConfig['email']>('email')!.host;
  }

  get emailPort(): number {
    return this.configService.get<AppConfig['email']>('email')!.port;
  }

  get emailUser(): string {
    return this.configService.get<AppConfig['email']>('email')!.user;
  }

  get emailPassword(): string {
    return this.configService.get<AppConfig['email']>('email')!.password;
  }

  get emailFrom(): string {
    return this.configService.get<AppConfig['email']>('email')!.from;
  }

  // Feature Flags
  get enableEmailVerification(): boolean {
    return this.configService.get<AppConfig['features']>('features')!
      .emailVerification;
  }

  get enableOAuth(): boolean {
    return this.configService.get<AppConfig['features']>('features')!.oauth;
  }

  get enableLocalAuth(): boolean {
    return this.configService.get<AppConfig['features']>('features')!.localAuth;
  }

  // Utility methods
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get isBootstrapMode(): boolean {
    return this.runMode === 'bootstrap';
  }

  get isNodeMode(): boolean {
    return this.runMode === 'node';
  }
  ƒ;
}
