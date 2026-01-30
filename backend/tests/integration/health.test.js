const request = require('supertest');
const app = require('../../src/app');

describe('Health Check Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: 'healthy',
          environment: 'test',
        },
      });
      expect(response.body.data.timestamp).toBeDefined();
      expect(response.body.data.uptime).toBeDefined();
    });
  });

  describe('GET /cache/stats', () => {
    it('should return cache statistics', async () => {
      const response = await request(app).get('/cache/stats');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          enabled: expect.any(Boolean),
          hits: expect.any(Number),
          misses: expect.any(Number),
        },
      });
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: 'Route not found',
          path: '/api/unknown-route',
          method: 'GET',
        },
      });
    });
  });
});
