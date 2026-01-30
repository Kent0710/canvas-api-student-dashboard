const CanvasClient = require('./canvasClient');
const {
  normalizeAssignment,
  normalizeAssignments,
  normalizeSubmission,
} = require('../../utils/normalizer');
const logger = require('../../config/logger.config');

/**
 * Assignment Service
 * Handles Canvas API operations related to assignments
 */
class AssignmentService {
  constructor(accessToken) {
    this.client = new CanvasClient(accessToken);
  }

  /**
   * Get assignments for a course
   * @param {Number} courseId - Course ID
   * @param {Object} options - Query options (bucket, orderBy, etc.)
   * @returns {Promise<Array>} Normalized assignments array
   */
  async getCourseAssignments(courseId, options = {}) {
    try {
      logger.debug(`Fetching assignments for course ${courseId}`, options);

      const params = {
        include: ['submission'],
      };

      // Add bucket filter (upcoming, past, overdue, etc.)
      if (options.bucket) {
        params.bucket = options.bucket;
      }

      // Add order_by parameter
      if (options.orderBy) {
        params.order_by = options.orderBy;
      }

      const assignments = await this.client.getAllPages(
        `/courses/${courseId}/assignments`,
        { params }
      );

      return normalizeAssignments(assignments);
    } catch (error) {
      logger.error(`Error fetching assignments for course ${courseId}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get assignment by ID
   * @param {Number} courseId - Course ID
   * @param {Number} assignmentId - Assignment ID
   * @returns {Promise<Object>} Normalized assignment data
   */
  async getAssignmentById(courseId, assignmentId) {
    try {
      logger.debug(`Fetching assignment ${assignmentId} from course ${courseId}`);

      const assignment = await this.client.get(
        `/courses/${courseId}/assignments/${assignmentId}`,
        {
          params: {
            include: ['submission'],
          },
        }
      );

      return normalizeAssignment(assignment);
    } catch (error) {
      logger.error(
        `Error fetching assignment ${assignmentId} from course ${courseId}`,
        { error: error.message }
      );
      throw error;
    }
  }

  /**
   * Get submission for an assignment
   * @param {Number} courseId - Course ID
   * @param {Number} assignmentId - Assignment ID
   * @param {Number|String} userId - User ID (default: 'self')
   * @returns {Promise<Object>} Normalized submission data
   */
  async getAssignmentSubmission(courseId, assignmentId, userId = 'self') {
    try {
      logger.debug(
        `Fetching submission for assignment ${assignmentId} from course ${courseId}`
      );

      const submission = await this.client.get(
        `/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`,
        {
          params: {
            include: ['submission_history', 'submission_comments', 'rubric_assessment'],
          },
        }
      );

      return normalizeSubmission(submission);
    } catch (error) {
      logger.error(
        `Error fetching submission for assignment ${assignmentId} from course ${courseId}`,
        { error: error.message }
      );
      throw error;
    }
  }

  /**
   * Get all upcoming assignments across all courses
   * @returns {Promise<Array>} Normalized assignments array
   */
  async getUpcomingAssignments() {
    try {
      logger.debug('Fetching upcoming assignments');

      const assignments = await this.client.getAllPages(
        '/users/self/upcoming_events',
        {
          params: {
            type: 'assignment',
          },
        }
      );

      return normalizeAssignments(assignments);
    } catch (error) {
      logger.error('Error fetching upcoming assignments', {
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = AssignmentService;
