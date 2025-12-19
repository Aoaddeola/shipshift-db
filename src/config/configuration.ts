import { AppConfig } from './schema.js';

export default (): AppConfig => {
  return {
    nodeEnv: process.env.NODE_ENV as 'development' | 'production' | 'test',
    port: parseInt(process.env.PORT || '3000', 10),
    runMode: (process.env.RUN_MODE as 'node' | 'bootstrap') || 'node',
    debug: process.env.DEBUG || '',
    ipfs: {
      host: process.env.IPFS_HOST || '0.0.0.0',
      tcpPort: parseInt(process.env.TCP_PORT || '4001', 10),
      wsPort: parseInt(process.env.WS_PORT || '4002', 10),
    },
    openProject: {
      enabled: process.env.OPENPROJECT_ENABLED === 'true',
      url:
        process.env.OPENPROJECT_URL || 'https://your-openproject-instance.com',
      apiKey: process.env.OPENPROJECT_API_KEY || '',
      projectId: process.env.OPENPROJECT_PROJECT_ID || '',
      typeId: process.env.OPENPROJECT_TYPE_ID || '1',
      statusId: process.env.OPENPROJECT_STATUS_ID || '1',
      severityFieldId: process.env.OPENPROJECT_SEVERITY_FIELD_ID || '',
      priorityMapping: {
        low: process.env.OPENPROJECT_PRIORITY_LOW || '3',
        normal: process.env.OPENPROJECT_PRIORITY_NORMAL || '4',
        high: process.env.OPENPROJECT_PRIORITY_HIGH || '5',
        immediate: process.env.OPENPROJECT_PRIORITY_IMMEDIATE || '6',
      },
      maxFileSize: parseInt(
        process.env.OPENPROJECT_MAX_FILE_SIZE || '10485760',
        10,
      ),
      maxFiles: parseInt(process.env.OPENPROJECT_MAX_FILES || '10', 10),
      uploadTimeout: parseInt(
        process.env.OPENPROJECT_UPLOAD_TIMEOUT || '30000',
        10,
      ),
    },
    orbitdb: {
      bootstrapNodes: process.env.BOOTSTRAP_NODES,
      directory:
        process.env.ORBITDB_DIRECTORY || `./data/${crypto.randomUUID()}`,
      swarmKey: process.env.SWARM_KEY,
      databases: {
        offers: process.env.OFFERS_DATABASE || 'offers',
      },
    },
    // New authentication and database configurations
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
      frontend: process.env.FRONTEND_URL || 'http://localhost:3001',
      backend: process.env.BACKEND_URL || 'http://localhost:8033',
    },
    cors: {
      origins: process.env.CORS_ORIGINS || 'http://localhost:3001',
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
    // RabbitMQ configuration
    rabbitmq: {
      uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
      exchange: process.env.RABBITMQ_EXCHANGE || 'app.events',
      directExchange: process.env.RABBITMQ_DIRECT_EXCHANGE || 'app.direct',
      prefetchCount: parseInt(process.env.RABBITMQ_PREFETCH_COUNT || '10', 10),
      reconnectDelay: parseInt(
        process.env.RABBITMQ_RECONNECT_DELAY || '5000',
        10,
      ),
      heartbeat: parseInt(process.env.RABBITMQ_HEARTBEAT || '60', 10),
      timeout: parseInt(process.env.RABBITMQ_TIMEOUT || '30000', 10),
    },
    features: {
      emailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
      oauth: process.env.ENABLE_OAUTH !== 'false', // default true
      localAuth: process.env.ENABLE_LOCAL_AUTH !== 'false', // default true
    },
    appName: process.env.APP_NAME || 'ShipShift',
    baseUrl: process.env.APP_NAME || 'http://localhost:3001',
  };
};
