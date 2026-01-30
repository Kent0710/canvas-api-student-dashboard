const express = require('express');
const router = express.Router();
const assignmentsController = require('../controllers/assignments.controller');

/**
 * @route   GET /api/v1/assignments/:assignmentId
 * @desc    Get assignment details by ID
 * @query   course_id - Required: Course ID
 * @access  Private (requires Canvas token)
 */
router.get('/:assignmentId', assignmentsController.getAssignmentById);

/**
 * @route   GET /api/v1/assignments/:assignmentId/submission
 * @desc    Get assignment submission status
 * @query   course_id - Required: Course ID
 * @access  Private (requires Canvas token)
 */
router.get(
  '/:assignmentId/submission',
  assignmentsController.getAssignmentSubmission
);

module.exports = router;
