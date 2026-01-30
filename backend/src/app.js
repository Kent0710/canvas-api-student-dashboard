const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const logger = require('./config/logger.config');
const cacheService = require('./services/cache/cacheService');

// Import middleware
const requestLogger = require('./middleware/requestLogger.middleware');
const rateLimiter = require('./middleware/rateLimiter.middleware');
const readOnly = require('./middleware/readOnly.middleware');
const authenticate = require('./middleware/auth.middleware');
const errorHandler = require('./middleware/error.middleware');

// Import routes
const routes = require('./routes');

const app = express();

// Trust proxy (for rate limiting behind proxies)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.security.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-No-Cache'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(requestLogger);

// Rate limiting middleware
app.use(rateLimiter);

// Read-only enforcement middleware
app.use(readOnly);

// Health check endpoint (public, no auth required)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
    },
  });
});

// Cache statistics endpoint (public, for monitoring)
app.get('/cache/stats', (req, res) => {
  const stats = cacheService.getStats();
  res.json({
    success: true,
    data: stats,
  });
});

// API routes (require authentication)
app.use('/api/v1', authenticate, routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.originalUrl,
      method: req.method,
    },
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
