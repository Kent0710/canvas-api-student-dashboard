const { AuthenticationError } = require('../utils/errors');
const errorCodes = require('../constants/errorCodes');
const logger = require('../config/logger.config');

/**
 * Authentication middleware
 * Extracts and validates Canvas API token from Authorization header
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      throw new AuthenticationError('Authorization header is required');
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Invalid authorization format. Use: Bearer <token>');
    }

    // Extract token
    const token = authHeader.substring(7).trim();

    // Validate token format (basic check)
    if (!token || token.length === 0) {
      throw new AuthenticationError('Invalid or missing token');
    }

    // Attach token to request object for use in controllers
    req.canvasToken = token;

    // Log authentication (without exposing token)
    logger.debug('Authentication successful', {
      ip: req.ip,
      path: req.path,
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      ip: req.ip,
      path: req.path,
      error: error.message,
    });

    // Pass error to error handler
    next(error);
  }
};

module.exports = authenticate;
