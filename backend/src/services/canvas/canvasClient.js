const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const config = require('../../config');
const logger = require('../../config/logger.config');
const { CanvasAPIError, RateLimitError } = require('../../utils/errors');
const parseLinkHeader = require('../../utils/parseLinkHeader');

/**
 * Canvas API Client
 * Handles all HTTP communication with Canvas LMS API
 */
class CanvasClient {
  constructor(accessToken = null) {
    this.accessToken = accessToken;
    this.baseURL = config.canvas.baseURL;

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.canvas.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: config.canvas.maxRetries,
      retryDelay: (retryCount) => {
        return retryCount * config.canvas.retryDelay;
      },
      retryCondition: (error) => {
        // Retry on network errors or 5xx status codes
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response && error.response.status >= 500)
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        logger.warn(`Retrying Canvas API request (attempt ${retryCount})`, {
          url: requestConfig.url,
          error: error.message,
        });
      },
    });

    // Request interceptor - add authorization header
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Log rate limit info if available
        const rateLimitInfo = this.parseRateLimitHeaders(response.headers);
        if (rateLimitInfo.remaining !== null && rateLimitInfo.remaining < 100) {
          logger.warn('Canvas API rate limit running low', rateLimitInfo);
        }
        return response;
      },
      async (error) => {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          // Handle rate limiting
          if (status === 429) {
            const retryAfter = error.response.headers['x-rate-limit-remaining'];
            logger.error('Canvas API rate limit exceeded', {
              retryAfter,
              url: error.config.url,
            });
            throw new RateLimitError(
              'Canvas API rate limit exceeded. Please try again later.',
              retryAfter
            );
          }

          // Handle authentication errors
          if (status === 401) {
            logger.error('Canvas API authentication failed', {
              url: error.config.url,
            });
            throw new CanvasAPIError(
              'Invalid or expired Canvas API token',
              401,
              data
            );
          }

          // Handle not found
          if (status === 404) {
            throw new CanvasAPIError('Resource not found in Canvas', 404, data);
          }

          // Handle other Canvas API errors
          const errorMessage = data?.errors?.[0]?.message || data?.message || 'Canvas API request failed';
          throw new CanvasAPIError(errorMessage, status, data);
        }

        // Handle network errors
        if (error.code === 'ECONNABORTED') {
          logger.error('Canvas API request timeout', {
            url: error.config?.url,
          });
          throw new CanvasAPIError('Canvas API request timeout', 504);
        }

        // Handle other errors
        logger.error('Canvas API request error', {
          message: error.message,
          url: error.config?.url,
        });
        throw new CanvasAPIError(error.message, 500);
      }
    );
  }

  /**
   * Parse rate limit headers from Canvas response
   * @param {Object} headers - Response headers
   * @returns {Object} Rate limit information
   */
  parseRateLimitHeaders(headers) {
    return {
      limit: headers['x-rate-limit-remaining'] || null,
      remaining: headers['x-rate-limit-remaining'] || null,
      resetAt: headers['x-rate-limit-reset'] || null,
    };
  }

  /**
   * Make a GET request to Canvas API
   * @param {String} endpoint - API endpoint (without base URL)
   * @param {Object} options - Request options (params, headers, etc.)
   * @returns {Promise} Response data
   */
  async get(endpoint, options = {}) {
    try {
      logger.debug(`Canvas API GET request: ${endpoint}`, options);
      const response = await this.client.get(endpoint, options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all pages from a paginated Canvas API endpoint
   * @param {String} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Array>} All items from all pages
   */
  async getAllPages(endpoint, options = {}) {
    const allItems = [];
    let currentUrl = endpoint;

    // Add per_page parameter for pagination
    const params = {
      per_page: config.canvas.perPage,
      ...options.params,
    };

    try {
      while (currentUrl) {
        logger.debug(`Fetching page: ${currentUrl}`);

        const response = await this.client.get(currentUrl, {
          ...options,
          params: currentUrl === endpoint ? params : undefined,
        });

        // Add items from current page
        if (Array.isArray(response.data)) {
          allItems.push(...response.data);
        } else {
          allItems.push(response.data);
        }

        // Parse Link header for next page
        const linkHeader = response.headers.link;
        const links = parseLinkHeader(linkHeader);

        // Get next page URL (relative to base URL)
        if (links.next) {
          // Extract the path and query from the full URL
          const nextUrl = new URL(links.next);
          currentUrl = nextUrl.pathname + nextUrl.search;
        } else {
          currentUrl = null;
        }
      }

      logger.debug(`Fetched ${allItems.length} total items from ${endpoint}`);
      return allItems;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set the access token for subsequent requests
   * @param {String} token - Canvas API access token
   */
  setAccessToken(token) {
    this.accessToken = token;
  }
}

module.exports = CanvasClient;
