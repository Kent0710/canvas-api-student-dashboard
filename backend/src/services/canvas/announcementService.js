const CanvasClient = require('./canvasClient');
const { normalizeAnnouncements } = require('../../utils/normalizer');
const logger = require('../../config/logger.config');

/**
 * Announcement Service
 * Handles Canvas API operations related to announcements
 */
class AnnouncementService {
  constructor(accessToken) {
    this.client = new CanvasClient(accessToken);
  }

  /**
   * Get announcements for a course
   * @param {Number} courseId - Course ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Normalized announcements array
   */
  async getCourseAnnouncements(courseId, options = {}) {
    try {
      logger.debug(`Fetching announcements for course ${courseId}`);

      const params = {
        only_announcements: true,
      };

      // Add date filters if provided
      if (options.startDate) {
        params.start_date = options.startDate;
      }
      if (options.endDate) {
        params.end_date = options.endDate;
      }

      const announcements = await this.client.getAllPages(
        `/courses/${courseId}/discussion_topics`,
        { params }
      );

      return normalizeAnnouncements(announcements);
    } catch (error) {
      logger.error(`Error fetching announcements for course ${courseId}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get recent announcements across all courses
   * @param {Object} options - Query options (startDate, endDate)
   * @returns {Promise<Array>} Normalized announcements array
   */
  async getRecentAnnouncements(options = {}) {
    try {
      logger.debug('Fetching recent announcements across all courses');

      const params = {
        only_announcements: true,
        context_codes: options.contextCodes || [],
      };

      // Add date filters
      if (options.startDate) {
        params.start_date = options.startDate;
      }
      if (options.endDate) {
        params.end_date = options.endDate;
      }

      // Default to last 30 days if no dates provided
      if (!params.start_date && !params.end_date) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        params.start_date = thirtyDaysAgo.toISOString();
      }

      const announcements = await this.client.getAllPages(
        '/announcements',
        { params }
      );

      return normalizeAnnouncements(announcements);
    } catch (error) {
      logger.error('Error fetching recent announcements', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get announcement by ID
   * @param {Number} courseId - Course ID
   * @param {Number} announcementId - Announcement (discussion topic) ID
   * @returns {Promise<Object>} Normalized announcement data
   */
  async getAnnouncementById(courseId, announcementId) {
    try {
      logger.debug(
        `Fetching announcement ${announcementId} from course ${courseId}`
      );

      const announcement = await this.client.get(
        `/courses/${courseId}/discussion_topics/${announcementId}`
      );

      const normalized = normalizeAnnouncements([announcement]);
      return normalized[0] || null;
    } catch (error) {
      logger.error(
        `Error fetching announcement ${announcementId} from course ${courseId}`,
        { error: error.message }
      );
      throw error;
    }
  }
}

module.exports = AnnouncementService;
