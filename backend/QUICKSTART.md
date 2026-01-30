# Quick Start Guide

Get the Canvas Student Dashboard backend running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- Canvas LMS account with API access
- Your Canvas API token (get it from Canvas > Account > Settings > New Access Token)

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment

Update the `.env` file with your Canvas API token:

```bash
# Open .env file and replace the token
CANVAS_API_TOKEN=your_actual_canvas_token_here
```

**Important**: Never commit your `.env` file with real tokens!

## Step 3: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
Server is running on port 5000
Environment: development
Canvas API: https://dlsl.instructure.com/api/v1
Cache enabled: true
Read-only mode: true
```

## Step 4: Test the API

### Health Check (no auth required)
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-30T12:00:00Z",
    "uptime": 12.34,
    "environment": "development"
  }
}
```

### Get Your Profile (requires auth)
```bash
curl -H "Authorization: Bearer YOUR_CANVAS_TOKEN" \
     http://localhost:5000/api/v1/user/profile
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "name": "Your Name",
    "email": "your.email@example.com",
    "avatarUrl": "https://..."
  },
  "meta": {
    "timestamp": "2026-01-30T12:00:00Z",
    "cached": false
  }
}
```

### Get Your Courses
```bash
curl -H "Authorization: Bearer YOUR_CANVAS_TOKEN" \
     http://localhost:5000/api/v1/courses
```

### Get Activity Feed
```bash
curl -H "Authorization: Bearer YOUR_CANVAS_TOKEN" \
     http://localhost:5000/api/v1/activity/feed
```

## Step 5: Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Common Issues

### Port Already in Use
If port 5000 is taken, update `PORT` in `.env`:
```env
PORT=5001
```

### Invalid Canvas Token
If you get "Invalid or expired Canvas API token":
1. Go to Canvas > Account > Settings
2. Delete the old token
3. Generate a new access token
4. Update `.env` with the new token
5. Restart the server

### Canvas API Errors
If you get Canvas API errors:
1. Verify you're using the correct Canvas instance (dlsl.instructure.com)
2. Check your Canvas account has access to the resources
3. Ensure your token hasn't expired

## API Endpoints Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/cache/stats` | GET | No | Cache statistics |
| `/api/v1/user/profile` | GET | Yes | Current user |
| `/api/v1/courses` | GET | Yes | Active courses |
| `/api/v1/courses/:id` | GET | Yes | Course details |
| `/api/v1/courses/:id/grade` | GET | Yes | Course grade |
| `/api/v1/courses/:id/assignments` | GET | Yes | Assignments |
| `/api/v1/assignments/:id` | GET | Yes | Assignment details (needs ?course_id=X) |
| `/api/v1/assignments/:id/submission` | GET | Yes | Submission status (needs ?course_id=X) |
| `/api/v1/activity/feed` | GET | Yes | Activity feed |

## Frontend Integration

If you're building a frontend:

1. **Base URL**: `http://localhost:5000/api/v1`
2. **Authentication**: Add header: `Authorization: Bearer <token>`
3. **CORS**: Already configured for `http://localhost:3000`
4. **Response Format**: All responses have `success` boolean
5. **Error Handling**: Check `success` field and handle errors

Example frontend code:
```javascript
const API_BASE_URL = 'http://localhost:5000/api/v1';
const CANVAS_TOKEN = 'your_token';

async function getUserProfile() {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    headers: {
      'Authorization': `Bearer ${CANVAS_TOKEN}`
    }
  });

  const data = await response.json();

  if (data.success) {
    console.log('User:', data.data);
  } else {
    console.error('Error:', data.error.message);
  }
}
```

## Development Tips

1. **Enable Debug Logging**: Set `LOG_LEVEL=debug` in `.env`
2. **Disable Cache**: Set `CACHE_ENABLED=false` for testing
3. **Allow Mutations**: Set `READ_ONLY_MODE=false` (use carefully!)
4. **Bypass Cache**: Add header `X-No-Cache: true` to requests
5. **Check Logs**: All requests are logged with timing info

## Next Steps

- Read the full [README.md](./README.md) for detailed API documentation
- Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture details
- Explore the code in `src/` directory
- Add more endpoints as needed
- Integrate with your frontend application

## Support

For issues:
1. Check the logs in the console
2. Verify your Canvas token is valid
3. Test with `curl` before trying in your app
4. Check Canvas API status at dlsl.instructure.com

Happy coding! 🚀
