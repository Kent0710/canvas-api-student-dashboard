# Canvas Student Dashboard API - Usage Examples

Practical examples demonstrating how to use the Canvas Student Dashboard API.

## Table of Contents
- [Course Examples](#course-examples)
- [Assignment Examples](#assignment-examples)
- [User Examples](#user-examples)
- [Activity Feed Examples](#activity-feed-examples)
- [React Component Examples](#react-component-examples)
- [Complete Workflows](#complete-workflows)

---

## Course Examples

### Example 1: Get All Courses with Grades

**JavaScript/Fetch:**
```javascript
const API_BASE_URL = 'http://localhost:5001/api/v1';
const CANVAS_TOKEN = 'YOUR_TOKEN_HERE';

async function getAllCourses() {
  const response = await fetch(`${API_BASE_URL}/courses?include_grades=true`, {
    headers: {
      'Authorization': `Bearer ${CANVAS_TOKEN}`
    }
  });

  const result = await response.json();

  if (result.success) {
    console.log(`Found ${result.meta.count} courses`);

    result.data.forEach(course => {
      console.log(`${course.name} (${course.courseCode})`);
      console.log(`  Grade: ${course.currentGrade.letterGrade || 'N/A'}`);
      console.log(`  Score: ${course.currentGrade.current || 'N/A'}%`);
    });
  }

  return result.data;
}

// Usage
getAllCourses();
```

**cURL:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5001/api/v1/courses?include_grades=true" | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 40232,
      "name": "C1B Computer Programming 2",
      "courseCode": "Coprog2",
      "workflowState": "available",
      "enrollmentType": "student",
      "currentGrade": {
        "current": 85.5,
        "final": 85.5,
        "letterGrade": "B",
        "finalLetterGrade": "B"
      },
      "isFavorite": false
    }
  ],
  "meta": {
    "count": 68,
    "cached": false
  }
}
```

---

### Example 2: Get Specific Course Details

**JavaScript/Fetch:**
```javascript
async function getCourseDetails(courseId) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${CANVAS_TOKEN}`
    }
  });

  const result = await response.json();

  if (result.success) {
    const course = result.data;
    console.log('Course Details:');
    console.log(`  Name: ${course.name}`);
    console.log(`  Code: ${course.courseCode}`);
    console.log(`  Status: ${course.workflowState}`);
    console.log(`  Grade: ${course.currentGrade.letterGrade}`);
  }

  return result.data;
}

// Usage - Get Computer Programming 2 details
getCourseDetails(40232);
```

**cURL:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5001/api/v1/courses/40232
```

---

### Example 3: Filter Courses by Grade

**JavaScript:**
```javascript
async function getHighPerformanceCourses() {
  const response = await fetch(`${API_BASE_URL}/courses?include_grades=true`, {
    headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
  });

  const result = await response.json();

  if (result.success) {
    // Filter courses with grade >= 90%
    const highGradeCourses = result.data.filter(course =>
      course.currentGrade.current >= 90
    );

    console.log(`You have ${highGradeCourses.length} courses with A grades!`);

    highGradeCourses.forEach(course => {
      console.log(`✅ ${course.name}: ${course.currentGrade.letterGrade} (${course.currentGrade.current}%)`);
    });

    return highGradeCourses;
  }
}

// Usage
getHighPerformanceCourses();
```

---

### Example 4: Get Course Grade Breakdown

**JavaScript:**
```javascript
async function getCourseGradeBreakdown(courseId) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/grade`, {
    headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
  });

  const result = await response.json();

  if (result.success) {
    const { courseName, overallGrade, assignmentGroups } = result.data;

    console.log(`\n📊 Grade Breakdown for ${courseName}`);
    console.log(`Overall: ${overallGrade.letterGrade} (${overallGrade.current}%)`);
    console.log('\nAssignment Groups:');

    assignmentGroups.forEach(group => {
      console.log(`  - ${group.name}: ${group.weight}% weight, ${group.assignmentCount} assignments`);
    });
  }

  return result.data;
}

// Usage
getCourseGradeBreakdown(40232);
```

**cURL:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5001/api/v1/courses/40232/grade
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "courseId": 40232,
    "courseName": "C1B Computer Programming 2",
    "overallGrade": {
      "current": 85.5,
      "final": 85.5,
      "letterGrade": "B",
      "finalLetterGrade": "B"
    },
    "assignmentGroups": [
      {
        "id": 12345,
        "name": "Assignments",
        "weight": 50,
        "assignmentCount": 10
      },
      {
        "id": 12346,
        "name": "Exams",
        "weight": 30,
        "assignmentCount": 3
      }
    ]
  }
}
```

---

### Example 5: Calculate Course Statistics

**JavaScript:**
```javascript
async function calculateCourseStats() {
  const response = await fetch(`${API_BASE_URL}/courses?include_grades=true`, {
    headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
  });

  const result = await response.json();

  if (result.success) {
    const courses = result.data;

    // Filter courses with grades
    const gradedCourses = courses.filter(c =>
      c.currentGrade.current != null
    );

    // Calculate statistics
    const scores = gradedCourses.map(c => c.currentGrade.current);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    console.log('📈 Your Course Statistics:');
    console.log(`Total Courses: ${courses.length}`);
    console.log(`Graded Courses: ${gradedCourses.length}`);
    console.log(`Average Grade: ${average.toFixed(2)}%`);
    console.log(`Highest Grade: ${highest}%`);
    console.log(`Lowest Grade: ${lowest}%`);

    return { average, highest, lowest, total: courses.length };
  }
}

// Usage
calculateCourseStats();
```

---

### Example 6: Get Courses Without Grades

**JavaScript:**
```javascript
async function getCoursesWithoutGrades() {
  const response = await fetch(`${API_BASE_URL}/courses?include_grades=false`, {
    headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
  });

  const result = await response.json();

  if (result.success) {
    console.log(`Found ${result.meta.count} courses (without grade info)`);

    result.data.forEach(course => {
      console.log(`- ${course.name} (${course.courseCode})`);
    });
  }

  return result.data;
}

// Usage
getCoursesWithoutGrades();
```

---

### Example 7: Get Course Assignments with Filtering

**JavaScript:**
```javascript
async function getCourseAssignments(courseId, filter = 'upcoming') {
  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/assignments?bucket=${filter}&order_by=due_at`,
    {
      headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
    }
  );

  const result = await response.json();

  if (result.success) {
    console.log(`\n📝 ${filter.toUpperCase()} Assignments (${result.meta.count})`);

    result.data.forEach(assignment => {
      console.log(`\n${assignment.name}`);
      if (assignment.dueAt) {
        console.log(`  Due: ${new Date(assignment.dueAt).toLocaleString()}`);
      }
      console.log(`  Points: ${assignment.pointsPossible}`);
      console.log(`  Submitted: ${assignment.hasSubmittedSubmissions ? '✅' : '❌'}`);
    });
  }

  return result.data;
}

// Usage Examples:
getCourseAssignments(40232, 'upcoming');  // Upcoming assignments
getCourseAssignments(40232, 'past');      // Past assignments
getCourseAssignments(40232, 'overdue');   // Overdue assignments
```

**cURL:**
```bash
# Get upcoming assignments
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5001/api/v1/courses/40232/assignments?bucket=upcoming&order_by=due_at"

# Get past assignments
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5001/api/v1/courses/40232/assignments?bucket=past&order_by=due_at"

# Get overdue assignments
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5001/api/v1/courses/40232/assignments?bucket=overdue&order_by=due_at"
```

---

### Example 8: Compare Multiple Courses

**JavaScript:**
```javascript
async function compareCourses(courseIds) {
  // Fetch multiple courses in parallel
  const promises = courseIds.map(id =>
    fetch(`${API_BASE_URL}/courses/${id}`, {
      headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
    }).then(res => res.json())
  );

  const results = await Promise.all(promises);

  console.log('\n📊 Course Comparison:');
  console.log('─'.repeat(60));

  results.forEach(result => {
    if (result.success) {
      const course = result.data;
      console.log(`\n${course.name}`);
      console.log(`  Code: ${course.courseCode}`);
      console.log(`  Grade: ${course.currentGrade.letterGrade || 'N/A'}`);
      console.log(`  Score: ${course.currentGrade.current || 'N/A'}%`);
    }
  });

  return results.map(r => r.data);
}

// Usage - Compare Computer Programming 2 and Discrete Structures 2
compareCourses([40232, 40233]);
```

---

## Assignment Examples

### Example 9: Get Assignment Details

**JavaScript:**
```javascript
async function getAssignmentDetails(assignmentId, courseId) {
  const response = await fetch(
    `${API_BASE_URL}/assignments/${assignmentId}?course_id=${courseId}`,
    {
      headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
    }
  );

  const result = await response.json();

  if (result.success) {
    const assignment = result.data;
    console.log('\n📄 Assignment Details:');
    console.log(`  Name: ${assignment.name}`);
    console.log(`  Due: ${new Date(assignment.dueAt).toLocaleString()}`);
    console.log(`  Points: ${assignment.pointsPossible}`);
    console.log(`  Type: ${assignment.submissionTypes.join(', ')}`);
    console.log(`  Status: ${assignment.isPublished ? 'Published' : 'Unpublished'}`);
  }

  return result.data;
}

// Usage
getAssignmentDetails(5001, 40232);
```

**cURL:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5001/api/v1/assignments/5001?course_id=40232"
```

---

### Example 10: Get Assignment Submission Status

**JavaScript:**
```javascript
async function getSubmissionStatus(assignmentId, courseId) {
  const response = await fetch(
    `${API_BASE_URL}/assignments/${assignmentId}/submission?course_id=${courseId}`,
    {
      headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
    }
  );

  const result = await response.json();

  if (result.success) {
    const submission = result.data;
    console.log('\n📥 Submission Status:');
    console.log(`  Status: ${submission.workflowState}`);
    console.log(`  Submitted: ${submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Not submitted'}`);
    console.log(`  Score: ${submission.score || 'Not graded'}`);
    console.log(`  Late: ${submission.late ? 'Yes' : 'No'}`);
    console.log(`  Missing: ${submission.missing ? 'Yes' : 'No'}`);
  }

  return result.data;
}

// Usage
getSubmissionStatus(5001, 40232);
```

---

## User Examples

### Example 11: Get Current User Profile

**JavaScript:**
```javascript
async function getUserProfile() {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
  });

  const result = await response.json();

  if (result.success) {
    const user = result.data;
    console.log('\n👤 User Profile:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Avatar: ${user.avatarUrl}`);
  }

  return result.data;
}

// Usage
getUserProfile();
```

**cURL:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5001/api/v1/user/profile
```

---

## Activity Feed Examples

### Example 12: Get Recent Activity

**JavaScript:**
```javascript
async function getRecentActivity(limit = 10) {
  const response = await fetch(
    `${API_BASE_URL}/activity/feed?limit=${limit}&types=announcement,assignment`,
    {
      headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
    }
  );

  const result = await response.json();

  if (result.success) {
    console.log(`\n📰 Recent Activity (${result.meta.count} items)`);

    result.data.forEach(item => {
      if (item.type === 'announcement') {
        console.log(`\n📢 ${item.title}`);
        console.log(`   By: ${item.author.displayName}`);
        console.log(`   Date: ${new Date(item.date).toLocaleString()}`);
      } else if (item.type === 'assignment') {
        console.log(`\n📝 ${item.title}`);
        console.log(`   Due: ${new Date(item.dueAt).toLocaleString()}`);
        console.log(`   Points: ${item.pointsPossible}`);
      }
    });
  }

  return result.data;
}

// Usage
getRecentActivity(20);
```

**cURL:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5001/api/v1/activity/feed?limit=10"
```

---

### Example 13: Filter Activity by Date Range

**JavaScript:**
```javascript
async function getActivityByDateRange(startDate, endDate) {
  const params = new URLSearchParams({
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    limit: 50
  });

  const response = await fetch(
    `${API_BASE_URL}/activity/feed?${params}`,
    {
      headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
    }
  );

  const result = await response.json();

  if (result.success) {
    console.log(`\n📅 Activity from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    console.log(`Found ${result.meta.count} items\n`);

    result.data.forEach(item => {
      console.log(`${item.type === 'announcement' ? '📢' : '📝'} ${item.title}`);
    });
  }

  return result.data;
}

// Usage - Get last week's activity
const today = new Date();
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
getActivityByDateRange(lastWeek, today);
```

---

### Example 14: Get Only Announcements

**JavaScript:**
```javascript
async function getAnnouncements(limit = 10) {
  const response = await fetch(
    `${API_BASE_URL}/activity/feed?types=announcement&limit=${limit}`,
    {
      headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
    }
  );

  const result = await response.json();

  if (result.success) {
    console.log(`\n📢 Recent Announcements (${result.meta.count})`);

    result.data.forEach(announcement => {
      console.log(`\n${announcement.title}`);
      console.log(`By: ${announcement.author.displayName}`);
      console.log(`Date: ${new Date(announcement.date).toLocaleString()}`);
      console.log(`Link: ${announcement.htmlUrl}`);
    });
  }

  return result.data;
}

// Usage
getAnnouncements(5);
```

---

## React Component Examples

### Example 15: Course Card Component

```javascript
import React from 'react';

export function CourseCard({ course }) {
  return (
    <div className="course-card">
      <h3>{course.name}</h3>
      <p className="course-code">{course.courseCode}</p>

      {course.currentGrade.letterGrade && (
        <div className="grade-badge">
          <span className="letter">{course.currentGrade.letterGrade}</span>
          <span className="score">{course.currentGrade.current}%</span>
        </div>
      )}

      <div className="course-meta">
        <span>📚 {course.enrollmentType}</span>
        <span>⭐ {course.isFavorite ? 'Favorite' : ''}</span>
      </div>

      <a
        href={course.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="view-button"
      >
        View in Canvas →
      </a>
    </div>
  );
}

// Usage
function CourseList() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/v1/courses?include_grades=true', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCourses(data.data));
  }, []);

  return (
    <div className="course-grid">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

---

### Example 16: Course Dashboard Component

```javascript
import React, { useState, useEffect } from 'react';

export function CourseDashboard({ courseId }) {
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourseData() {
      const token = localStorage.getItem('canvasToken');

      // Fetch course and assignments in parallel
      const [courseRes, assignmentsRes] = await Promise.all([
        fetch(`http://localhost:5001/api/v1/courses/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:5001/api/v1/courses/${courseId}/assignments?bucket=upcoming`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const courseData = await courseRes.json();
      const assignmentsData = await assignmentsRes.json();

      setCourse(courseData.data);
      setAssignments(assignmentsData.data);
      setLoading(false);
    }

    loadCourseData();
  }, [courseId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="course-dashboard">
      <header>
        <h1>{course.name}</h1>
        <div className="grade">
          Current Grade: {course.currentGrade.letterGrade} ({course.currentGrade.current}%)
        </div>
      </header>

      <section className="upcoming-assignments">
        <h2>Upcoming Assignments ({assignments.length})</h2>
        {assignments.map(assignment => (
          <div key={assignment.id} className="assignment-item">
            <h3>{assignment.name}</h3>
            <p>Due: {new Date(assignment.dueAt).toLocaleString()}</p>
            <p>{assignment.pointsPossible} points</p>
          </div>
        ))}
      </section>
    </div>
  );
}
```

---

## Complete Workflows

### Example 17: Complete Dashboard Data Fetch

**JavaScript:**
```javascript
async function loadDashboard() {
  try {
    // Fetch all data in parallel
    const [userRes, coursesRes, activityRes] = await Promise.all([
      fetch(`${API_BASE_URL}/user/profile`, {
        headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
      }),
      fetch(`${API_BASE_URL}/courses?include_grades=true`, {
        headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
      }),
      fetch(`${API_BASE_URL}/activity/feed?limit=10`, {
        headers: { 'Authorization': `Bearer ${CANVAS_TOKEN}` }
      })
    ]);

    const [user, courses, activity] = await Promise.all([
      userRes.json(),
      coursesRes.json(),
      activityRes.json()
    ]);

    // Calculate statistics
    const gradedCourses = courses.data.filter(c => c.currentGrade.current != null);
    const averageGrade = gradedCourses.reduce((sum, c) =>
      sum + c.currentGrade.current, 0
    ) / gradedCourses.length;

    return {
      user: user.data,
      courses: courses.data,
      activity: activity.data,
      stats: {
        totalCourses: courses.data.length,
        averageGrade: averageGrade.toFixed(2),
        recentActivity: activity.data.length
      }
    };
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}

// Usage
loadDashboard().then(dashboard => {
  console.log(`Welcome, ${dashboard.user.name}!`);
  console.log(`You have ${dashboard.stats.totalCourses} courses`);
  console.log(`Average grade: ${dashboard.stats.averageGrade}%`);
  console.log(`Recent activity items: ${dashboard.stats.recentActivity}`);
});
```

---

For complete API documentation, see:
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Full endpoint reference
- [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) - Quick lookup guide
