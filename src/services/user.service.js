const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');
const { User } = require('../models/user.model');
const { Role } = require('../models/role.model');
const { Permission } = require('../models/permission.model');
const logger = require('../config/logger');
const { sendEmail } = require('./email.service');
const { getMessageTemplateByTitle, convertTemplateToMessage } = require('./message_template.service');
const config = require('../config/config');
const { deleteUploadedFile } = require('./upload.service');
const { Wallet } = require('../models/wallet.model');

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
const isEmailTaken = async function (email) {
  const user = await User.findOne({ where: { email } });
  return !!user;
};

/**
 * Check if username is taken
 * @param {string} username
 * @returns {Promise<boolean>}
 */
const isUsernameTaken = async function (username, userId = null) {
  const user = await User.findOne({
    where: {
      username,
      // if userId is passed in, then check for username except the user with userId
      ...(userId && { id: { [Op.ne]: userId } }),
    },
  });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
const isPasswordMatch = async function (password, user) {
  const comp = bcrypt.compareSync(password, user.password);
  logger.info(comp);
  return comp;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findByPk(id, {
    attributes: { exclude: ['password'] },
    include: [
      {
        model: Role,
        as: 'roles',
        attributes: ['name'],
        through: { attributes: [] },
        include: [
          {
            model: Permission,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            through: { attributes: [] },
          },
        ],
      },
      {
        association: 'user_wallet',
      }
    ],
  });
};

const sendUserWelcomeEmail = async (user) => {
  // get user email and first name
  const { email, firstName } = user.dataValues;
  // get message template
  const {
    dataValues: { emailSubject, emailBody },
  } = await getMessageTemplateByTitle('Welcome_Email');

  const text = await convertTemplateToMessage(emailBody, {
    firstName,
  });

  await sendEmail(email, emailSubject, text);
};

/**
 * Create a user
 * @param {Object} userBody
 * @param {string} userBody.email
 * @param {string} userBody.password
 * @param {string} userBody.firstName
 * @param {string} userBody.lastName
 * @param {string} userBody.username
 * @param {string} userBody.userType
 * @param {number[]} userBody.role
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  const { userType, role, ...userProfile } = userBody;

  // Map firstName/lastName to firstname/lastname to match model
  if (userProfile.firstName) {
    userProfile.firstname = userProfile.firstName;
    delete userProfile.firstName;
  }
  if (userProfile.lastName) {
    userProfile.lastname = userProfile.lastName;
    delete userProfile.lastName;
  }

  // Check if email is taken
  if (await isEmailTaken(userProfile.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  // Check if username is taken
  if (await isUsernameTaken(userProfile.username)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }
  // Get the user role
  const foundRole = await Role.findAll({
    where: {
      id: role,
    },
  });
  userProfile.password = bcrypt.hashSync(userProfile.password, 8);
  // Create the user within the Transaction
  const user = await User.create(userProfile);
  // Set the user role within the transaction
  await user.setRoles(foundRole);
  // lets initiate the wallet
  await Wallet.create({
    userId: user.id,
    balance: 0.00,
    isSuspended: false
  })
  // Return user object with role
  return getUserById(user.id);
};



/**
 * Query for users
 * @param {Object} filter - filter
 * @param {Object} options - Query options
 * @param {number} [filter.firstName] - filter firstname
 * @param {number} [current.limit] - Maximum number of results per page (default = 25)
 * @param {number} [current.page] - The row to start from (default = 0)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, current) => {
  // get user and include their roles
  const options = {
    attributes: { exclude: ['password'] },
    page: current.page, // Default 1
    paginate: current.limit, // Default 25
    where: {
      firstName: {
        [Op.like]: `%${filter.firstName || ''}%`,
        [Op.like]: `%${filter.lastName || ''}%`,
        [Op.like]: `%${filter.username || ''}%`,
      },
      isDeleted: false, // only get users that are not deleted
    },
    include: [
      {
        model: Role,
        as: 'roles',
        attributes: ['name'],
        through: { attributes: [] },
        include: [
          {
            model: Permission,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            through: { attributes: [] },
          },
        ],
      },
      {
        association: 'user_wallet',
      }
    ],
  };
  const { docs, pages, total } = await User.paginate(options);
  return { users: docs, limit: options.paginate, totalPages: pages, totalResults: total };
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        as: 'roles',
        attributes: ['name'],
        through: { attributes: [] },
        include: [
          {
            model: Permission,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            through: { attributes: [] },
          },
        ],
      },
      {
        association: 'user_wallet',
      }
    ],
  });
};

/**
 * Get user by email or username
 * @param {Object} emailOrUsername
 * @param {string} emailOrUsername.email - optional
 * @param {string} emailOrUsername.username - optional
 * @returns {Promise<User>}
 */
const getUserByEmailOrUsername = async (emailOrUsername) => {
  return User.findOne({
    where: {
      ...emailOrUsername,
    },
    include: [
      {
        model: Role,
        as: 'roles',
        attributes: ['name'],
        through: { attributes: [] },
        include: [
          {
            model: Permission,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            through: { attributes: [] },
          },
        ],
      },
    ],
  });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @param {Object} currentUser
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const { role, countryId, languageIds, ...userProfile } = updateBody;
  const user = await getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (userProfile.email && userProfile.email !== user.email && (await isEmailTaken(userProfile.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // check if username is taken
  if (
    userProfile.username &&
    userProfile.username !== user.username &&
    (await isUsernameTaken(userProfile.username, userId))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }

  // if password is updated, hash it
  if (userProfile.password) {
    // eslint-disable-next-line no-param-reassign
    userProfile.password = bcrypt.hashSync(userProfile.password, 8);
  }

  // if profile image is updated, delete the old one
  if (userProfile.profileImage !== user.profileImage) {
    await deleteUploadedFile(user.profileImage);
  }

  // if role is updated, get the role
  if (role) {
    // get the new role
    const userRole = await Role.findAll({ where: { id: role.map((r) => r) } });

    // confirm the role passed is valid
    if (userRole.length !== role.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid role');
    }

    // remove existing role
    await user.removeRoles();
    // set the new role
    await user.setRoles(userRole);
  }

  Object.assign(user, { ...userProfile, countryId });
  await user.save();
  return getUserById(userId);
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  await user.update({ isDeleted: 'true' });
  return user;
};

/**
 * Update user password
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @param {String} updateBody.oldPassword
 * @param {String} updateBody.newPassword
 * @returns {Promise<User>}
 */
const updateUserPassword = async (userId, updateBody) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!(await isPasswordMatch(updateBody.oldPassword, user.dataValues))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect password');
  }

  // eslint-disable-next-line no-param-reassign
  updateBody.password = bcrypt.hashSync(updateBody.newPassword, 8);

  Object.assign(user, updateBody);
  await user.save();

  return {
    success: true,
    message: 'Password updated successfully',
  };
};

/**
 * Encrypt user data
 * @param {Object} userData
 * @returns {Promise<string>}
 */
const encryptData = async (userData) => {
  const encryptedData = await jwt.sign(userData, config.jwt.secret);
  // append secret and delimiter
  return encryptedData + config.userSecret;
};

/**
 * Assign a new Role to an existing user by updating the existing one
 * @param {number} userId
 * @param {number} roleId
 * @returns {Promise<Object>}
 */
const removeANewRoleForAnExistingUser = async (userBody) => {
  const { userId, roleId } = userBody;
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const role = await Role.findByPk(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  // Add the new role to the user
  await user.removeRoles(role);
};

/**
 * Assign a new role to an existing user
 */
const addRoleToUser = async (userId, roleId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const role = await Role.findByPk(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  // Check if the user already has the specified role
  const existingRoles = await user.getRoles({ where: { id: roleId } });
  if (existingRoles.length === 0) {
    // User doesn't have the role, add it
    await user.addRole(role);
  } else {
    // User already has the role, you can handle it as needed
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already has the specified role');
  }

  // Now the user has the new role
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  isPasswordMatch,
  getUserByEmailOrUsername,
  isEmailTaken,
  isUsernameTaken,
  encryptData,
  updateUserPassword,
  sendUserWelcomeEmail,
  addRoleToUser,
  removeANewRoleForAnExistingUser,
};
