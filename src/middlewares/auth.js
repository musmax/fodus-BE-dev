const passport = require('passport');
const httpStatus = require('http-status');
const _ = require('lodash');
const ApiError = require('../utils/ApiError');

const getRolesAndPermissions = async (user) => {
  const roles = user.roles.map((role) => role.dataValues.name);
  const permissionsValue = [];

  // get permissions for each role
  await Promise.all(
    user.roles.map(async (role) => {
      await role.getPermissions().then((permissions) => {
        permissions.map((permission) => permissionsValue.push(permission.dataValues.value));
      });
    })
  );

  return { roles, permissionsValue };
};

const verifyCallback = (req, resolve, reject, requiredRights, isOptional = false) => async (err, user, info) => {
  if (err || info || !user) {
    if (isOptional) {
      // For optional auth, just continue without user
      req.user = null;
      return resolve();
    }
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  if (user.isDeleted) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Your account has been disabled'));
  }

  const { roles, permissionsValue } = await getRolesAndPermissions(user);

  // eslint-disable-next-line no-param-reassign
  user.dataValues.roles = roles;
  req.user = user;

  // return user email if email is not verified in resolve
  if (!user.isEmailVerified) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, `Please check the verification email sent to ${user.email}`));
  }

  if (requiredRights.length) {
    // flatten the array and return unique permissions
    const userRights = _.uniq(_.flatten(permissionsValue));
    // check if the user has required rights
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    const isOptional = requiredRights.includes('optional');
    const filteredRights = requiredRights.filter(right => right !== 'optional');
    
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, filteredRights, isOptional))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
