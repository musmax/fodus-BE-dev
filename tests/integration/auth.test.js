const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { userFixture, createdUser } = require('../fixtures/user.fixture');

setupTestDB();

describe('Auth Routes', () => {
  let user;

  beforeEach(async () => {
    user = await createdUser({ userType: 'user' });
  });

  describe('POST /v1/auth/register', () => {
    test('should return 201 and successfully register user if request data is ok', async () => {
      const res = await request(app).post('/v1/auth/register').send(userFixture);
      expect(res.status).toBe(httpStatus.CREATED);
    });

    test('should return 400 error if email is invalid', async () => {
      const data = { ...userFixture, email: 'invalidEmail' };
      const res = await request(app).post('/v1/auth/register').send(data);
      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      userFixture.email = user.email;
      await request(app).post('/v1/auth/register').send(userFixture);
      const res = await request(app).post('/v1/auth/register').send(userFixture);
      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if username is already used', async () => {
      userFixture.username = user.username;
      await request(app).post('/v1/auth/register').send(userFixture);
      const res = await request(app).post('/v1/auth/register').send(userFixture);
      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/login', () => {
    test('should return 200 and login user if email and password match', async () => {
      const loginCredentials = {
        email: user.email,
        password: 'password1',
      };
      const res = await request(app).post('/v1/auth/login').send(loginCredentials);
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.tokens).toBeDefined();
    });

    test('should return 401 error if there are no users with the provided email', async () => {
      const loginCredentials = {
        email: 'wrongEmail',
        password: userFixture.password,
      };
      const res = await request(app).post('/v1/auth/login').send(loginCredentials);
      expect(res.status).toBe(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if password is wrong', async () => {
      const loginCredentials = {
        email: user.email,
        password: 'wrongPassword',
      };
      const res = await request(app).post('/v1/auth/login').send(loginCredentials);
      expect(res.status).toBe(httpStatus.UNAUTHORIZED);
    });

    test('should return 200 and login user if username and password match', async () => {
      const loginCredentials = {
        username: user.username,
        password: 'password1',
      };
      const res = await request(app).post('/v1/auth/login').send(loginCredentials);
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.tokens).toBeDefined();
    });
  });
});
