# Canvas Student Dashboard - API Endpoints Reference

Base URL: `http://localhost:5001`

All API endpoints (except `/health` and `/cache/stats`) require authentication via Bearer token.

## Authentication

Include the Canvas API token in the Authorization header:
```
Authorization: Bearer YOUR_CANVAS_TOKEN
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": false,
    "cacheAge": 0
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "timestamp": "2026-01-30T12:00:00Z"
  }
}
```

---

## Public Endpoints (No Authentication Required)

### Health Check

**GET** `/health`

Check server health and status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-30T12:00:00Z",
    "uptime": 123.45,
    "environment": "development"
  }
}
```

---

### Cache Statistics

**GET** `/cache/stats`

Get cache performance statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "hits": 42,
    "misses": 10,
    "sets": 52,
    "hitRate": 80.77,
    "keys": 15,
    "ksize": 1024,
    "vsize": 2048
  }
}
```

---

## User Endpoints

### Get Current User Profile

**GET** `/api/v1/user/profile`

Get the currently authenticated user's profile information.

**Headers:**
```
Authorization: Bearer YOUR_CANVAS_TOKEN
X-No-Cache: true (optional - bypass cache)
```

**Cache TTL:** 10 minutes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5678,
    "name": "BARBIN, KURT ANGELO",
    "shortName": "KURT ANGELO BARBIN",
    "sortableName": "BARBIN, KURT ANGELO",
    "email": "kurt.barbin@example.com",
    "avatarUrl": "https://dlsl.instructure.com/...",
    "locale": null
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": true,
    "cacheAge": 45
  }
}
```

---

## Course Endpoints

### Get Active Courses

**GET** `/api/v1/courses`

Get all active courses for the current user with optional grade information.

**Headers:**
```
Authorization: Bearer YOUR_CANVAS_TOKEN
X-No-Cache: true (optional)
```

**Query Parameters:**
- `include_grades` (boolean, default: `true`) - Include grade information

**Cache TTL:** 5 minutes

**Example Request:**
```bash
GET /api/v1/courses?include_grades=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 40232,
      "name": "C1B Computer Programming 2",
      "courseCode": "Coprog2",
      "workflowState": "available",
      "startDate": null,
      "endDate": null,
      "enrollmentType": "student",
      "enrollmentState": "active",
      "currentGrade": {
        "current": 85.5,
        "final": 85.5,
        "letterGrade": "B",
        "finalLetterGrade": "B"
      },
      "isFavorite": false,
      "htmlUrl": "https://dlsl.instructure.com/courses/40232"
    }
  ],
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": false,
    "count": 68
  }
}
```

---

### Get Course Details

**GET** `/api/v1/courses/:courseId`

Get detailed information for a specific course.

**Headers:**
```
Authorization: Bearer YOUR_CANVAS_TOKEN
```

**URL Parameters:**
- `courseId` (required) - Canvas course ID

**Cache TTL:** 5 minutes

**Example Request:**
```bash
GET /api/v1/courses/40232
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 40232,
    "name": "C1B Computer Programming 2",
    "courseCode": "Coprog2",
    "workflowState": "available",
    "startDate": null,
    "endDate": null,
    "enrollmentType": "student",
    "enrollmentState": "active",
    "currentGrade": {
      "current": 85.5,
      "final": 85.5,
      "letterGrade": "B",
      "finalLetterGrade": "B"
    },
    "isFavorite": false,
    "htmlUrl": "https://dlsl.instructure.com/courses/40232"
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": true,
    "cacheAge": 30
  }
}
```

---

### Get Course Grade Breakdown

**GET** `/api/v1/courses/:courseId/grade`

Get detailed grade breakdown for a course including assignment groups.

**Headers:**
```
Authorization: Bearer YOUR_CANVAS_TOKEN
```

**URL Parameters:**
- `courseId` (required) - Canvas course ID

**Cache TTL:** 5 minutes

**Example Request:**
```bash
GET /api/v1/courses/40232/grade
```

**Response:**
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
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": false
  }
}
```

---

### Get Course Assignments

**GET** `/api/v1/courses/:courseId/assignments`

Get assignments for a specific course with optional filtering.

**Headers:**
```
Authorization: Bearer YOUR_CANVAS_TOKEN
```

**URL Parameters:**
- `courseId` (required) - Canvas course ID

**Query Parameters:**
- `bucket` (optional) - Filter by bucket: `upcoming`, `past`, `overdue`, `undated`
- `order_by` (optional) - Order by: `due_at`, `name`, `position`

**Cache TTL:** 3 minutes

**Example Request:**
```bash
GET /api/v1/courses/40232/assignments?bucket=upcoming&order_by=due_at
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5001,
      "courseId": 40232,
      "name": "Programming Assignment 1",
      "description": "<p>Complete the programming tasks</p>",
      "dueAt": "2026-02-15T23:59:00Z",
      "unlockAt": null,
      "lockAt": null,
      "pointsPossible": 100,
      "submissionTypes": ["online_upload"],
      "hasSubmittedSubmissions": true,
      "isPublished": true,
      "gradingType": "points",
      "htmlUrl": "https://dlsl.instructure.com/courses/40232/assignments/5001",
      "createdAt": "2026-01-20T00:00:00Z",
      "updatedAt": "2026-01-20T00:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": false,
    "count": 5
  }
}
```

---

## Assignment Endpoints

### Get Assignment Details

**GET** `/api/v1/assignments/:assignmentId`

Get detailed information for a specific assignment.

**Headers:**
```
Authorization: Bearer YOUR_CANVAS_TOKEN
```

**URL Parameters:**
- `assignmentId` (required) - Canvas assignment ID

**Query Parameters:**
- `course_id` (required) - Canvas course ID

**Cache TTL:** 3 minutes

**Example Request:**
```bash
GET /api/v1/assignments/5001?course_id=40232
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5001,
    "courseId": 40232,
    "name": "Programming Assignment 1",
    "description": "<p>Complete the programming tasks</p>",
    "dueAt": "2026-02-15T23:59:00Z",
    "unlockAt": null,
    "lockAt": null,
    "pointsPossible": 100,
    "submissionTypes": ["online_upload"],
    "hasSubmittedSubmissions": true,
    "isPublished": true,
    "gradingType": "points",
    "htmlUrl": "https://dlsl.instructure.com/courses/40232/assignments/5001",
    "createdAt": "2026-01-20T00:00:00Z",
    "updatedAt": "2026-01-20T00:00:00Z"
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": true,
    "cacheAge": 15
  }
}
```

---

### Get Assignment Submission

**GET** `/api/v1/assignments/:assignmentId/submission`

Get submission status for a specific assignment.

**Headers:**
```
Authorization: Bearer YOUR_CANVAS_TOKEN
```

**URL Parameters:**
- `assignmentId` (required) - Canvas assignment ID

**Query Parameters:**
- `course_id` (required) - Canvas course ID

**Cache TTL:** 2 minutes

**Example Request:**
```bash
GET /api/v1/assignments/5001/submission?course_id=40232
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "assignmentId": 5001,
    "userId": 5678,
    "submittedAt": "2026-02-14T20:30:00Z",
    "score": 95,
    "grade": "95",
    "attempt": 1,
    "workflowState": "graded",
    "submissionType": "online_upload",
    "late": false,
    "missing": false,
    "excused": false,
    "previewUrl": "https://dlsl.instructure.com/courses/40232/assignments/5001/submissions/5678"
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": false
  }
}
```

---

## Activity Feed Endpoint

### Get Activity Feed

**GET** `/api/v1/activity/feed`

Get aggregated activity feed containing announcements and assignments.

**Headers:**
```
Authorization: Bearer YOUR_CANVAS_TOKEN
```

**Query Parameters:**
- `start_date` (optional) - Start date in ISO format (default: 30 days ago)
- `end_date` (optional) - End date in ISO format (default: now)
- `types` (optional) - Comma-separated types: `announcement`, `assignment` (default: both)
- `limit` (optional) - Max items to return (default: 50, max: 200)

**Cache TTL:** 2 minutes

**Example Request:**
```bash
GET /api/v1/activity/feed?start_date=2026-01-01T00:00:00Z&end_date=2026-01-30T23:59:59Z&types=announcement,assignment&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "announcement",
      "id": 656848,
      "title": "sa mga hindi nakaattend ng meeting today(30/1/26)",
      "message": "<p>may grouping po kayo for graded activity...</p>",
      "date": "2026-01-30T04:57:31Z",
      "author": {
        "id": 339,
        "displayName": "Sofio Isaga",
        "avatarUrl": "https://dlsl.instructure.com/..."
      },
      "contextCode": "course_40238",
      "htmlUrl": "https://dlsl.instructure.com/courses/40238/discussion_topics/656848"
    },
    {
      "type": "assignment",
      "id": 5001,
      "title": "Programming Assignment 1",
      "courseId": 40232,
      "dueAt": "2026-02-15T23:59:00Z",
      "date": "2026-02-15T23:59:00Z",
      "pointsPossible": 100,
      "submissionTypes": ["online_upload"],
      "htmlUrl": "https://dlsl.instructure.com/courses/40232/assignments/5001"
    }
  ],
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": false,
    "count": 10,
    "dateRange": {
      "start": "2026-01-01T00:00:00Z",
      "end": "2026-01-30T23:59:59Z"
    }
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `AUTH_TOKEN_MISSING` | 401 | Authorization header is required |
| `AUTH_TOKEN_INVALID` | 401 | Invalid or expired Canvas API token |
| `AUTH_UNAUTHORIZED` | 401 | Authentication failed |
| `READ_ONLY_VIOLATION` | 403 | Attempted write operation in read-only mode |
| `RESOURCE_NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_PARAMETER` | 400 | Invalid parameter value |
| `MISSING_PARAMETER` | 400 | Required parameter missing |
| `CANVAS_API_ERROR` | 500 | Canvas API error occurred |
| `CANVAS_RATE_LIMIT` | 429 | Canvas API rate limit exceeded |
| `CANVAS_NOT_FOUND` | 404 | Resource not found in Canvas |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests from this IP |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Rate Limiting

- **Limit:** 100 requests per minute per IP address
- **Headers returned:**
  - `RateLimit-Limit`: Maximum requests allowed
  - `RateLimit-Remaining`: Remaining requests in current window
  - `RateLimit-Reset`: Time when limit resets (epoch timestamp)

When rate limited, you'll receive:
```json
{
  "success": false,
  "error": {
    "message": "Too many requests from this IP, please try again later.",
    "code": "RATE_LIMIT_EXCEEDED",
    "timestamp": "2026-01-30T12:00:00Z"
  }
}
```

---

## Cache Control

### Bypass Cache

Add header to any request to bypass cache:
```
X-No-Cache: true
```

### Cache TTLs

| Endpoint | TTL |
|----------|-----|
| User Profile | 10 minutes |
| Courses | 5 minutes |
| Course Details | 5 minutes |
| Assignments | 3 minutes |
| Assignment Details | 3 minutes |
| Submissions | 2 minutes |
| Activity Feed | 2 minutes |

---

## Example Usage

### cURL Examples

**Get User Profile:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5001/api/v1/user/profile
```

**Get Courses with Grades:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5001/api/v1/courses?include_grades=true"
```

**Get Upcoming Assignments:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5001/api/v1/courses/40232/assignments?bucket=upcoming&order_by=due_at"
```

**Get Activity Feed (Last 7 Days):**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5001/api/v1/activity/feed?limit=20"
```

**Bypass Cache:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-No-Cache: true" \
     http://localhost:5001/api/v1/courses
```

### JavaScript/Fetch Examples

**Get User Profile:**
```javascript
const response = await fetch('http://localhost:5001/api/v1/user/profile', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
const data = await response.json();
```

**Get Courses:**
```javascript
const response = await fetch('http://localhost:5001/api/v1/courses?include_grades=true', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
const data = await response.json();

if (data.success) {
  console.log('Courses:', data.data);
} else {
  console.error('Error:', data.error.message);
}
```

**Get Activity Feed:**
```javascript
const params = new URLSearchParams({
  types: 'announcement,assignment',
  limit: 20
});

const response = await fetch(`http://localhost:5001/api/v1/activity/feed?${params}`, {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
const data = await response.json();
```

---

## Security Notes

1. **Never expose your Canvas API token** in client-side code or public repositories
2. **Read-Only Mode**: This API blocks all POST/PUT/PATCH/DELETE requests
3. **CORS**: Only the configured frontend URL can access the API
4. **Rate Limiting**: Respect the rate limits to avoid being blocked
5. **Token Safety**: Tokens are never logged or stored by the server

---

## Testing Endpoints

Use the included test suite or tools like:
- **cURL** - Command line testing
- **Postman** - GUI testing
- **Thunder Client** (VS Code) - IDE integration
- **Insomnia** - API testing tool

For automated testing:
```bash
npm test                 # Run all tests
npm run test:integration # Integration tests only
```

---

## Support

For issues or questions:
- Check the main [README.md](./README.md)
- Review [QUICKSTART.md](./QUICKSTART.md)
- Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

**Last Updated:** January 30, 2026
**API Version:** 1.0.0
**Base URL:** `http://localhost:5001`
