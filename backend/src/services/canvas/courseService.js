const CanvasClient = require('./canvasClient');
const { normalizeCourse, normalizeCourses } = require('../../utils/normalizer');
const logger = require('../../config/logger.config');

/**
 * Course Service
 * Handles Canvas API operations related to courses
 */
class CourseService {
  constructor(accessToken) {
    this.client = new CanvasClient(accessToken);
  }

  /**
   * Get active courses for the current user
   * @param {Boolean} includeGrades - Include grade information
   * @returns {Promise<Array>} Normalized courses array
   */
  async getActiveCourses(includeGrades = true) {
    try {
      logger.debug('Fetching active courses');

      const params = {
        enrollment_state: 'active',
        state: ['available', 'completed'],
      };

      if (includeGrades) {
        params.include = ['total_scores', 'current_grading_period_scores'];
      }

      const courses = await this.client.getAllPages('/courses', { params });

      // Filter out concluded courses if needed
      const activeCourses = courses.filter(
        (course) => course.workflow_state === 'available'
      );

      return normalizeCourses(activeCourses);
    } catch (error) {
      logger.error('Error fetching active courses', { error: error.message });
      throw error;
    }
  }

  /**
   * Get course by ID
   * @param {Number} courseId - Course ID
   * @returns {Promise<Object>} Normalized course data
   */
  async getCourseById(courseId) {
    try {
      logger.debug(`Fetching course ${courseId}`);

      const course = await this.client.get(`/courses/${courseId}`, {
        params: {
          include: ['total_scores', 'current_grading_period_scores'],
        },
      });

      return normalizeCourse(course);
    } catch (error) {
      logger.error(`Error fetching course ${courseId}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get course enrollment for current user
   * @param {Number} courseId - Course ID
   * @returns {Promise<Object>} Enrollment data with grades
   */
  async getCourseEnrollment(courseId) {
    try {
      logger.debug(`Fetching enrollment for course ${courseId}`);

      const enrollments = await this.client.get(
        `/courses/${courseId}/enrollments`,
        {
          params: {
            user_id: 'self',
            type: ['StudentEnrollment'],
          },
        }
      );

      // Return the first (should be only) enrollment
      const enrollment = enrollments[0];

      if (!enrollment) {
        return null;
      }

      return {
        id: enrollment.id,
        courseId: enrollment.course_id,
        type: enrollment.type,
        enrollmentState: enrollment.enrollment_state,
        grades: {
          current: enrollment.grades?.current_score,
          final: enrollment.grades?.final_score,
          letterGrade: enrollment.grades?.current_grade,
          finalLetterGrade: enrollment.grades?.final_grade,
        },
      };
    } catch (error) {
      logger.error(`Error fetching enrollment for course ${courseId}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get grade breakdown for a course
   * @param {Number} courseId - Course ID
   * @returns {Promise<Object>} Grade breakdown with assignment group scores
   */
  async getCourseGrade(courseId) {
    try {
      logger.debug(`Fetching grade breakdown for course ${courseId}`);

      // Get the course with enrollment data
      const course = await this.client.get(`/courses/${courseId}`, {
        params: {
          include: ['total_scores', 'current_grading_period_scores'],
        },
      });

      const enrollment = course.enrollments?.[0];
      if (!enrollment) {
        return null;
      }

      // Get assignment groups with grades
      const assignmentGroups = await this.client.get(
        `/courses/${courseId}/assignment_groups`,
        {
          params: {
            include: ['assignments'],
          },
        }
      );

      return {
        courseId,
        courseName: course.name,
        overallGrade: {
          current: enrollment.grades?.current_score,
          final: enrollment.grades?.final_score,
          letterGrade: enrollment.grades?.current_grade,
          finalLetterGrade: enrollment.grades?.final_grade,
        },
        assignmentGroups: assignmentGroups.map((group) => ({
          id: group.id,
          name: group.name,
          weight: group.group_weight,
          assignmentCount: group.assignments?.length || 0,
        })),
      };
    } catch (error) {
      logger.error(`Error fetching grade breakdown for course ${courseId}`, {
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = CourseService;
