const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const { User } = require('../models/user.model');
const { Token } = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { sendVerificationEmail } = require('./email.service');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (emailOrUsername, password) => {
  // check if username or email exists
  const user = await userService.getUserByEmailOrUsername(emailOrUsername);
  if (!user || !(await userService.isPasswordMatch(password, user.dataValues))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email/username or password');
  }
  delete user.dataValues.password;

  // update last login
  await User.update({ lastLogin: new Date() }, { where: { id: user.dataValues.id } });
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    where: { token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false },
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.destroy();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.dataValues.userId);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.destroy();
    return tokenService.generateAuthTokens(user.dataValues.id);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.userId);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.destroy({ where: { userId: user.id, type: tokenTypes.RESET_PASSWORD } });
    return {
      status: 200,
      message: 'Password reset successful',
    };
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  console.log(verifyEmailToken);
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.dataValues.userId);
    if (!user) {
      throw new Error();
    }
    await Token.destroy({ where: { userId: user.id, type: tokenTypes.VERIFY_EMAIL } });
    await userService.updateUserById(user.id, { isEmailVerified: true });
    await userService.sendUserWelcomeEmail(user);
    return {
      message: 'Email verification successful',
    };
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Extract permissions
 * @param {Object} user
 */
const extractPermissions = (user) => {
  const permissions = [];
  const roles = user.roles.map((role) => role.dataValues.name); 
  user.roles.map((role) =>
    role.dataValues.permissions.map((permission) => {
      // push only if not exists
      if (!permissions.find((p) => p.name === permission.name)) {
        permissions.push({
          name: permission.name,
          value: permission.value,
        });
      }
      return null;
    })
  );
  const userType = user.dataValues.userType.name;

  return { roles, permissions, userType };
};

/**
 * Handle send email verification token
 * @param {Object} user
 * @returns {Promise<void>}
 */
const handleSendEmailVerificationToken = async (user) => {
  // generate token
  const token = await tokenService.generateVerifyEmailToken(user);

  // send email verification token
  await sendVerificationEmail(user.email, token);

  return {
    success: true,
    message: 'Email verification token sent',
  };
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  extractPermissions,
  handleSendEmailVerificationToken,
};
