/**
 * Cache TTL (Time To Live) constants in seconds
 */

module.exports = {
  USER_PROFILE: parseInt(process.env.CACHE_TTL_USER) || 600,      // 10 minutes
  COURSES: parseInt(process.env.CACHE_TTL_COURSES) || 300,        // 5 minutes
  COURSE_DETAILS: parseInt(process.env.CACHE_TTL_COURSES) || 300, // 5 minutes
  ASSIGNMENTS: parseInt(process.env.CACHE_TTL_ASSIGNMENTS) || 180, // 3 minutes
  ASSIGNMENT_DETAILS: parseInt(process.env.CACHE_TTL_ASSIGNMENTS) || 180, // 3 minutes
  SUBMISSIONS: parseInt(process.env.CACHE_TTL_SUBMISSIONS) || 120, // 2 minutes
  ANNOUNCEMENTS: parseInt(process.env.CACHE_TTL_ANNOUNCEMENTS) || 120, // 2 minutes
  ACTIVITY_FEED: parseInt(process.env.CACHE_TTL_ACTIVITY) || 120, // 2 minutes
};
