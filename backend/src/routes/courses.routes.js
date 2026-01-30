const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/courses.controller');

/**
 * @route   GET /api/v1/courses
 * @desc    Get active courses with optional grades
 * @query   include_grades - Include grade information (default: true)
 * @access  Private (requires Canvas token)
 */
router.get('/', coursesController.getCourses);

/**
 * @route   GET /api/v1/courses/:courseId
 * @desc    Get course details by ID
 * @access  Private (requires Canvas token)
 */
router.get('/:courseId', coursesController.getCourseById);

/**
 * @route   GET /api/v1/courses/:courseId/grade
 * @desc    Get grade breakdown for a course
 * @access  Private (requires Canvas token)
 */
router.get('/:courseId/grade', coursesController.getCourseGrade);

/**
 * @route   GET /api/v1/courses/:courseId/assignments
 * @desc    Get assignments for a course
 * @query   bucket - Filter by bucket (upcoming, past, overdue, etc.)
 * @query   order_by - Order by field (due_at, name, etc.)
 * @access  Private (requires Canvas token)
 */
const assignmentsController = require('../controllers/assignments.controller');
router.get('/:courseId/assignments', assignmentsController.getCourseAssignments);

module.exports = router;
