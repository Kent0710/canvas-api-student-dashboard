/**
 * Canvas API configuration
 */

module.exports = {
  baseURL: process.env.CANVAS_API_BASE_URL || 'https://dlsl.instructure.com/api/v1',
  timeout: parseInt(process.env.CANVAS_API_TIMEOUT) || 30000, // 30 seconds
  maxRetries: parseInt(process.env.CANVAS_MAX_RETRIES) || 3,
  retryDelay: parseInt(process.env.CANVAS_RETRY_DELAY) || 1000, // 1 second
  perPage: parseInt(process.env.CANVAS_PER_PAGE) || 100, // Items per page for pagination
};
