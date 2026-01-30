const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');

/**
 * @route   GET /api/v1/activity/feed
 * @desc    Get activity feed (announcements + assignments)
 * @query   start_date - Start date (ISO format, default: 30 days ago)
 * @query   end_date - End date (ISO format, default: now)
 * @query   types - Comma-separated types (announcement,assignment, default: both)
 * @query   limit - Max items to return (default: 50, max: 200)
 * @access  Private (requires Canvas token)
 */
router.get('/feed', activityController.getActivityFeed);

module.exports = router;
