const NodeCache = require('node-cache');
const config = require('../../config');
const logger = require('../../config/logger.config');

/**
 * Cache Service
 * Provides caching functionality using node-cache
 */
class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.stdTTL,
      checkperiod: config.cache.checkperiod,
      useClones: false, // Improves performance
    });

    this.enabled = config.cache.enabled;

    // Track statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
    };

    logger.info('Cache service initialized', {
      enabled: this.enabled,
      stdTTL: config.cache.stdTTL,
    });
  }

  /**
   * Generate a cache key
   * @param {String} prefix - Key prefix (e.g., 'user', 'course')
   * @param {String|Number} identifier - Unique identifier
   * @param {Object} params - Additional parameters to include in key
   * @returns {String} Cache key
   */
  generateKey(prefix, identifier, params = {}) {
    const paramsString = Object.keys(params).length > 0
      ? ':' + JSON.stringify(params)
      : '';
    return `${prefix}:${identifier}${paramsString}`;
  }

  /**
   * Get value from cache
   * @param {String} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    if (!this.enabled) {
      return undefined;
    }

    const value = this.cache.get(key);

    if (value !== undefined) {
      this.stats.hits++;
      logger.debug(`Cache hit: ${key}`);
    } else {
      this.stats.misses++;
      logger.debug(`Cache miss: ${key}`);
    }

    return value;
  }

  /**
   * Set value in cache
   * @param {String} key - Cache key
   * @param {*} value - Value to cache
   * @param {Number} ttl - Time to live in seconds (optional)
   * @returns {Boolean} Success status
   */
  set(key, value, ttl = undefined) {
    if (!this.enabled) {
      return false;
    }

    try {
      const success = this.cache.set(key, value, ttl);
      if (success) {
        this.stats.sets++;
        logger.debug(`Cache set: ${key}`, { ttl });
      }
      return success;
    } catch (error) {
      logger.error(`Cache set error: ${key}`, { error: error.message });
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {String} key - Cache key
   * @returns {Number} Number of deleted entries
   */
  del(key) {
    if (!this.enabled) {
      return 0;
    }

    const deleted = this.cache.del(key);
    logger.debug(`Cache delete: ${key}`, { deleted });
    return deleted;
  }

  /**
   * Delete multiple keys matching a pattern
   * @param {String} pattern - Pattern to match (e.g., 'user:*')
   * @returns {Number} Number of deleted entries
   */
  delPattern(pattern) {
    if (!this.enabled) {
      return 0;
    }

    const keys = this.cache.keys();
    const regex = new RegExp(pattern.replace('*', '.*'));
    const matchingKeys = keys.filter((key) => regex.test(key));

    if (matchingKeys.length > 0) {
      const deleted = this.cache.del(matchingKeys);
      logger.debug(`Cache pattern delete: ${pattern}`, {
        deleted,
        keys: matchingKeys,
      });
      return deleted;
    }

    return 0;
  }

  /**
   * Flush all cache entries
   */
  flush() {
    if (!this.enabled) {
      return;
    }

    this.cache.flushAll();
    logger.info('Cache flushed');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const cacheStats = this.cache.getStats();
    return {
      enabled: this.enabled,
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      hitRate:
        this.stats.hits + this.stats.misses > 0
          ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
          : 0,
      keys: cacheStats.keys,
      ksize: cacheStats.ksize,
      vsize: cacheStats.vsize,
    };
  }

  /**
   * Get TTL for a key
   * @param {String} key - Cache key
   * @returns {Number} TTL in seconds, or undefined if not found
   */
  getTtl(key) {
    if (!this.enabled) {
      return undefined;
    }

    return this.cache.getTtl(key);
  }

  /**
   * Get cache age for a key (time since it was set)
   * @param {String} key - Cache key
   * @returns {Number} Age in seconds, or null if not found
   */
  getCacheAge(key) {
    if (!this.enabled) {
      return null;
    }

    const ttl = this.cache.getTtl(key);
    if (!ttl) {
      return null;
    }

    const now = Date.now();
    const expiresAt = ttl;
    const stdTTL = this.cache.options.stdTTL * 1000; // Convert to milliseconds

    // Calculate age: (stdTTL - remaining time)
    const remainingTime = expiresAt - now;
    const age = (stdTTL - remainingTime) / 1000; // Convert back to seconds

    return Math.max(0, Math.round(age));
  }

  /**
   * Wrapper for getting or setting cache with a function
   * @param {String} key - Cache key
   * @param {Function} fn - Function to execute if cache miss
   * @param {Number} ttl - Time to live in seconds
   * @returns {Promise<*>} Cached or fresh value
   */
  async getOrSet(key, fn, ttl = undefined) {
    const cached = this.get(key);

    if (cached !== undefined) {
      return cached;
    }

    // Cache miss - execute function
    const value = await fn();

    // Store in cache
    this.set(key, value, ttl);

    return value;
  }
}

// Export singleton instance
module.exports = new CacheService();
