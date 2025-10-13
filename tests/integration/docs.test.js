const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const config = require('../../src/config/config');

describe('Documentation', () => {
  beforeEach(() => {
    config.env = 'production';
  });

  afterEach(() => {
    config.env = process.env.NODE_ENV;
  });

  describe('GET /v1/docs', () => {
    test('should return 404 when running in production', async () => {
      await request(app).get('/v1/docs').send().expect(httpStatus.NOT_FOUND);
    });
  });
});
