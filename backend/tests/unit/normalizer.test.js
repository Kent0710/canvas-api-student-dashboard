const {
  normalizeUser,
  normalizeCourse,
  normalizeAssignment,
} = require('../../src/utils/normalizer');
const {
  mockUser,
  mockCourse,
  mockAssignment,
} = require('../fixtures/canvasResponses');

describe('Normalizer', () => {
  describe('normalizeUser', () => {
    it('should normalize user data correctly', () => {
      const result = normalizeUser(mockUser);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        shortName: mockUser.short_name,
        sortableName: mockUser.sortable_name,
        email: mockUser.email,
        avatarUrl: mockUser.avatar_url,
        locale: mockUser.locale,
      });
    });

    it('should return null for null input', () => {
      const result = normalizeUser(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = normalizeUser(undefined);
      expect(result).toBeNull();
    });
  });

  describe('normalizeCourse', () => {
    it('should normalize course data correctly', () => {
      const result = normalizeCourse(mockCourse);

      expect(result).toMatchObject({
        id: mockCourse.id,
        name: mockCourse.name,
        courseCode: mockCourse.course_code,
        workflowState: mockCourse.workflow_state,
        startDate: mockCourse.start_at,
        endDate: mockCourse.end_at,
      });

      expect(result.currentGrade).toBeDefined();
      expect(result.currentGrade.current).toBe(85.5);
      expect(result.currentGrade.letterGrade).toBe('B');
    });

    it('should handle course without enrollment', () => {
      const courseWithoutEnrollment = { ...mockCourse, enrollments: [] };
      const result = normalizeCourse(courseWithoutEnrollment);

      expect(result.currentGrade).toBeDefined();
      expect(result.currentGrade.current).toBeUndefined();
    });

    it('should return null for null input', () => {
      const result = normalizeCourse(null);
      expect(result).toBeNull();
    });
  });

  describe('normalizeAssignment', () => {
    it('should normalize assignment data correctly', () => {
      const result = normalizeAssignment(mockAssignment);

      expect(result).toMatchObject({
        id: mockAssignment.id,
        courseId: mockAssignment.course_id,
        name: mockAssignment.name,
        description: mockAssignment.description,
        dueAt: mockAssignment.due_at,
        pointsPossible: mockAssignment.points_possible,
        isPublished: mockAssignment.published,
      });

      expect(result.submissionTypes).toEqual(mockAssignment.submission_types);
    });

    it('should return null for null input', () => {
      const result = normalizeAssignment(null);
      expect(result).toBeNull();
    });
  });
});
