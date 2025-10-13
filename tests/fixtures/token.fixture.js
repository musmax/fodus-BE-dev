const moment = require('moment');
const config = require('../../src/config/config');
const { tokenTypes } = require('../../src/config/tokens');
const tokenService = require('../../src/services/token.service');
const { createdUser } = require('./user.fixture');

const getAuthTokens = async () => {
  const userOne = await createdUser({ userType: 'user' });
  const adminUser = await createdUser({ userType: 'admin' });
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const userOneAccessToken = tokenService.generateToken(userOne.id, accessTokenExpires, tokenTypes.ACCESS);
  const adminOneAccessToken = tokenService.generateToken(adminUser.id, accessTokenExpires, tokenTypes.ACCESS);
  return { userOneAccessToken, adminOneAccessToken, users: { userOne: userOne.email, adminUser: adminUser.email } };
};

module.exports = {
  getAuthTokens,
};
