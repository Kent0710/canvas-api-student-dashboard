const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

/**
 * @route   GET /api/v1/user/profile
 * @desc    Get current user profile
 * @access  Private (requires Canvas token)
 */
router.get('/profile', userController.getUserProfile);

module.exports = router;
