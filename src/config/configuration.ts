// src/config/configuration.ts
import { AppConfig } from './schema.js';
import * as crypto from 'crypto';

export default (): { solution: AppConfig; data: any[] } => {
  return {
    solution: {
      appName: process.env.APP_NAME || '',
      baseUrl: process.env.BASE_URL || 'http://localhost:3001',
      nodeEnv:
        (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
        'development',
      port: parseInt(process.env.PORT || '8033', 10),
      runMode: (process.env.RUN_MODE as 'node' | 'bootstrap') || 'node',
      debug: process.env.DEBUG || '',
      ipfs: {
        host: process.env.IPFS_HOST || '0.0.0.0',
        tcpPort: parseInt(process.env.TCP_PORT || '4001', 10),
        wsPort: parseInt(process.env.WS_PORT || '4002', 10),
      },
      orbitdb: {
        bootstrapNodes: process.env.BOOTSTRAP_NODES,
        directory:
          process.env.ORBITDB_DIRECTORY || `./data/${crypto.randomUUID()}`,
        swarmKey: process.env.SWARM_KEY,
        databases: {
          availabilities:
            process.env.AVAILABILITIES_DATABASE || 'availabilities',
          badges: process.env.BADGES_DATABASE || 'badges',
          colonies: process.env.COLONIES_DATABASE || 'colonies',
          journeys: process.env.JOURNEYS_DATABASE || 'journeys',
          operators: process.env.OPERATORS_DATABASE || 'operators',
          pending_multisig_tx_witnesses:
            process.env.PENDING_MULTISIG_TX_WITNESSES_DATABASE ||
            'pending_multisig_tx_witnesses',
          pending_multisig_txs:
            process.env.PENDING_MULTISIG_TXS_DATABASE || 'pending_multisig_txs',
          steps: process.env.STEPS_DATABASE || 'steps',
          step_transactions:
            process.env.STEP_TRANSACTIONS_DATABASE || 'step_transactions',
          shipments: process.env.SHIPMENTS_DATABASE || 'shipments',
          currencies: process.env.CURRENCIES_DATABASE || 'currencies',
        },
      },
      // New authentication and database configurations
      database: {
        path: process.env.DB_PATH || './database.sqlite',
        logging: process.env.DB_LOGGING === 'true',
      },
      jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
        accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
      },
      oauth: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        },
        github: {
          clientId: process.env.GITHUB_CLIENT_ID || '',
          clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        },
        facebook: {
          clientId: process.env.FACEBOOK_CLIENT_ID || '',
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
        },
        twitter: {
          clientId: process.env.TWITTER_CLIENT_ID || '',
          clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
        },
      },
      urls: {
        frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
        backend: process.env.BACKEND_URL || 'http://localhost:8033',
      },
      cors: {
        origins: process.env.CORS_ORIGINS || 'http://localhost:3000',
      },
      security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
        rateLimit: {
          max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        },
        session: {
          secret: process.env.SESSION_SECRET || 'your-session-secret',
          maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
        },
      },
      email: {
        host: process.env.EMAIL_HOST || '',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        user: process.env.EMAIL_USER || '',
        password: process.env.EMAIL_PASSWORD || '',
        from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
      },
      features: {
        emailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
        oauth: process.env.ENABLE_OAUTH !== 'false', // default true
        localAuth: process.env.ENABLE_LOCAL_AUTH !== 'false', // default true
      },
    },
    data: [],
  };
};
