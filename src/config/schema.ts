// src/config/schema.ts
import { z } from 'zod';

// Схема для IPFS конфигурации
export const ipfsSchema = z.object({
  host: z.string().default('0.0.0.0'),
  tcpPort: z.number().int().positive().default(4001),
  wsPort: z.number().int().positive().default(4002),
});

// Схема для баз данных OrbitDB
export const databasesSchema = z
  .object({
    steps: z.string().default('steps'),
    step_transactions: z.string().default('step_transactions'),
    shipments: z.string().default('shipments'),
    operators: z.string().default('operators'),
    availabilities: z.string().default('availabilities'),
    currencies: z.string().default('currencies'),
    journeys: z.string().default('journeys'),
    pending_multisig_txs: z.string().default('pending_multisig_txs'),
    pending_multisig_tx_witnesses: z
      .string()
      .default('pending_multisig_tx_witnesses'),
  })
  .catchall(z.string());

// Схема для OrbitDB конфигурации
export const orbitdbSchema = z.object({
  bootstrapNodes: z.string().optional(),
  directory: z.string().default('./data/orbitdb'),
  swarmKey: z.string().optional(),
  databases: databasesSchema.default({ offers: 'offers' }),
});

// Database Configuration Schema
export const databaseSchema = z.object({
  path: z.string().default('./database.sqlite'),
  logging: z.boolean().default(false),
});

// JWT Configuration Schema
export const jwtSchema = z.object({
  accessSecret: z.string().default('your-access-secret'),
  refreshSecret: z.string().default('your-refresh-secret'),
  accessExpiration: z.string().default('1d'),
  refreshExpiration: z.string().default('7d'),
});

// OAuth Provider Schema
export const oauthProviderSchema = z.object({
  clientId: z.string().default(''),
  clientSecret: z.string().default(''),
});

// OAuth Configuration Schema
export const oauthSchema = z.object({
  google: oauthProviderSchema.default({}),
  github: oauthProviderSchema.default({}),
  facebook: oauthProviderSchema.default({}),
  twitter: oauthProviderSchema.default({}),
});

// URLs Configuration Schema
export const urlsSchema = z.object({
  frontend: z.string().default('http://localhost:3001'),
  backend: z.string().default('http://localhost:3003'),
});

// CORS Configuration Schema
export const corsSchema = z.object({
  origins: z.string().default('http://localhost:3033'),
});

// Security Configuration Schema
export const securitySchema = z.object({
  bcryptRounds: z.number().default(12),
  rateLimit: z
    .object({
      max: z.number().default(100),
      windowMs: z.number().default(900000), // 15 minutes
    })
    .default({}),
  session: z
    .object({
      secret: z.string().default('your-session-secret'),
      maxAge: z.number().default(86400000), // 24 hours
    })
    .default({}),
});

// Email Configuration Schema
export const emailSchema = z.object({
  host: z.string().default(''),
  port: z.number().default(587),
  user: z.string().default(''),
  password: z.string().default(''),
  from: z.string().default('noreply@yourapp.com'),
});

// Features Configuration Schema
export const featuresSchema = z.object({
  emailVerification: z.boolean().default(false),
  oauth: z.boolean().default(true),
  localAuth: z.boolean().default(true),
});

// Extended App Configuration Schema with Auth
export const appConfigSchema = z.object({
  appName: z.string().default('ShipShift'),
  baseUrl: z.string().default('http://localhost:3001'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.number().int().positive().default(3003),
  runMode: z.enum(['node', 'bootstrap']).default('node'),
  ipfs: ipfsSchema.default({}),
  orbitdb: orbitdbSchema.default({}),
  debug: z.string().default(''),
  // New authentication and database configurations
  database: databaseSchema.default({}),
  jwt: jwtSchema.default({}),
  oauth: oauthSchema.default({}),
  urls: urlsSchema.default({}),
  cors: corsSchema.default({}),
  security: securitySchema.default({}),
  email: emailSchema.default({}),
  features: featuresSchema.default({}),
});

// Схема для общей конфигурации
export const configSchema = z.object({
  solution: appConfigSchema,
  data: z.array(z.any()).default([]),
});

// Схема для минимальной конфигурации bootstrap ноды с учетом всех полей
export const bootstrapConfigSchema = appConfigSchema.extend({
  runMode: z.literal('bootstrap'),
  // Остальные поля наследуются от appConfigSchema со значениями по умолчанию
});

// Типы на основе схем
export type IpfsConfig = z.infer<typeof ipfsSchema>;
export type OrbitdbConfig = z.infer<typeof orbitdbSchema>;
export type DatabasesConfig = z.infer<typeof databasesSchema>;
export type DatabaseConfig = z.infer<typeof databaseSchema>;
export type JwtConfig = z.infer<typeof jwtSchema>;
export type OAuthConfig = z.infer<typeof oauthSchema>;
export type OAuthProviderConfig = z.infer<typeof oauthProviderSchema>;
export type UrlsConfig = z.infer<typeof urlsSchema>;
export type CorsConfig = z.infer<typeof corsSchema>;
export type SecurityConfig = z.infer<typeof securitySchema>;
export type EmailConfig = z.infer<typeof emailSchema>;
export type FeaturesConfig = z.infer<typeof featuresSchema>;
export type AppConfig = z.infer<typeof appConfigSchema>;
export type Config = z.infer<typeof configSchema>;
export type BootstrapConfig = z.infer<typeof bootstrapConfigSchema>;
