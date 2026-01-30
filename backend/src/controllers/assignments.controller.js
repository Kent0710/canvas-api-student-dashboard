const AssignmentService = require('../services/canvas/assignmentService');
const cacheService = require('../services/cache/cacheService');
const cacheTTL = require('../constants/cacheTTL');
const { formatSuccess } = require('../utils/responseFormatter');
const { ValidationError } = require('../utils/errors');
const logger = require('../config/logger.config');

/**
 * Get assignments for a course
 */
const getCourseAssignments = async (req, res, next) => {
  try {
    const token = req.canvasToken;
    const bypassCache = req.headers['x-no-cache'] === 'true';
    const courseId = req.params.courseId;
    const { bucket, order_by } = req.query;

    const cacheKey = cacheService.generateKey('course-assignments', courseId, {
      bucket,
      order_by,
    });

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
    const assignmentService = new AssignmentService(token);
    const assignments = await assignmentService.getCourseAssignments(courseId, {
      bucket,
      orderBy: order_by,
    });

    // Cache the result
    cacheService.set(cacheKey, assignments, cacheTTL.ASSIGNMENTS);

    res.json(
      formatSuccess(assignments, {
        cached: false,
        count: assignments.length,
      })
    );
  } catch (error) {
    logger.error('Error in getCourseAssignments controller', {
      error: error.message,
      courseId: req.params.courseId,
    });
    next(error);
  }
};

/**
 * Get assignment by ID
 */
const getAssignmentById = async (req, res, next) => {
  try {
    const token = req.canvasToken;
    const bypassCache = req.headers['x-no-cache'] === 'true';
    const assignmentId = req.params.assignmentId;
    const courseId = req.query.course_id;

    // Validate required query parameter
    if (!courseId) {
      throw new ValidationError('course_id query parameter is required');
    }

    const cacheKey = cacheService.generateKey('assignment', assignmentId, {
      courseId,
    });

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
    const assignmentService = new AssignmentService(token);
    const assignment = await assignmentService.getAssignmentById(
      courseId,
      assignmentId
    );

    // Cache the result
    cacheService.set(cacheKey, assignment, cacheTTL.ASSIGNMENT_DETAILS);

    res.json(formatSuccess(assignment, { cached: false }));
  } catch (error) {
    logger.error('Error in getAssignmentById controller', {
      error: error.message,
      assignmentId: req.params.assignmentId,
    });
    next(error);
  }
};

/**
 * Get assignment submission
 */
const getAssignmentSubmission = async (req, res, next) => {
  try {
    const token = req.canvasToken;
    const bypassCache = req.headers['x-no-cache'] === 'true';
    const assignmentId = req.params.assignmentId;
    const courseId = req.query.course_id;

    // Validate required query parameter
    if (!courseId) {
      throw new ValidationError('course_id query parameter is required');
    }

    const cacheKey = cacheService.generateKey('submission', assignmentId, {
      courseId,
    });

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
    const assignmentService = new AssignmentService(token);
    const submission = await assignmentService.getAssignmentSubmission(
      courseId,
      assignmentId
    );

    // Cache the result
    cacheService.set(cacheKey, submission, cacheTTL.SUBMISSIONS);

    res.json(formatSuccess(submission, { cached: false }));
  } catch (error) {
    logger.error('Error in getAssignmentSubmission controller', {
      error: error.message,
      assignmentId: req.params.assignmentId,
    });
    next(error);
  }
};

module.exports = {
  getCourseAssignments,
  getAssignmentById,
  getAssignmentSubmission,
};
