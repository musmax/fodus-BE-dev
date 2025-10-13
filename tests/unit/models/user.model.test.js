const faker = require('faker');
const {
  db: { user: User },
} = require('../../../src/models');
const setupTestDB = require('../../utils/setupTestDB');

setupTestDB();

describe('User model', () => {
  describe('User validation', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName().toLowerCase(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
      };
    });

    test('should correctly validate a valid user', async () => {
      const user = User.build(newUser);
      await expect(user.validate()).resolves.toBe(user);
    });
  });
});
