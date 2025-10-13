const faker = require('faker');
const { userService } = require('../../src/services');
const { db } = require('../../src/models');

const password = 'password1';

const userFixture = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.internet.userName().toLowerCase(),
  email: faker.internet.email().toLowerCase(),
  password,
  userType: 'user',
  isEmailVerified: true,
  role: 'user',
};

const userFixture2 = async (user = {}) => {
  // get role ID
  const adminRole = await db.roles.findOne({
    where: {
      name: 'admin',
    },
  });

  const userRole = await db.roles.findOne({
    where: {
      name: 'user',
    },
  });

  const userData = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    username: faker.internet.userName().toLowerCase(),
    email: faker.internet.email().toLowerCase(),
    password,
    isEmailVerified: true,
    role: [user.userType === 'admin' ? adminRole.id : userRole.id],
    ...user,
  };
  return userData;
};

const createdUser = async (user = {}) => {
  // get role ID
  const adminRole = await db.roles.findOne({
    where: {
      name: 'admin',
    },
  });

  const userRole = await db.roles.findOne({
    where: {
      name: 'user',
    },
  });

  const userData = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    username: faker.internet.userName().toLowerCase(),
    email: faker.internet.email().toLowerCase(),
    password,
    isEmailVerified: true,
    role: [user.userType === 'admin' ? adminRole.id : userRole.id],
    ...user,
  };
  return userService.createUser(userData);
};

module.exports = { userFixture, userFixture2, createdUser };
