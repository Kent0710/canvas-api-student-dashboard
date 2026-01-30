# Canvas Student Dashboard - Backend Implementation Plan

## Overview
Build a production-ready Express.js backend that integrates with Canvas LMS API (dlsl.instructure.com) to provide a student dashboard with course information, grades, assignments, and activity feed. The backend handles authentication, pagination, rate limiting, caching, and data normalization while enforcing strict read-only access.

## Current State
- Minimal Express.js scaffold with CORS and basic middleware
- Single welcome endpoint at `GET /api`
- Dependencies: express, cors, dotenv, nodemon
- No Canvas API integration exists

## Architecture Summary

### Project Structure
```
backend/
├── src/
│   ├── config/              # Configuration management
│   ├── middleware/          # Auth, error handling, validation, rate limiting
│   ├── services/
│   │   ├── canvas/          # Canvas API client and resource services
│   │   └── cache/           # Caching layer
│   ├── controllers/         # Request/response handlers
│   ├── routes/              # API route definitions
│   ├── utils/               # Normalizers, validators, error classes
│   └── constants/           # Cache TTLs, error codes, Canvas endpoints
├── tests/                   # Unit and integration tests
└── server.js                # Entry point
```

### Key Architectural Decisions

1. **Service Layer Pattern**: Separate Canvas API logic from HTTP handling
2. **In-Memory Caching**: node-cache for simplicity (no external dependencies)
3. **Data Normalization**: Transform Canvas responses to lean, frontend-friendly objects
4. **Stateless Authentication**: Pass-through Canvas token per request (no storage)
5. **Read-Only Enforcement**: Middleware blocks all non-GET requests

### Technology Stack

**New Dependencies:**
- `axios` + `axios-retry` - HTTP client with automatic retry
- `node-cache` - In-memory caching
- `winston` - Structured logging
- `joi` - Request validation
- `express-rate-limit` - API rate limiting
- `helmet` - Security headers
- `jest` + `supertest` + `nock` - Testing framework

---

## API Routes Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All endpoints require a Canvas Personal Access Token sent via Authorization header:
```
Authorization: Bearer <your_canvas_token>
```

### Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": true,
    "cacheAge": 45
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "details": "Technical details (development only)"
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z"
  }
}
```

---

## API Endpoints

### 1. User Profile

#### Get Current User
```
GET /api/v1/user/profile
```

**Description**: Retrieves the authenticated user's profile information.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "name": "John Doe",
    "sortableName": "Doe, John",
    "email": "john.doe@example.com",
    "avatarUrl": "https://canvas.instructure.com/images/messages/avatar-50.png",
    "locale": "en",
    "effectiveLocale": "en"
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": true,
    "cacheAge": 120
  }
}
```

**Error Responses:**
- `401 AUTHENTICATION_ERROR` - Missing or invalid token
- `502 CANVAS_API_ERROR` - Canvas API unavailable

---

### 2. Courses

#### Get Active Courses
```
GET /api/v1/courses
```

**Description**: Retrieves all active courses for the authenticated user with current grades.

**Query Parameters:**
- `include_grades` (boolean, optional) - Include grade information (default: `true`)
- `enrollment_state` (string, optional) - Filter by enrollment state (default: `active`)

**Example Request:**
```
GET /api/v1/courses?include_grades=true&enrollment_state=active
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "name": "Introduction to Computer Science",
      "courseCode": "CS 101",
      "enrollmentType": "student",
      "currentGrade": {
        "current": 87.5,
        "final": 87.5,
        "letterGrade": "B+"
      },
      "term": 5678,
      "startDate": "2026-01-15T00:00:00Z",
      "endDate": "2026-05-15T23:59:59Z",
      "isFavorite": true,
      "workflowState": "available"
    },
    {
      "id": 12346,
      "name": "Calculus I",
      "courseCode": "MATH 101",
      "enrollmentType": "student",
      "currentGrade": {
        "current": 92.3,
        "final": 92.3,
        "letterGrade": "A-"
      },
      "term": 5678,
      "startDate": "2026-01-15T00:00:00Z",
      "endDate": "2026-05-15T23:59:59Z",
      "isFavorite": false,
      "workflowState": "available"
    }
  ],
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": true,
    "cacheAge": 45
  }
}
```

**Error Responses:**
- `401 AUTHENTICATION_ERROR` - Missing or invalid token
- `502 CANVAS_API_ERROR` - Canvas API error

---

#### Get Course Details
```
GET /api/v1/courses/:courseId
```

**Description**: Retrieves detailed information for a specific course.

**Path Parameters:**
- `courseId` (number, required) - Canvas course ID

**Example Request:**
```
GET /api/v1/courses/12345
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "name": "Introduction to Computer Science",
    "courseCode": "CS 101",
    "enrollmentType": "student",
    "currentGrade": {
      "current": 87.5,
      "final": 87.5,
      "letterGrade": "B+"
    },
    "term": 5678,
    "startDate": "2026-01-15T00:00:00Z",
    "endDate": "2026-05-15T23:59:59Z",
    "isFavorite": true,
    "workflowState": "available",
    "syllabusBody": "<p>Course syllabus content...</p>",
    "publicDescription": "An introductory course..."
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": true,
    "cacheAge": 30
  }
}
```

**Error Responses:**
- `401 AUTHENTICATION_ERROR` - Missing or invalid token
- `404 NOT_FOUND` - Course not found or not enrolled
- `502 CANVAS_API_ERROR` - Canvas API error

---

#### Get Course Grade Details
```
GET /api/v1/courses/:courseId/grade
```

**Description**: Retrieves detailed grade information for a specific course, including grading periods if applicable.

**Path Parameters:**
- `courseId` (number, required) - Canvas course ID

**Example Request:**
```
GET /api/v1/courses/12345/grade
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": 12345,
    "courseName": "Introduction to Computer Science",
    "currentScore": 87.5,
    "finalScore": 87.5,
    "letterGrade": "B+",
    "unpostedCurrentScore": 88.0,
    "unpostedFinalScore": 88.0,
    "gradingPeriods": [
      {
        "id": 1,
        "title": "First Quarter",
        "currentScore": 85.0,
        "finalScore": 85.0
      },
      {
        "id": 2,
        "title": "Second Quarter",
        "currentScore": 90.0,
        "finalScore": 90.0
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": true,
    "cacheAge": 15
  }
}
```

**Error Responses:**
- `401 AUTHENTICATION_ERROR` - Missing or invalid token
- `404 NOT_FOUND` - Course not found or not enrolled
- `502 CANVAS_API_ERROR` - Canvas API error

---

### 3. Assignments

#### Get Course Assignments
```
GET /api/v1/courses/:courseId/assignments
```

**Description**: Retrieves all assignments for a specific course with optional filtering.

**Path Parameters:**
- `courseId` (number, required) - Canvas course ID

**Query Parameters:**
- `bucket` (string, optional) - Filter by bucket: `upcoming`, `past`, `overdue`, `undated`
- `order_by` (string, optional) - Sort order: `due_at`, `name`, `position` (default: `due_at`)

**Example Request:**
```
GET /api/v1/courses/12345/assignments?bucket=upcoming&order_by=due_at
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 67890,
      "courseId": 12345,
      "name": "Programming Assignment 1",
      "description": "<p>Write a program that...</p>",
      "dueAt": "2026-02-15T23:59:00Z",
      "unlockAt": "2026-02-01T00:00:00Z",
      "lockAt": "2026-02-20T23:59:00Z",
      "pointsPossible": 100,
      "submissionTypes": ["online_upload", "online_text_entry"],
      "hasSubmittedSubmissions": false,
      "isPublished": true,
      "gradingType": "points",
      "htmlUrl": "https://dlsl.instructure.com/courses/12345/assignments/67890"
    },
    {
      "id": 67891,
      "courseId": 12345,
      "name": "Quiz 1",
      "description": "<p>Complete the quiz on...</p>",
      "dueAt": "2026-02-10T23:59:00Z",
      "unlockAt": "2026-02-08T00:00:00Z",
      "lockAt": null,
      "pointsPossible": 50,
      "submissionTypes": ["online_quiz"],
      "hasSubmittedSubmissions": true,
      "isPublished": true,
      "gradingType": "points",
      "htmlUrl": "https://dlsl.instructure.com/courses/12345/assignments/67891"
    }
  ],
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": true,
    "cacheAge": 60
  }
}
```

**Error Responses:**
- `401 AUTHENTICATION_ERROR` - Missing or invalid token
- `404 NOT_FOUND` - Course not found
- `400 VALIDATION_ERROR` - Invalid query parameters
- `502 CANVAS_API_ERROR` - Canvas API error

---

#### Get Assignment Details
```
GET /api/v1/assignments/:assignmentId
```

**Description**: Retrieves full details for a specific assignment including instructions, attachments, and rubric.

**Path Parameters:**
- `assignmentId` (number, required) - Canvas assignment ID

**Query Parameters:**
- `course_id` (number, required) - Canvas course ID

**Example Request:**
```
GET /api/v1/assignments/67890?course_id=12345
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 67890,
    "courseId": 12345,
    "name": "Programming Assignment 1",
    "description": "<p>Write a program that calculates the factorial of a number...</p>",
    "dueAt": "2026-02-15T23:59:00Z",
    "unlockAt": "2026-02-01T00:00:00Z",
    "lockAt": "2026-02-20T23:59:00Z",
    "pointsPossible": 100,
    "submissionTypes": ["online_upload", "online_text_entry"],
    "allowedExtensions": ["py", "java", "cpp"],
    "isPublished": true,
    "gradingType": "points",
    "htmlUrl": "https://dlsl.instructure.com/courses/12345/assignments/67890",
    "attachments": [
      {
        "id": 111,
        "filename": "starter_code.zip",
        "displayName": "Starter Code",
        "url": "https://dlsl.instructure.com/files/111/download",
        "contentType": "application/zip",
        "size": 2048
      }
    ],
    "rubric": [
      {
        "id": "criterion_1",
        "description": "Code Quality",
        "points": 30,
        "ratings": [
          { "description": "Excellent", "points": 30 },
          { "description": "Good", "points": 20 },
          { "description": "Needs Improvement", "points": 10 }
        ]
      },
      {
        "id": "criterion_2",
        "description": "Correctness",
        "points": 70,
        "ratings": [
          { "description": "All tests pass", "points": 70 },
          { "description": "Most tests pass", "points": 50 },
          { "description": "Some tests pass", "points": 30 }
        ]
      }
    ],
    "hasSubmittedSubmissions": false
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": false,
    "cacheAge": 0
  }
}
```

**Error Responses:**
- `401 AUTHENTICATION_ERROR` - Missing or invalid token
- `400 VALIDATION_ERROR` - Missing course_id parameter
- `404 NOT_FOUND` - Assignment not found
- `502 CANVAS_API_ERROR` - Canvas API error

---

#### Get Assignment Submission
```
GET /api/v1/assignments/:assignmentId/submission
```

**Description**: Retrieves the authenticated user's submission for a specific assignment.

**Path Parameters:**
- `assignmentId` (number, required) - Canvas assignment ID

**Query Parameters:**
- `course_id` (number, required) - Canvas course ID

**Example Request:**
```
GET /api/v1/assignments/67890/submission?course_id=12345
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 98765,
    "assignmentId": 67890,
    "userId": 12345,
    "submittedAt": "2026-02-14T15:30:00Z",
    "score": 85,
    "grade": "85",
    "late": false,
    "missing": false,
    "excused": false,
    "workflowState": "graded",
    "gradeMatchesCurrentSubmission": true,
    "submissionType": "online_upload",
    "attempt": 1,
    "attachments": [
      {
        "id": 222,
        "filename": "solution.py",
        "displayName": "My Solution",
        "url": "https://dlsl.instructure.com/files/222/download",
        "contentType": "text/x-python",
        "size": 1024
      }
    ],
    "gradedAt": "2026-02-16T10:00:00Z",
    "graderComments": "Good work! Minor improvements needed in edge case handling."
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": true,
    "cacheAge": 10
  }
}
```

**Response (No Submission):**
```json
{
  "success": true,
  "data": {
    "id": null,
    "assignmentId": 67890,
    "userId": 12345,
    "submittedAt": null,
    "score": null,
    "grade": null,
    "late": false,
    "missing": true,
    "excused": false,
    "workflowState": "unsubmitted",
    "gradeMatchesCurrentSubmission": false,
    "submissionType": null,
    "attempt": null
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": false,
    "cacheAge": 0
  }
}
```

**Error Responses:**
- `401 AUTHENTICATION_ERROR` - Missing or invalid token
- `400 VALIDATION_ERROR` - Missing course_id parameter
- `404 NOT_FOUND` - Assignment not found
- `502 CANVAS_API_ERROR` - Canvas API error

---

### 4. Activity Feed

#### Get Activity Feed
```
GET /api/v1/activity/feed
```

**Description**: Retrieves a chronological feed of announcements and assignments from all active courses. Default range is the last 30 days.

**Query Parameters:**
- `start_date` (ISO 8601 date, optional) - Start date for activity (default: 30 days ago)
- `end_date` (ISO 8601 date, optional) - End date for activity (default: today)
- `types` (comma-separated string, optional) - Filter by type: `announcement`, `assignment` (default: both)
- `limit` (number, optional) - Max items to return (default: 50, max: 200)

**Example Request:**
```
GET /api/v1/activity/feed?start_date=2026-01-01&end_date=2026-01-31&types=announcement,assignment&limit=100
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "type": "announcement",
        "date": "2026-01-29T14:30:00Z",
        "courseId": 12345,
        "courseName": "Introduction to Computer Science",
        "data": {
          "id": 1111,
          "title": "Class Cancelled Tomorrow",
          "message": "<p>Due to weather conditions, class is cancelled...</p>",
          "postedAt": "2026-01-29T14:30:00Z",
          "author": {
            "id": 999,
            "name": "Dr. Jane Smith",
            "avatarUrl": "https://canvas.instructure.com/images/avatar.png"
          },
          "htmlUrl": "https://dlsl.instructure.com/courses/12345/discussion_topics/1111"
        }
      },
      {
        "type": "assignment",
        "date": "2026-01-28T00:00:00Z",
        "courseId": 12346,
        "courseName": "Calculus I",
        "data": {
          "id": 67892,
          "name": "Homework 3",
          "dueAt": "2026-02-05T23:59:00Z",
          "pointsPossible": 50,
          "isPublished": true,
          "htmlUrl": "https://dlsl.instructure.com/courses/12346/assignments/67892"
        }
      },
      {
        "type": "announcement",
        "date": "2026-01-27T09:15:00Z",
        "courseId": 12346,
        "courseName": "Calculus I",
        "data": {
          "id": 1112,
          "title": "Office Hours Update",
          "message": "<p>My office hours have changed to...</p>",
          "postedAt": "2026-01-27T09:15:00Z",
          "author": {
            "id": 888,
            "name": "Prof. John Doe",
            "avatarUrl": "https://canvas.instructure.com/images/avatar.png"
          },
          "htmlUrl": "https://dlsl.instructure.com/courses/12346/discussion_topics/1112"
        }
      }
    ],
    "summary": {
      "totalItems": 3,
      "announcements": 2,
      "assignments": 1,
      "dateRange": {
        "start": "2026-01-01T00:00:00Z",
        "end": "2026-01-31T23:59:59Z"
      }
    }
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": true,
    "cacheAge": 20
  }
}
```

**Error Responses:**
- `401 AUTHENTICATION_ERROR` - Missing or invalid token
- `400 VALIDATION_ERROR` - Invalid date format or parameters
- `502 CANVAS_API_ERROR` - Canvas API error

---

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_ERROR` | 401 | Missing or invalid Canvas token |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `CANVAS_API_ERROR` | 502 | Canvas API returned an error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `FORBIDDEN` | 403 | Read-only mode (POST/PUT/DELETE blocked) |

---

## Implementation Phases

### Phase 1: Foundation & Configuration
**Goal**: Set up project structure, dependencies, and core configuration

**Tasks:**
1. Install all production and dev dependencies
2. Create project directory structure (src/, tests/)
3. Set up environment variables (.env.example with Canvas URL, token placeholder, cache TTLs)
4. Configure Winston logger (console in dev, files in production)
5. Create custom error classes (AppError, CanvasAPIError, ValidationError, etc.)
6. Set up app.js with middleware stack (helmet, cors, json parser, request logging)

**Critical Files:**
- `src/config/index.js` - Central config aggregator
- `src/config/canvas.config.js` - Canvas API base URL, timeout
- `src/config/logger.config.js` - Winston setup
- `src/utils/errors.js` - Custom error classes
- `src/app.js` - Express app setup
- `.env.example` - Environment template

**Environment Variables:**
```env
NODE_ENV=development
PORT=5000
CANVAS_API_BASE_URL=https://dlsl.instructure.com/api/v1
CANVAS_API_TOKEN=your_token_here
CACHE_ENABLED=true
CACHE_TTL_COURSES=300
CACHE_TTL_ASSIGNMENTS=180
CACHE_TTL_ANNOUNCEMENTS=120
FRONTEND_URL=http://localhost:3000
READ_ONLY_MODE=true
```

### Phase 2: Canvas API Client
**Goal**: Build robust Canvas API integration with pagination, retry, and rate limiting

**Tasks:**
1. Create axios instance with Canvas base URL and interceptors
2. Implement request interceptor to add Authorization header
3. Implement response interceptor for error handling
4. Add automatic pagination with `getAllPages()` method
5. Implement retry logic with exponential backoff (axios-retry)
6. Add rate limit detection from Canvas headers
7. Create mock Canvas responses for testing
8. Write unit tests for Canvas client

**Critical Files:**
- `src/services/canvas/canvasClient.js` - Core Canvas HTTP client
- `src/utils/parseLinkHeader.js` - Parse Canvas pagination headers
- `tests/fixtures/canvasResponses.js` - Mock Canvas data

**Key Methods:**
```javascript
class CanvasClient {
  async get(endpoint, options = {})           // Single request
  async getAllPages(endpoint, options = {})   // Auto-paginate
  parseRateLimitHeaders(headers)              // Extract rate limit info
  handleRateLimitError(error)                 // Backoff on 429
}
```

### Phase 3: Canvas Resource Services
**Goal**: Implement business logic for Canvas resources (courses, assignments, announcements)

**Tasks:**
1. Implement userService.js (getCurrentUser)
2. Implement courseService.js (getActiveCourses, getCourseById, getCourseEnrollment)
3. Implement assignmentService.js (getCourseAssignments, getAssignmentById, getAssignmentSubmission)
4. Implement announcementService.js (getCourseAnnouncements, getRecentAnnouncements)
5. Create data normalizers for each resource type
6. Write unit tests for all services with nock

**Critical Files:**
- `src/services/canvas/userService.js`
- `src/services/canvas/courseService.js`
- `src/services/canvas/assignmentService.js`
- `src/services/canvas/announcementService.js`
- `src/utils/normalizer.js`

### Phase 4: Caching Layer
**Goal**: Add caching to reduce Canvas API calls and improve performance

**Tasks:**
1. Implement cache service with get, set, del, flush methods
2. Add cache statistics tracking (hits, misses, size)
3. Integrate caching into all Canvas services
4. Support cache bypass via X-No-Cache header
5. Write cache integration tests

**Critical Files:**
- `src/services/cache/cacheService.js`
- `src/constants/cacheTTL.js`

**Cache TTL Strategy:**
- User Profile: 600s (10 min)
- Courses: 300s (5 min)
- Assignments: 180s (3 min)
- Submissions: 120s (2 min)
- Announcements: 120s (2 min)

### Phase 5: API Endpoints & Controllers
**Goal**: Build RESTful endpoints for frontend consumption

**Tasks:**
1. Implement user.controller.js and user.routes.js
2. Implement courses.controller.js and courses.routes.js
3. Implement assignments.controller.js and assignments.routes.js
4. Implement activity.controller.js and activity.routes.js (aggregate announcements + assignments)
5. Add request validation middleware (Joi schemas)
6. Create route aggregator (src/routes/index.js)
7. Write integration tests for all routes

**Critical Files:**
- `src/controllers/*.controller.js` - Request handlers
- `src/routes/*.routes.js` - Route definitions
- `src/middleware/validation.middleware.js` - Joi schemas
- `src/utils/responseFormatter.js` - Consistent response format

### Phase 6: Security & Middleware
**Goal**: Implement authentication, authorization, and security hardening

**Tasks:**
1. Implement auth middleware (extract Bearer token, validate format)
2. Implement read-only enforcement middleware (block POST/PUT/PATCH/DELETE)
3. Add rate limiter middleware (100 req/min per IP)
4. Add request logging middleware
5. Configure helmet for security headers
6. Configure CORS (whitelist frontend URL only)
7. Implement global error handler
8. Test security middleware

**Critical Files:**
- `src/middleware/auth.middleware.js` - Token extraction and validation
- `src/middleware/error.middleware.js` - Global error handling
- `src/middleware/rateLimiter.middleware.js` - Rate limiting
- `src/middleware/requestLogger.middleware.js` - HTTP logging

**Security Requirements:**
- Never store Canvas tokens (pass-through only)
- Never log tokens
- Block all mutation requests (POST/PUT/PATCH/DELETE)
- Sanitize error messages (no token/stack trace leakage)
- CORS whitelist frontend URL only
- Rate limit all endpoints

### Phase 7: Testing & Documentation
**Goal**: Achieve code coverage and document the API

**Tasks:**
1. Write unit tests for all services, controllers, utils
2. Write integration tests for all routes
3. Set up Jest with coverage thresholds (70%)
4. Create Postman/Thunder Client collection
5. Write API documentation in README
6. Document local development setup
7. Test end-to-end flows

**Critical Files:**
- `jest.config.js` - Test configuration
- `tests/setup.js` - Test environment setup
- `tests/fixtures/canvasResponses.js` - Mock data
- `README.md` - API documentation

---

## Critical Files to Create/Modify

### High Priority (Must implement first)
1. **src/services/canvas/canvasClient.js** - Foundation for all Canvas API calls
2. **src/middleware/error.middleware.js** - Error handling affects all endpoints
3. **src/utils/normalizer.js** - Data transformation used by all controllers
4. **src/services/cache/cacheService.js** - Performance optimization for all services
5. **src/app.js** - Orchestrates middleware, routes, error handling
6. **src/config/index.js** - Configuration management

### Medium Priority (Core functionality)
7. **src/services/canvas/courseService.js** - Course data access
8. **src/services/canvas/assignmentService.js** - Assignment data access
9. **src/services/canvas/announcementService.js** - Announcement data access
10. **src/controllers/courses.controller.js** - Course endpoints
11. **src/controllers/assignments.controller.js** - Assignment endpoints
12. **src/controllers/activity.controller.js** - Activity feed (aggregates announcements + assignments)

### Lower Priority (Polish)
13. **src/middleware/auth.middleware.js** - Authentication
14. **src/middleware/validation.middleware.js** - Input validation
15. **tests/** - Comprehensive test suite

---

## Verification & Testing

### Manual Testing Checklist
1. **Setup**
   - [ ] .env file created with Canvas token
   - [ ] Dependencies installed (npm install)
   - [ ] Server starts without errors (npm run dev)

2. **User Endpoint**
   - [ ] GET /api/v1/user/profile returns current user info
   - [ ] Response includes id, name, email

3. **Courses Endpoints**
   - [ ] GET /api/v1/courses returns active courses
   - [ ] Response includes currentGrade for each course
   - [ ] GET /api/v1/courses/:id returns course details
   - [ ] GET /api/v1/courses/:id/grade returns grade breakdown

4. **Assignments Endpoints**
   - [ ] GET /api/v1/courses/:id/assignments returns assignments
   - [ ] GET /api/v1/assignments/:id?course_id=X returns assignment details
   - [ ] GET /api/v1/assignments/:id/submission?course_id=X returns submission status

5. **Activity Feed**
   - [ ] GET /api/v1/activity/feed returns last 30 days by default
   - [ ] Response includes both announcements and assignments
   - [ ] Items are sorted by date (newest first)
   - [ ] Filtering by date range works
   - [ ] Limit parameter works (default 50, max 200)

6. **Caching**
   - [ ] Second request to same endpoint is faster (cache hit)
   - [ ] Cache statistics available
   - [ ] X-No-Cache header bypasses cache

7. **Error Handling**
   - [ ] Invalid Canvas token returns 401
   - [ ] Invalid course ID returns 404
   - [ ] Rate limit exceeded returns 429
   - [ ] Canvas API errors return user-friendly messages

8. **Security**
   - [ ] POST requests return 403 (read-only mode)
   - [ ] Missing Authorization header returns 401
   - [ ] CORS allows frontend URL only
   - [ ] Error responses don't leak sensitive info

### Automated Testing
```bash
npm run test              # Run all tests
npm run test:coverage     # Generate coverage report (should be >70%)
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
```

---

## Development Workflow

### Initial Setup
```bash
cd backend
cp .env.example .env
# Edit .env and add your Canvas token
npm install
npm run dev
```

### Environment Configuration
Update `.env` with:
- `CANVAS_API_BASE_URL=https://dlsl.instructure.com/api/v1`
- `CANVAS_API_TOKEN=<your_personal_access_token>`
- `FRONTEND_URL=http://localhost:3000`

### Development Commands
```bash
npm run dev          # Start with auto-reload
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code style
npm run lint:fix     # Auto-fix linting issues
```

---

## Success Criteria

✅ All API endpoints return correct, normalized data
✅ Caching reduces Canvas API calls by >50%
✅ Error handling provides user-friendly messages
✅ Read-only security enforced (no data modification)
✅ Response times <500ms for cached requests
✅ Test coverage >70%
✅ No sensitive information leaked in errors
✅ Frontend can successfully integrate with all endpoints
