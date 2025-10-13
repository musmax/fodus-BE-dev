const Joi = require('joi');
const { password } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string(),
    username: Joi.string().required(),
    isEmailVerified: Joi.boolean().default(true),
    role: Joi.array().items(Joi.number()).required(),
    userType: Joi.string().valid('admin', 'user').default('user'),
  }),
};
const AssignMorePermissionsToAnExistingUser = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    permissions: Joi.array().items(Joi.number()),
  }),
};
const assignNewRoleToAnExistingUser = {
  body: Joi.object().keys({
    roleId: Joi.number().required(),
    userId: Joi.number().required(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    firstName: Joi.string(),
    role: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      username: Joi.string(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      phoneNumber: Joi.string(),
      profileImage: Joi.string(),
      countryId: Joi.number(),
      title: Joi.string(),
      about: Joi.string(),
      role: Joi.array().items(Joi.number()),
      languageIds: Joi.array().items(Joi.number()),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
};

const validateEmail = {
  query: Joi.object().keys({
    email: Joi.string(),
  }),
};

const validateUsername = {
  query: Joi.object().keys({
    username: Joi.string(),
  }),
};

const updatePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required().custom(password),
    newPassword: Joi.string().required().custom(password),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  validateEmail,
  validateUsername,
  updatePassword,
  assignNewRoleToAnExistingUser,
  AssignMorePermissionsToAnExistingUser,
};
