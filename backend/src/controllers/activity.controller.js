const CourseService = require('../services/canvas/courseService');
const AssignmentService = require('../services/canvas/assignmentService');
const AnnouncementService = require('../services/canvas/announcementService');
const cacheService = require('../services/cache/cacheService');
const cacheTTL = require('../constants/cacheTTL');
const { formatSuccess } = require('../utils/responseFormatter');
const { normalizeActivityItem } = require('../utils/normalizer');
const logger = require('../config/logger.config');

/**
 * Get activity feed (announcements + assignments)
 */
const getActivityFeed = async (req, res, next) => {
  try {
    const token = req.canvasToken;
    const bypassCache = req.headers['x-no-cache'] === 'true';

    // Parse query parameters
    const {
      start_date,
      end_date,
      types = 'announcement,assignment',
      limit = 50,
    } = req.query;

    // Parse types filter
    const typeArray = types.split(',').map((t) => t.trim());
    const includeAnnouncements = typeArray.includes('announcement');
    const includeAssignments = typeArray.includes('assignment');

    // Set default date range (last 30 days)
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date
      ? new Date(start_date)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Limit validation (max 200)
    const maxLimit = Math.min(parseInt(limit), 200);

    const cacheKey = cacheService.generateKey('activity-feed', 'all', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      types,
      limit: maxLimit,
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

    // Initialize services
    const courseService = new CourseService(token);
    const announcementService = new AnnouncementService(token);
    const assignmentService = new AssignmentService(token);

    // Get active courses to build context codes
    const courses = await courseService.getActiveCourses(false);
    const contextCodes = courses.map((course) => `course_${course.id}`);

    // Fetch data in parallel
    const fetchPromises = [];

    if (includeAnnouncements) {
      fetchPromises.push(
        announcementService
          .getRecentAnnouncements({
            contextCodes,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          })
          .then((announcements) =>
            announcements.map((a) => normalizeActivityItem(a, 'announcement'))
          )
          .catch((error) => {
            logger.error('Error fetching announcements for activity feed', {
              error: error.message,
            });
            return [];
          })
      );
    }

    if (includeAssignments) {
      // Fetch assignments for each course
      const assignmentPromises = courses.map((course) =>
        assignmentService
          .getCourseAssignments(course.id, {
            bucket: 'upcoming',
            orderBy: 'due_at',
          })
          .then((assignments) =>
            assignments
              .filter(
                (a) =>
                  a.dueAt &&
                  new Date(a.dueAt) >= startDate &&
                  new Date(a.dueAt) <= endDate
              )
              .map((a) => normalizeActivityItem(a, 'assignment'))
          )
          .catch((error) => {
            logger.error(
              `Error fetching assignments for course ${course.id}`,
              { error: error.message }
            );
            return [];
          })
      );

      fetchPromises.push(
        Promise.all(assignmentPromises).then((results) => results.flat())
      );
    }

    const results = await Promise.all(fetchPromises);
    const allActivity = results.flat();

    // Sort by date (newest first)
    allActivity.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

    // Apply limit
    const limitedActivity = allActivity.slice(0, maxLimit);

    // Cache the result
    cacheService.set(cacheKey, limitedActivity, cacheTTL.ACTIVITY_FEED);

    res.json(
      formatSuccess(limitedActivity, {
        cached: false,
        count: limitedActivity.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      })
    );
  } catch (error) {
    logger.error('Error in getActivityFeed controller', {
      error: error.message,
    });
    next(error);
  }
};

module.exports = {
  getActivityFeed,
};
