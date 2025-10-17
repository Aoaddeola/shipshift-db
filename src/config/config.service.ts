// src/config/app-config.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppConfig,
  DatabaseConfig,
  JwtConfig,
  OAuthConfig,
  UrlsConfig,
  SecurityConfig,
  EmailConfig,
  FeaturesConfig,
} from './schema.js';

@Injectable()
export class AppConfigService {
  private keyPath = './keys/libp2p-ed25519.key';

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  // Get the entire app configuration
  private get appConfig(): AppConfig {
    return this.configService.get<AppConfig>('solution')!;
  }

  // Get nested configurations
  private get databaseConfig(): DatabaseConfig {
    return this.appConfig.database;
  }

  private get jwtConfig(): JwtConfig {
    return this.appConfig.jwt;
  }

  private get oauthConfig(): OAuthConfig {
    return this.appConfig.oauth;
  }

  private get urlsConfig(): UrlsConfig {
    return this.appConfig.urls;
  }

  private get securityConfig(): SecurityConfig {
    return this.appConfig.security;
  }

  private get emailConfig(): EmailConfig {
    return this.appConfig.email;
  }

  private get featuresConfig(): FeaturesConfig {
    return this.appConfig.features;
  }

  // Existing IPFS/OrbitDB getters
  get nodeEnv(): string {
    return this.appConfig.nodeEnv;
  }

  get port(): number {
    return this.appConfig.port;
  }

  get ipfsHost(): string {
    return this.appConfig.ipfs.host;
  }

  get ipfsTcpPort(): number {
    return this.appConfig.ipfs.tcpPort;
  }

  get ipfsWsPort(): number {
    return this.appConfig.ipfs.wsPort;
  }

  get orbitdbDirectory(): string {
    return this.appConfig.orbitdb.directory;
  }

  get swarmKey(): Uint8Array {
    return Buffer.from(this.appConfig.orbitdb.swarmKey || '', 'base64');
  }

  get bootstrapNodes(): string[] | undefined {
    return this.appConfig.orbitdb.bootstrapNodes?.split(',');
  }

  get databases(): Record<string, string> {
    return this.appConfig.orbitdb.databases;
  }

  get runMode(): string {
    return this.appConfig.runMode;
  }

  get debug(): string {
    return this.appConfig.debug;
  }

  // Database Configuration
  get databasePath(): string {
    return this.databaseConfig.path;
  }

  get databaseLogging(): boolean {
    return this.databaseConfig.logging;
  }

  // JWT Configuration
  get jwtAccessSecret(): string {
    return this.jwtConfig.accessSecret;
  }

  get jwtRefreshSecret(): string {
    return this.jwtConfig.refreshSecret;
  }

  get jwtAccessExpiration(): string {
    return this.jwtConfig.accessExpiration;
  }

  get jwtRefreshExpiration(): string {
    return this.jwtConfig.refreshExpiration;
  }

  // OAuth Configuration - Google
  get googleClientId(): string {
    return this.oauthConfig.google.clientId;
  }

  // OAuth Configuration - Google
  get appName(): string {
    return this.appConfig.appName;
  }

  get googleClientSecret(): string {
    return this.oauthConfig.google.clientSecret;
  }

  // OAuth Configuration - GitHub
  get githubClientId(): string {
    return this.oauthConfig.github.clientId;
  }

  get githubClientSecret(): string {
    return this.oauthConfig.github.clientSecret;
  }

  // OAuth Configuration - Facebook
  get facebookClientId(): string {
    return this.oauthConfig.facebook.clientId;
  }

  get facebookClientSecret(): string {
    return this.oauthConfig.facebook.clientSecret;
  }

  // OAuth Configuration - Twitter
  get twitterClientId(): string {
    return this.oauthConfig.twitter.clientId;
  }

  get twitterClientSecret(): string {
    return this.oauthConfig.twitter.clientSecret;
  }

  // URLs Configuration
  get frontendUrl(): string {
    return this.urlsConfig.frontend;
  }

  get backendUrl(): string {
    return this.urlsConfig.backend;
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

  // CORS Configuration
  get corsOrigins(): string[] {
    return this.appConfig.cors.origins
      .split(',')
      .map((origin) => origin.trim());
  }

  // Security Configuration
  get bcryptRounds(): number {
    return this.securityConfig.bcryptRounds;
  }

  get rateLimitMax(): number {
    return this.securityConfig.rateLimit.max;
  }

  get rateLimitWindow(): number {
    return this.securityConfig.rateLimit.windowMs;
  }

  get sessionSecret(): string {
    return this.securityConfig.session.secret;
  }

  get sessionMaxAge(): number {
    return this.securityConfig.session.maxAge;
  }

  // Email Configuration
  get emailHost(): string {
    return this.emailConfig.host;
  }

  get emailPort(): number {
    return this.emailConfig.port;
  }

  get emailUser(): string {
    return this.emailConfig.user;
  }

  get emailPassword(): string {
    return this.emailConfig.password;
  }

  get emailFrom(): string {
    return this.emailConfig.from;
  }

  // Feature Flags
  get enableEmailVerification(): boolean {
    return this.featuresConfig.emailVerification;
  }

  get enableOAuth(): boolean {
    return this.featuresConfig.oauth;
  }

  get enableLocalAuth(): boolean {
    return this.featuresConfig.localAuth;
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
}
