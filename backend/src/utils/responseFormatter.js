/**
 * Utility functions for formatting API responses consistently
 */

/**
 * Format a success response
 * @param {*} data - Response data
 * @param {Object} meta - Optional metadata (cached, cacheAge, etc.)
 * @returns {Object} Formatted response
 */
const formatSuccess = (data, meta = {}) => {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
};

/**
 * Format an error response
 * @param {String} message - Error message
 * @param {String} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Object} Formatted error response
 */
const formatError = (message, code = 'INTERNAL_ERROR', details = {}) => {
  return {
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString(),
      ...details,
    },
  };
};

/**
 * Format a validation error response
 * @param {Array} errors - Array of validation errors
 * @returns {Object} Formatted validation error response
 */
const formatValidationError = (errors) => {
  return {
    success: false,
    error: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
      errors,
    },
  };
};

module.exports = {
  formatSuccess,
  formatError,
  formatValidationError,
};
