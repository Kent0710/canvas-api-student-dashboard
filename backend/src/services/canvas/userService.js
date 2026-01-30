const CanvasClient = require('./canvasClient');
const { normalizeUser } = require('../../utils/normalizer');
const logger = require('../../config/logger.config');

/**
 * User Service
 * Handles Canvas API operations related to users
 */
class UserService {
  constructor(accessToken) {
    this.client = new CanvasClient(accessToken);
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} Normalized user data
   */
  async getCurrentUser() {
    try {
      logger.debug('Fetching current user profile');
      const user = await this.client.get('/users/self');
      return normalizeUser(user);
    } catch (error) {
      logger.error('Error fetching current user', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {Number} userId - User ID
   * @returns {Promise<Object>} Normalized user data
   */
  async getUserById(userId) {
    try {
      logger.debug(`Fetching user ${userId}`);
      const user = await this.client.get(`/users/${userId}`);
      return normalizeUser(user);
    } catch (error) {
      logger.error(`Error fetching user ${userId}`, { error: error.message });
      throw error;
    }
  }
}

module.exports = UserService;
