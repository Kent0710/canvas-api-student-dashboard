const request = require('supertest');
const app = require('../../src/app');

describe('Read-Only Middleware', () => {
  const authHeader = 'Bearer test_token_12345';

  describe('Blocked methods', () => {
    it('should block POST requests', async () => {
      const response = await request(app)
        .post('/api/v1/user/profile')
        .set('Authorization', authHeader);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: expect.stringContaining('read-only'),
        },
      });
    });

    it('should block PUT requests', async () => {
      const response = await request(app)
        .put('/api/v1/courses/123')
        .set('Authorization', authHeader);

      expect(response.status).toBe(403);
    });

    it('should block PATCH requests', async () => {
      const response = await request(app)
        .patch('/api/v1/courses/123')
        .set('Authorization', authHeader);

      expect(response.status).toBe(403);
    });

    it('should block DELETE requests', async () => {
      const response = await request(app)
        .delete('/api/v1/courses/123')
        .set('Authorization', authHeader);

      expect(response.status).toBe(403);
    });
  });

  describe('Allowed methods', () => {
    it('should allow GET requests', async () => {
      // This will fail auth because the token is fake, but won't be blocked by read-only
      const response = await request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', authHeader);

      // Should NOT be 403 (read-only violation)
      // Will be another error (Canvas API error) but that's expected
      expect(response.status).not.toBe(403);
    });
  });
});
