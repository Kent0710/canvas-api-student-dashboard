const logger = require('../config/logger.config');
const { formatError, formatValidationError } = require('../utils/responseFormatter');
const {
  AppError,
  CanvasAPIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
} = require('../utils/errors');
const errorCodes = require('../constants/errorCodes');

/**
 * Global error handling middleware
 * Catches all errors and formats them consistently
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle ValidationError
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(
      formatValidationError(err.errors)
    );
  }

  // Handle AuthenticationError
  if (err instanceof AuthenticationError) {
    return res.status(401).json(
      formatError(err.message, errorCodes.AUTH_UNAUTHORIZED)
    );
  }

  // Handle AuthorizationError
  if (err instanceof AuthorizationError) {
    return res.status(403).json(
      formatError(err.message, errorCodes.READ_ONLY_VIOLATION)
    );
  }

  // Handle NotFoundError
  if (err instanceof NotFoundError) {
    return res.status(404).json(
      formatError(err.message, errorCodes.RESOURCE_NOT_FOUND)
    );
  }

  // Handle RateLimitError
  if (err instanceof RateLimitError) {
    return res.status(429).json(
      formatError(err.message, errorCodes.CANVAS_RATE_LIMIT, {
        retryAfter: err.retryAfter,
      })
    );
  }

  // Handle CanvasAPIError
  if (err instanceof CanvasAPIError) {
    const statusCode = err.statusCode || 500;
    const code = statusCode === 404
      ? errorCodes.CANVAS_NOT_FOUND
      : errorCodes.CANVAS_API_ERROR;

    return res.status(statusCode).json(
      formatError(
        err.message || 'Canvas API error occurred',
        code,
        // Don't expose Canvas error details in production
        process.env.NODE_ENV === 'development'
          ? { canvasError: err.canvasErrorDetails }
          : {}
      )
    );
  }

  // Handle generic AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      formatError(err.message, errorCodes.INTERNAL_ERROR)
    );
  }

  // Handle Joi validation errors (from validation middleware)
  if (err.name === 'ValidationError' && err.isJoi) {
    return res.status(400).json(
      formatValidationError(
        err.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }))
      )
    );
  }

  // Handle unknown errors
  const message = process.env.NODE_ENV === 'development'
    ? err.message
    : 'An unexpected error occurred';

  res.status(500).json(
    formatError(message, errorCodes.INTERNAL_ERROR)
  );
};

module.exports = errorHandler;
