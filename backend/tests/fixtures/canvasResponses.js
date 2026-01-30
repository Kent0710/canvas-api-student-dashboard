/**
 * Mock Canvas API responses for testing
 */

const mockUser = {
  id: 12345,
  name: 'John Doe',
  short_name: 'John',
  sortable_name: 'Doe, John',
  email: 'john.doe@example.com',
  avatar_url: 'https://example.com/avatar.jpg',
  locale: 'en',
  effective_locale: 'en',
};

const mockCourse = {
  id: 1001,
  name: 'Introduction to Computer Science',
  course_code: 'CS101',
  workflow_state: 'available',
  enrollment_term_id: 1,
  start_at: '2024-01-15T00:00:00Z',
  end_at: '2024-05-15T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  enrollments: [
    {
      type: 'student',
      role: 'StudentEnrollment',
      enrollment_state: 'active',
      grades: {
        current_score: 85.5,
        final_score: 85.5,
        current_grade: 'B',
        final_grade: 'B',
      },
    },
  ],
};

const mockCourses = [
  mockCourse,
  {
    id: 1002,
    name: 'Calculus I',
    course_code: 'MATH101',
    workflow_state: 'available',
    enrollment_term_id: 1,
    start_at: '2024-01-15T00:00:00Z',
    end_at: '2024-05-15T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    enrollments: [
      {
        type: 'student',
        role: 'StudentEnrollment',
        enrollment_state: 'active',
        grades: {
          current_score: 92.0,
          final_score: 92.0,
          current_grade: 'A',
          final_grade: 'A',
        },
      },
    ],
  },
];

const mockAssignment = {
  id: 5001,
  name: 'Programming Assignment 1',
  description: '<p>Complete the programming tasks</p>',
  due_at: '2024-02-15T23:59:00Z',
  points_possible: 100,
  course_id: 1001,
  submission_types: ['online_upload'],
  has_submitted_submissions: true,
  published: true,
  grading_type: 'points',
  html_url: 'https://dlsl.instructure.com/courses/1001/assignments/5001',
  created_at: '2024-01-20T00:00:00Z',
  updated_at: '2024-01-20T00:00:00Z',
};

const mockAssignments = [
  mockAssignment,
  {
    id: 5002,
    name: 'Quiz 1',
    description: '<p>First quiz covering chapters 1-3</p>',
    due_at: '2024-02-20T23:59:00Z',
    points_possible: 50,
    course_id: 1001,
    submission_types: ['online_quiz'],
    has_submitted_submissions: false,
    published: true,
    grading_type: 'points',
    html_url: 'https://dlsl.instructure.com/courses/1001/assignments/5002',
    created_at: '2024-01-22T00:00:00Z',
    updated_at: '2024-01-22T00:00:00Z',
  },
];

const mockSubmission = {
  assignment_id: 5001,
  user_id: 12345,
  submitted_at: '2024-02-14T20:30:00Z',
  score: 95,
  grade: '95',
  attempt: 1,
  workflow_state: 'graded',
  submission_type: 'online_upload',
  late: false,
  missing: false,
  excused: false,
  preview_url: 'https://dlsl.instructure.com/courses/1001/assignments/5001/submissions/12345',
};

const mockAnnouncement = {
  id: 3001,
  title: 'Welcome to CS101',
  message: '<p>Welcome to the course! Here are some important notes...</p>',
  posted_at: '2024-01-15T10:00:00Z',
  author: {
    id: 99999,
    display_name: 'Professor Smith',
    avatar_image_url: 'https://example.com/prof-avatar.jpg',
  },
  context_code: 'course_1001',
  html_url: 'https://dlsl.instructure.com/courses/1001/discussion_topics/3001',
};

const mockAnnouncements = [
  mockAnnouncement,
  {
    id: 3002,
    title: 'Assignment 1 Posted',
    message: '<p>The first assignment has been posted. Due date is Feb 15.</p>',
    posted_at: '2024-01-20T15:00:00Z',
    author: {
      id: 99999,
      display_name: 'Professor Smith',
      avatar_image_url: 'https://example.com/prof-avatar.jpg',
    },
    context_code: 'course_1001',
    html_url: 'https://dlsl.instructure.com/courses/1001/discussion_topics/3002',
  },
];

module.exports = {
  mockUser,
  mockCourse,
  mockCourses,
  mockAssignment,
  mockAssignments,
  mockSubmission,
  mockAnnouncement,
  mockAnnouncements,
};
