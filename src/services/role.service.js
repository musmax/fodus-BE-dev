const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Role } = require('../models/role.model');
const { Permission } = require('../models/permission.model');

/**
 * Get all roles
 * @returns {Promise<Roles[]>}
 */
const getAllRoles = async () => {
  return Role.findAll({
    include: [
      {
        model: Permission,
        attributes: ['id', 'name'],
        through: { attributes: [] },
      },
    ],
  });
};

/**
 * Get roles by name
 * @param {String} name
 * @returns {Promise<Roles>}
 */
const getRolesByName = async (name) => {
  return Role.findOne({
    where: {
      name,
    },
    include: [
      {
        model: Permission,
        attributes: ['id', 'name'],
        through: { attributes: [] },
      },
    ],
  });
};

/**
 * Get roles by id
 * @param {ObjectId} id
 * @returns {Promise<Roles>}
 */
const getRolesById = async (id) => {
  return Role.findByPk(id, {
    include: [
      {
        model: Permission,
        attributes: ['id', 'name'],
        through: { attributes: [] },
      },
    ],
  });
};

/**
 * Is dubplicate roles
 * @param {String} name
 * @returns {Promise<Boolean>}
 */
const isDuplicateRoles = async (name) => {
  const roles = await Role.findOne({
    where: {
      name,
    },
  });
  return !!roles;
};

/**
 * create a roles
 * @param {Object} rolesBody
 * @returns {Promise<Roles>}
 */
const createRole = async (rolesBody) => {
  const { permissions, ...roleDetails } = rolesBody;
  // check if role name already exists
  if (await isDuplicateRoles(roleDetails.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Roles name already taken');
  }

  // check if permissions exist
  const permissionsExist = await Permission.findAll({
    where: {
      id: permissions,
    },
  });

  if (permissionsExist.length !== permissions.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Permission not found');
  }

  // create the roles
  const createdRoles = await Role.create(roleDetails);

  // add permissions to roles
  await createdRoles.addPermissions(permissionsExist);

  return getRolesById(createdRoles.dataValues.id);
};

/**
 * Update roles by id
 * @param {ObjectId} rolesId
 * @param {Object} updateBody
 * @returns {Promise<Roles>}
 */
const updateRolesById = async (rolesId, updateBody) => {
  const { permissions, ...roleDetails } = updateBody;
  // check if roles exist
  const rolesExist = await getRolesById(rolesId);
  if (!rolesExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  // check if roles name is taken
  if (updateBody.name && (await isDuplicateRoles(updateBody.name))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Role name already taken');
  }

  // check if permissions exist
  if (permissions) {
    const permissionsExist = await Permission.findAll({
      where: {
        id: permissions,
      },
    });

    if (permissionsExist.length !== permissions.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Permission not found');
    }

    // remove existing permissions
    await rolesExist.removePermissions(rolesExist.permissions);

    // add permissions to roles
    await rolesExist.addPermissions(permissionsExist);
  }

  // update roles
  Object.assign(rolesExist, roleDetails);
  await rolesExist.save();

  return getRolesById(rolesExist.dataValues.id);
};

/**
 * Delete roles by id
 * @param {ObjectId} rolesId
 * @returns {Promise<Roles>}
 */
const deleteRolesById = async (rolesId) => {
  const rolesExist = await getRolesById(rolesId);
  if (!rolesExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Roles not found');
  }
  await rolesExist.destroy();
  return rolesExist;
};

module.exports = {
  getAllRoles,
  getRolesById,
  createRole,
  updateRolesById,
  deleteRolesById,
  getRolesByName,
};
