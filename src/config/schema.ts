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
    offers: z.string().default('offers'),
  })
  .catchall(z.string());

// Схема для OrbitDB конфигурации
export const orbitdbSchema = z.object({
  bootstrapNodes: z.string().optional(),
  directory: z.string().default('./data/orbitdb'),
  swarmKey: z.string().optional(),
  databases: databasesSchema.default({ offers: 'offers' }),
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
  origins: z.string().default('http://localhost:3003'),
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

// RabbitMQ Configuration Schema
export const rabbitmqSchema = z.object({
  uri: z.string().default('amqp://localhost:5672'),
  exchange: z.string().default('app.events'),
  directExchange: z.string().default('app.direct'),
  prefetchCount: z.number().int().positive().default(10),
  reconnectDelay: z.number().int().positive().default(5000),
  heartbeat: z.number().int().positive().default(60),
  timeout: z.number().int().positive().default(30000),
});

// Add to your existing schema.ts
export const openProjectSchema = z.object({
  enabled: z.boolean().default(false),
  url: z.string().url().default('https://your-openproject-instance.com'),
  apiKey: z.string().default(''),
  projectId: z.string().default(''),
  typeId: z.string().default('7'), // Bug type
  statusId: z.string().default('1'), // New status
  severityFieldId: z.string().default(''), // Custom field ID for severity
  priorityMapping: z
    .object({
      low: z.string().default('3'),
      normal: z.string().default('4'),
      high: z.string().default('5'),
      immediate: z.string().default('6'),
    })
    .default({}),
  maxFileSize: z.number().int().positive().default(10485760), // 10MB
  maxFiles: z.number().int().positive().default(10),
  uploadTimeout: z.number().int().positive().default(30000), // 30 seconds
});

// Extended App Configuration Schema with Auth
export const appConfigSchema = z.object({
  appName: z.string().default('ShipShift'),
  baseUrl: z.string().default('http://localhost:3001'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.number().int().positive().default(3000),
  runMode: z.enum(['node', 'bootstrap']).default('node'),
  ipfs: ipfsSchema.default({}),
  orbitdb: orbitdbSchema.default({}),
  debug: z.string().default(''),
  rabbitmq: rabbitmqSchema.default({}),
  // New authentication and database configurations
  jwt: jwtSchema.default({}),
  oauth: oauthSchema.default({}),
  urls: urlsSchema.default({}),
  cors: corsSchema.default({}),
  security: securitySchema.default({}),
  email: emailSchema.default({}),
  features: featuresSchema.default({}),
  openProject: openProjectSchema.default({}),
});

// Схема для минимальной конфигурации bootstrap ноды с учетом всех полей
export const bootstrapConfigSchema = appConfigSchema.extend({
  runMode: z.literal('bootstrap'),
  // Остальные поля наследуются от appConfigSchema со значениями по умолчанию
});

// Схема для общей конфигурации
export const configSchema = z.object({
  solution: appConfigSchema,
  data: z.array(z.any()).default([]),
});
// Add the type
export type OpenProjectConfig = z.infer<typeof openProjectSchema>;
// Типы на основе схем
export type IpfsConfig = z.infer<typeof ipfsSchema>;
export type OrbitdbConfig = z.infer<typeof orbitdbSchema>;
export type DatabasesConfig = z.infer<typeof databasesSchema>;
export type AppConfig = z.infer<typeof appConfigSchema>;
export type Config = z.infer<typeof configSchema>;
export type BootstrapConfig = z.infer<typeof bootstrapConfigSchema>;
export type JwtConfig = z.infer<typeof jwtSchema>;
export type OAuthConfig = z.infer<typeof oauthSchema>;
export type OAuthProviderConfig = z.infer<typeof oauthProviderSchema>;
export type UrlsConfig = z.infer<typeof urlsSchema>;
export type CorsConfig = z.infer<typeof corsSchema>;
export type SecurityConfig = z.infer<typeof securitySchema>;
export type EmailConfig = z.infer<typeof emailSchema>;
export type FeaturesConfig = z.infer<typeof featuresSchema>;
export type RabbitMQConfig = z.infer<typeof rabbitmqSchema>;
