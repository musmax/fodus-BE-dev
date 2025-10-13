const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { getAuthTokens } = require('../fixtures/token.fixture');
const { userFixture2, createdUser } = require('../fixtures/user.fixture');

setupTestDB();

describe('User Routes', () => {
  let userAccessToken; // user to store the user access token
  let adminAccessToken; // user to store the admin access token
  let userData; // user to store the user data (unregistered)
  let user; // user to store the user data (registered)
  let createdUsersWithToken; // user to store users created in the token fixtures with token
  beforeEach(async () => {
    const { userOneAccessToken, adminOneAccessToken, users } = await getAuthTokens();
    userAccessToken = userOneAccessToken;
    adminAccessToken = adminOneAccessToken;
    createdUsersWithToken = users;
    const generatedUserInfo = await userFixture2({ userType: 'user' });
    userData = generatedUserInfo;
    user = await createdUser({ userType: 'user' });
  });

  describe('GET /v1/users/me', () => {
    test('should return 200 and the user object if accessToken is ok', async () => {
      await request(app).get('/v1/users/me').set('Authorization', `Bearer ${userAccessToken}`).send().expect(httpStatus.OK);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get('/v1/users/me').send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/users', () => {
    test('should return 403 error if logged in user is not an admin', async () => {
      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(userData)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 201 for admin user', async () => {
      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(userData)
        .expect(httpStatus.CREATED);
    });
  });

  describe('PATCH /v1/users/password', () => {
    test('should return 200 if user is updating his own password', async () => {
      const updateBody = {
        oldPassword: 'password1',
        newPassword: 'password2',
      };

      await request(app)
        .patch('/v1/users/password')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const loginCredentials = {
        email: createdUsersWithToken.userOne,
        password: updateBody.newPassword,
      };
      await request(app).post('/v1/auth/login').send(loginCredentials);
    });

    test('should return 400 if user provides wrong old password', async () => {
      const updateBody = {
        oldPassword: 'wrongPassword',
        newPassword: 'newPassword1',
      };

      await request(app)
        .patch('/v1/users/password')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/users/validate/email', () => {
    test('should return 200 if does not exist', async () => {
      await request(app).get(`/v1/users/validate/email?email=${userData.email}`).send().expect(httpStatus.OK);
    });

    test('should return 400 if email is invalid', async () => {
      await request(app).get(`/v1/users/validate/email?email=${user.email}`).send().expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /v1/users/validate/username', () => {
    test('should return 200 if does not exist', async () => {
      await request(app).get(`/v1/users/validate/username?username=${userData.username}`).send().expect(httpStatus.OK);
    });

    test('should return 400 if username is invalid', async () => {
      await request(app).get(`/v1/users/validate/username?username=${user.username}`).send().expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/users/:userId', () => {
    test('should return 204 if data is ok', async () => {
      await request(app)
        .delete(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).delete(`/v1/users/${user.id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is not an admin', async () => {
      await request(app)
        .delete(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if user is not found', async () => {
      await request(app)
        .delete('/v1/users/100')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /v1/users/:userId', () => {
    test('should return 200 and the user object if data is ok', async () => {
      await request(app)
        .get(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).get(`/v1/users/${user.id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if user is not found', async () => {
      await request(app)
        .get('/v1/users/100')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
