/**
 * Test environment setup
 */

// Set environment to test
process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.LOG_LEVEL = 'error'; // Reduce noise in test output

// Mock environment variables
process.env.CANVAS_API_BASE_URL = 'https://dlsl.instructure.com/api/v1';
process.env.CANVAS_API_TOKEN = 'test_token_12345';
process.env.CACHE_ENABLED = 'false'; // Disable cache for predictable tests
process.env.READ_ONLY_MODE = 'true';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Global test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(() => {
  // Close any open connections, clear timers, etc.
});
