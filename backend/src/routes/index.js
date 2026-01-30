const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./user.routes');
const coursesRoutes = require('./courses.routes');
const assignmentsRoutes = require('./assignments.routes');
const activityRoutes = require('./activity.routes');

// Mount routes
router.use('/user', userRoutes);
router.use('/courses', coursesRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/activity', activityRoutes);

module.exports = router;
