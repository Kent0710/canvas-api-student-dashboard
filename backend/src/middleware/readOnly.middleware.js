const config = require('../config');
const { AuthorizationError } = require('../utils/errors');
const errorCodes = require('../constants/errorCodes');
const logger = require('../config/logger.config');

/**
 * Read-only enforcement middleware
 * Blocks all non-GET requests when read-only mode is enabled
 */
const enforceReadOnly = (req, res, next) => {
  // Skip if read-only mode is disabled
  if (!config.security.readOnlyMode) {
    return next();
  }

  // Allow GET, HEAD, and OPTIONS requests
  const allowedMethods = ['GET', 'HEAD', 'OPTIONS'];

  if (!allowedMethods.includes(req.method)) {
    logger.warn('Read-only mode: blocked mutation request', {
      method: req.method,
      path: req.path,
      ip: req.ip,
    });

    return next(
      new AuthorizationError(
        'This API is read-only. Modification requests are not allowed.'
      )
    );
  }

  next();
};

module.exports = enforceReadOnly;
