/**
 * Data normalization utilities
 * Transform Canvas API responses to lean, frontend-friendly objects
 */

/**
 * Normalize user data
 */
const normalizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    shortName: user.short_name,
    sortableName: user.sortable_name,
    email: user.email,
    avatarUrl: user.avatar_url,
    locale: user.locale,
  };
};

/**
 * Normalize course data
 */
const normalizeCourse = (course) => {
  if (!course) return null;

  // Extract enrollment data
  const enrollment = course.enrollments?.[0] || {};
  const grades = enrollment.grades || {};

  return {
    id: course.id,
    name: course.name,
    courseCode: course.course_code,
    workflowState: course.workflow_state,
    startDate: course.start_at,
    endDate: course.end_at,
    enrollmentType: enrollment.type,
    enrollmentState: enrollment.enrollment_state,
    currentGrade: {
      current: grades.current_score,
      final: grades.final_score,
      letterGrade: grades.current_grade,
      finalLetterGrade: grades.final_grade,
    },
    isFavorite: course.is_favorite || false,
    htmlUrl: course.html_url,
  };
};

/**
 * Normalize courses array
 */
const normalizeCourses = (courses) => {
  if (!Array.isArray(courses)) return [];
  return courses.map(normalizeCourse).filter(Boolean);
};

/**
 * Normalize assignment data
 */
const normalizeAssignment = (assignment) => {
  if (!assignment) return null;

  return {
    id: assignment.id,
    courseId: assignment.course_id,
    name: assignment.name,
    description: assignment.description,
    dueAt: assignment.due_at,
    unlockAt: assignment.unlock_at,
    lockAt: assignment.lock_at,
    pointsPossible: assignment.points_possible,
    submissionTypes: assignment.submission_types || [],
    hasSubmittedSubmissions: assignment.has_submitted_submissions || false,
    isPublished: assignment.published,
    gradingType: assignment.grading_type,
    htmlUrl: assignment.html_url,
    createdAt: assignment.created_at,
    updatedAt: assignment.updated_at,
  };
};

/**
 * Normalize assignments array
 */
const normalizeAssignments = (assignments) => {
  if (!Array.isArray(assignments)) return [];
  return assignments.map(normalizeAssignment).filter(Boolean);
};

/**
 * Normalize submission data
 */
const normalizeSubmission = (submission) => {
  if (!submission) return null;

  return {
    id: submission.id,
    assignmentId: submission.assignment_id,
    userId: submission.user_id,
    submittedAt: submission.submitted_at,
    score: submission.score,
    grade: submission.grade,
    attempt: submission.attempt,
    workflowState: submission.workflow_state,
    submissionType: submission.submission_type,
    late: submission.late || false,
    missing: submission.missing || false,
    excused: submission.excused || false,
    previewUrl: submission.preview_url,
  };
};

/**
 * Normalize announcement data
 */
const normalizeAnnouncement = (announcement) => {
  if (!announcement) return null;

  return {
    id: announcement.id,
    title: announcement.title,
    message: announcement.message,
    postedAt: announcement.posted_at,
    author: announcement.author
      ? {
          id: announcement.author.id,
          displayName: announcement.author.display_name,
          avatarUrl: announcement.author.avatar_image_url,
        }
      : null,
    contextCode: announcement.context_code,
    htmlUrl: announcement.html_url,
  };
};

/**
 * Normalize announcements array
 */
const normalizeAnnouncements = (announcements) => {
  if (!Array.isArray(announcements)) return [];
  return announcements.map(normalizeAnnouncement).filter(Boolean);
};

/**
 * Normalize activity feed item (announcement or assignment)
 */
const normalizeActivityItem = (item, type) => {
  if (!item) return null;

  const baseActivity = {
    type,
    id: item.id,
  };

  if (type === 'announcement') {
    return {
      ...baseActivity,
      title: item.title,
      message: item.message,
      date: item.postedAt || item.posted_at,
      author: item.author,
      contextCode: item.contextCode || item.context_code,
      htmlUrl: item.htmlUrl || item.html_url,
    };
  }

  if (type === 'assignment') {
    return {
      ...baseActivity,
      title: item.name,
      courseId: item.courseId || item.course_id,
      dueAt: item.dueAt || item.due_at,
      date: item.dueAt || item.due_at,
      pointsPossible: item.pointsPossible || item.points_possible,
      submissionTypes: item.submissionTypes || item.submission_types,
      htmlUrl: item.htmlUrl || item.html_url,
    };
  }

  return baseActivity;
};

module.exports = {
  normalizeUser,
  normalizeCourse,
  normalizeCourses,
  normalizeAssignment,
  normalizeAssignments,
  normalizeSubmission,
  normalizeAnnouncement,
  normalizeAnnouncements,
  normalizeActivityItem,
};
