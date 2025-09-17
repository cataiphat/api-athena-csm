import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Sample token for development
  sampleToken: process.env.SAMPLE_TOKEN || 'sample-token-for-development',

  // Email configuration
  email: {
    gmail: {
      clientId: process.env.GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
      redirectUri: process.env.GMAIL_REDIRECT_URI || '',
      refreshToken: process.env.GMAIL_REFRESH_TOKEN || '',
    },
  },

  // Social media integrations
  integrations: {
    facebook: {
      appId: process.env.FACEBOOK_APP_ID || '',
      appSecret: process.env.FACEBOOK_APP_SECRET || '',
      verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || '',
    },
    zalo: {
      appId: process.env.ZALO_APP_ID || '',
      appSecret: process.env.ZALO_APP_SECRET || '',
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
    },
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },

  // Business rules
  business: {
    ticket: {
      autoCloseAfterDays: 10,
      slaViolationCheckIntervalMinutes: 1,
    },
    sla: {
      defaultResponseTimeHours: 24,
      defaultResolutionTimeHours: 72,
    },
  },
};
