const request = require('supertest');
const app = require('../../src/app');

describe('Authentication Middleware', () => {
  describe('Missing Authorization header', () => {
    it('should return 401 when no Authorization header is provided', async () => {
      const response = await request(app).get('/api/v1/user/profile');

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: 'Authorization header is required',
        },
      });
    });
  });

  describe('Invalid Authorization format', () => {
    it('should return 401 when Authorization header is not Bearer token', async () => {
      const response = await request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', 'InvalidToken12345');

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: expect.stringContaining('Invalid authorization format'),
        },
      });
    });

    it('should return 401 when Bearer token is empty', async () => {
      const response = await request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      // Accept either error message as both are valid for this edge case
      expect(
        response.body.error.message.includes('Invalid') ||
        response.body.error.message.includes('missing')
      ).toBe(true);
    });
  });
});
