const CourseService = require('../services/canvas/courseService');
const cacheService = require('../services/cache/cacheService');
const cacheTTL = require('../constants/cacheTTL');
const { formatSuccess } = require('../utils/responseFormatter');
const logger = require('../config/logger.config');

/**
 * Get active courses for the current user
 */
const getCourses = async (req, res, next) => {
  try {
    const token = req.canvasToken;
    const bypassCache = req.headers['x-no-cache'] === 'true';
    const includeGrades = req.query.include_grades !== 'false';

    const cacheKey = cacheService.generateKey('courses', 'active', {
      includeGrades,
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
    const courseService = new CourseService(token);
    const courses = await courseService.getActiveCourses(includeGrades);

    // Cache the result
    cacheService.set(cacheKey, courses, cacheTTL.COURSES);

    res.json(
      formatSuccess(courses, {
        cached: false,
        count: courses.length,
      })
    );
  } catch (error) {
    logger.error('Error in getCourses controller', { error: error.message });
    next(error);
  }
};

/**
 * Get course by ID
 */
const getCourseById = async (req, res, next) => {
  try {
    const token = req.canvasToken;
    const bypassCache = req.headers['x-no-cache'] === 'true';
    const courseId = req.params.courseId;

    const cacheKey = cacheService.generateKey('course', courseId);

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
    const courseService = new CourseService(token);
    const course = await courseService.getCourseById(courseId);

    // Cache the result
    cacheService.set(cacheKey, course, cacheTTL.COURSE_DETAILS);

    res.json(formatSuccess(course, { cached: false }));
  } catch (error) {
    logger.error('Error in getCourseById controller', {
      error: error.message,
      courseId: req.params.courseId,
    });
    next(error);
  }
};

/**
 * Get grade breakdown for a course
 */
const getCourseGrade = async (req, res, next) => {
  try {
    const token = req.canvasToken;
    const bypassCache = req.headers['x-no-cache'] === 'true';
    const courseId = req.params.courseId;

    const cacheKey = cacheService.generateKey('course-grade', courseId);

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
    const courseService = new CourseService(token);
    const grade = await courseService.getCourseGrade(courseId);

    // Cache the result
    cacheService.set(cacheKey, grade, cacheTTL.COURSE_DETAILS);

    res.json(formatSuccess(grade, { cached: false }));
  } catch (error) {
    logger.error('Error in getCourseGrade controller', {
      error: error.message,
      courseId: req.params.courseId,
    });
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  getCourseGrade,
};
