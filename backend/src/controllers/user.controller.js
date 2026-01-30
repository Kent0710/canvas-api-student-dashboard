const UserService = require('../services/canvas/userService');
const cacheService = require('../services/cache/cacheService');
const cacheTTL = require('../constants/cacheTTL');
const { formatSuccess } = require('../utils/responseFormatter');
const logger = require('../config/logger.config');

/**
 * Get current user profile
 */
const getUserProfile = async (req, res, next) => {
  try {
    const token = req.canvasToken;
    const bypassCache = req.headers['x-no-cache'] === 'true';

    const cacheKey = cacheService.generateKey('user', 'self');

    // Check cache first (unless bypassed)
    if (!bypassCache) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        const cacheAge = cacheService.getCacheAge(cacheKey);
        return res.json(
          formatSuccess(cached, {
            cached: true,
            cacheAge,
          })
        );
      }
    }

    // Fetch from Canvas API
    const userService = new UserService(token);
    const user = await userService.getCurrentUser();

    // Cache the result
    cacheService.set(cacheKey, user, cacheTTL.USER_PROFILE);

    res.json(formatSuccess(user, { cached: false }));
  } catch (error) {
    logger.error('Error in getUserProfile controller', {
      error: error.message,
    });
    next(error);
  }
};

module.exports = {
  getUserProfile,
};
