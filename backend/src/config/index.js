/**
 * Central configuration aggregator
 */

require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 5000,

  // Canvas configuration
  canvas: require('./canvas.config'),

  // Cache configuration
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    stdTTL: parseInt(process.env.CACHE_DEFAULT_TTL) || 300,
    checkperiod: parseInt(process.env.CACHE_CHECK_PERIOD) || 600,
  },

  // Security configuration
  security: {
    readOnlyMode: process.env.READ_ONLY_MODE !== 'false',
    corsOrigin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
