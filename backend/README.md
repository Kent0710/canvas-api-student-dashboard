# Canvas Student Dashboard - Backend API

A production-ready Express.js backend that integrates with Canvas LMS API to provide a student dashboard with course information, grades, assignments, and activity feed. Features caching, rate limiting, and read-only security enforcement.

## Features

- **Canvas LMS Integration**: Seamless integration with Canvas API (dlsl.instructure.com)
- **Caching**: In-memory caching with configurable TTLs to reduce API calls
- **Rate Limiting**: IP-based rate limiting to prevent abuse
- **Security**: Read-only mode, helmet security headers, CORS configuration
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Logging**: Structured logging with Winston
- **Data Normalization**: Clean, consistent API responses
- **Pagination**: Automatic handling of Canvas API pagination

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **HTTP Client**: Axios with retry logic
- **Caching**: node-cache
- **Logging**: Winston
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit
- **Testing**: Jest, Supertest, Nock

## Prerequisites

- Node.js 16+ and npm
- Canvas LMS account with API access token
- Access to dlsl.instructure.com Canvas instance

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your Canvas API token:
```env
CANVAS_API_TOKEN=your_canvas_token_here
```

## Configuration

All configuration is managed through environment variables. See `.env.example` for available options:

### Server Configuration
- `NODE_ENV`: Environment (development/production/test)
- `PORT`: Server port (default: 5000)
- `LOG_LEVEL`: Logging level (error/warn/info/debug)

### Canvas API
- `CANVAS_API_BASE_URL`: Canvas API base URL (default: https://dlsl.instructure.com/api/v1)
- `CANVAS_API_TOKEN`: Your Canvas API personal access token
- `CANVAS_API_TIMEOUT`: Request timeout in ms (default: 30000)

### Cache
- `CACHE_ENABLED`: Enable/disable caching (default: true)
- `CACHE_TTL_COURSES`: Course cache TTL in seconds (default: 300)
- `CACHE_TTL_ASSIGNMENTS`: Assignment cache TTL in seconds (default: 180)
- `CACHE_TTL_ANNOUNCEMENTS`: Announcement cache TTL in seconds (default: 120)

### Security
- `READ_ONLY_MODE`: Enforce read-only mode (default: true)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)
- `RATE_LIMIT_MAX`: Max requests per window (default: 100)

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All API endpoints (except `/health` and `/cache/stats`) require authentication via Bearer token:
```
Authorization: Bearer <your_canvas_token>
```

### Endpoints

#### Health & Monitoring

**GET /health**
- Public endpoint
- Returns server health status
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

**GET /cache/stats**
- Public endpoint
- Returns cache statistics
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "hits": 42,
    "misses": 10,
    "hitRate": 80.77,
    "keys": 15
  }
}
```

#### User

**GET /api/v1/user/profile**
- Get current user profile
- Cached for 10 minutes
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "avatarUrl": "https://..."
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": true,
    "cacheAge": 45
  }
}
```

#### Courses

**GET /api/v1/courses**
- Get active courses with grades
- Query params:
  - `include_grades` (boolean, default: true)
- Cached for 5 minutes
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "name": "Introduction to Computer Science",
      "courseCode": "CS101",
      "currentGrade": {
        "current": 85.5,
        "letterGrade": "B"
      },
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-05-15T00:00:00Z"
    }
  ],
  "meta": {
    "count": 4,
    "cached": false
  }
}
```

**GET /api/v1/courses/:courseId**
- Get course details by ID
- Cached for 5 minutes

**GET /api/v1/courses/:courseId/grade**
- Get grade breakdown for a course
- Cached for 5 minutes

**GET /api/v1/courses/:courseId/assignments**
- Get assignments for a course
- Query params:
  - `bucket` (string): Filter by bucket (upcoming, past, overdue)
  - `order_by` (string): Order by field (due_at, name)
- Cached for 3 minutes

#### Assignments

**GET /api/v1/assignments/:assignmentId**
- Get assignment details by ID
- **Required query param**: `course_id`
- Cached for 3 minutes
```bash
GET /api/v1/assignments/5001?course_id=1001
```

**GET /api/v1/assignments/:assignmentId/submission**
- Get assignment submission status
- **Required query param**: `course_id`
- Cached for 2 minutes
```bash
GET /api/v1/assignments/5001/submission?course_id=1001
```

#### Activity Feed

**GET /api/v1/activity/feed**
- Get combined activity feed (announcements + assignments)
- Query params:
  - `start_date` (ISO date, default: 30 days ago)
  - `end_date` (ISO date, default: now)
  - `types` (comma-separated: announcement,assignment, default: both)
  - `limit` (number, default: 50, max: 200)
- Cached for 2 minutes
```json
{
  "success": true,
  "data": [
    {
      "type": "announcement",
      "id": 3001,
      "title": "Welcome to CS101",
      "message": "<p>Welcome...</p>",
      "date": "2024-01-15T10:00:00Z",
      "author": { "displayName": "Professor Smith" }
    },
    {
      "type": "assignment",
      "id": 5001,
      "title": "Programming Assignment 1",
      "courseId": 1001,
      "dueAt": "2024-02-15T23:59:00Z",
      "pointsPossible": 100
    }
  ],
  "meta": {
    "count": 25,
    "dateRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-30T23:59:59Z"
    }
  }
}
```

### Cache Control

To bypass cache for any request, add the header:
```
X-No-Cache: true
```

### Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": false
  }
}
```

All error responses follow this format:
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

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run only unit tests:
```bash
npm run test:unit
```

Run only integration tests:
```bash
npm run test:integration
```

### Test Coverage Goals
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Error Handling

The API handles various error scenarios:

- **401 Unauthorized**: Missing or invalid Canvas token
- **403 Forbidden**: Attempted write operation in read-only mode
- **404 Not Found**: Resource not found in Canvas
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Canvas API error or server error

## Security

- **Read-Only Mode**: All non-GET requests are blocked
- **Token Security**: Canvas tokens are never logged or stored
- **CORS**: Restricted to configured frontend URL
- **Rate Limiting**: 100 requests per minute per IP
- **Security Headers**: Helmet.js for secure HTTP headers
- **Input Validation**: Joi schemas for request validation

## Development

### Code Structure
```
backend/
├── src/
│   ├── config/              # Configuration management
│   ├── middleware/          # Auth, error handling, rate limiting
│   ├── services/
│   │   ├── canvas/          # Canvas API client and services
│   │   └── cache/           # Caching layer
│   ├── controllers/         # Request/response handlers
│   ├── routes/              # API route definitions
│   ├── utils/               # Normalizers, validators, error classes
│   └── constants/           # Cache TTLs, error codes
├── tests/                   # Unit and integration tests
└── server.js                # Entry point
```

### Linting
```bash
npm run lint          # Check code style
npm run lint:fix      # Auto-fix linting issues
```

## Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure production environment variables
3. Ensure Canvas API token has appropriate permissions
4. Set up process manager (PM2, systemd, etc.)
5. Configure reverse proxy (nginx, etc.) if needed

## Troubleshooting

### Canvas API Errors
- Verify your Canvas token is valid and has not expired
- Check Canvas API base URL is correct
- Ensure you have permission to access the resources

### Cache Issues
- Set `CACHE_ENABLED=false` to disable caching temporarily
- Check cache statistics at `/cache/stats`
- Clear cache by restarting the server

### Rate Limiting
- Default: 100 requests/minute per IP
- Adjust `RATE_LIMIT_MAX` in `.env` if needed
- Use `X-No-Cache` header sparingly to avoid rate limits

## License

This project is part of the Canvas Student Dashboard application.

## Support

For issues or questions, please check the main project README or contact the development team.
