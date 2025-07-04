import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  databaseUrl: process.env.DATABASE_URL || '',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key_for_development',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
  },
  
  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'EGX Pilot Advisor <noreply@egxpilot.com>',
  },
  
  // Frontend Configuration
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:8081',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:8080,http://localhost:8081',
  },
  
  // Yahoo Finance Configuration
  yahooFinance: {
    rateLimit: parseInt(process.env.YAHOO_FINANCE_RATE_LIMIT || '100'),
    timeout: parseInt(process.env.YAHOO_FINANCE_TIMEOUT || '10000'),
  },
  
  // Cache Configuration
  cache: {
    ttlQuotes: parseInt(process.env.CACHE_TTL_QUOTES || '30000'), // 30 seconds
    ttlHistorical: parseInt(process.env.CACHE_TTL_HISTORICAL || '300000'), // 5 minutes
    ttlAnalysis: parseInt(process.env.CACHE_TTL_ANALYSIS || '600000'), // 10 minutes
  },
  
  // Market Trading Hours (Cairo Time)
  market: {
    openHour: parseInt(process.env.MARKET_OPEN_HOUR || '10'),
    closeHour: parseInt(process.env.MARKET_CLOSE_HOUR || '14'),
    closeMinute: parseInt(process.env.MARKET_CLOSE_MINUTE || '30'),
    tradingDays: process.env.MARKET_DAYS?.split(',').map(Number) || [0, 1, 2, 3, 4], // Sunday to Thursday
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    max: parseInt(process.env.API_RATE_LIMIT_MAX || '100'), // requests per window
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
  
  // Admin Configuration
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@egxpilot.com',
    systemEmailEnabled: process.env.SYSTEM_EMAIL_ENABLED === 'true',
  },
  
  // WebSocket Configuration
  websocket: {
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '60000'),
    pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000'),
  },
};

// Validation
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

console.log('✅ Configuration loaded successfully');
