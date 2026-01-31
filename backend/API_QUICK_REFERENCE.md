# API Quick Reference

Base URL: `http://localhost:5001`

## Quick Links
- Full Documentation: [API_ENDPOINTS.md](./API_ENDPOINTS.md)
- Quick Start: [QUICKSTART.md](./QUICKSTART.md)

## Authentication
```
Authorization: Bearer YOUR_CANVAS_TOKEN
```

## Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/cache/stats` | Cache statistics |

## User Endpoints

| Method | Endpoint | Description | Cache |
|--------|----------|-------------|-------|
| GET | `/api/v1/user/profile` | Current user profile | 10min |

## Course Endpoints

| Method | Endpoint | Description | Cache |
|--------|----------|-------------|-------|
| GET | `/api/v1/courses` | Active courses with grades | 5min |
| GET | `/api/v1/courses/:id` | Course details | 5min |
| GET | `/api/v1/courses/:id/grade` | Grade breakdown | 5min |
| GET | `/api/v1/courses/:id/assignments` | Course assignments | 3min |

## Assignment Endpoints

| Method | Endpoint | Description | Cache |
|--------|----------|-------------|-------|
| GET | `/api/v1/assignments/:id` | Assignment details (needs `?course_id=X`) | 3min |
| GET | `/api/v1/assignments/:id/submission` | Submission status (needs `?course_id=X`) | 2min |

## Activity Feed

| Method | Endpoint | Description | Cache |
|--------|----------|-------------|-------|
| GET | `/api/v1/activity/feed` | Announcements + assignments | 2min |

## Common Query Parameters

### Courses
- `include_grades=true` - Include grade info (default: true)

### Assignments
- `bucket=upcoming` - Filter: upcoming, past, overdue, undated
- `order_by=due_at` - Sort: due_at, name, position

### Activity Feed
- `start_date=2026-01-01T00:00:00Z` - Start date (default: 30 days ago)
- `end_date=2026-01-30T23:59:59Z` - End date (default: now)
- `types=announcement,assignment` - Types (default: both)
- `limit=50` - Max items (default: 50, max: 200)

## Cache Control
```
X-No-Cache: true
```

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "...", "cached": false }
}
```

### Error
```json
{
  "success": false,
  "error": { "message": "...", "code": "..." }
}
```

## Quick cURL Examples

```bash
# Health check
curl http://localhost:5001/health

# User profile
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:5001/api/v1/user/profile

# Courses
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:5001/api/v1/courses

# Assignments
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:5001/api/v1/courses/40232/assignments?bucket=upcoming"

# Activity feed
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:5001/api/v1/activity/feed?limit=10"
```

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Success |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Read-only violation |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Error | Server error |

## Rate Limits
- **100 requests/minute** per IP address

## Your Canvas Token
```
10078~2A2wWPAGP3Nx6UfHv9AkAPUPrACX3TXGr3GXewx3PKAwt9KZynyAatnJrxwNB8CZ
```
⚠️ **Never commit this to version control!**
