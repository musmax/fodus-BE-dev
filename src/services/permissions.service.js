const { Permission } = require('../models/permission.model');

/**
 * Get all permissions
 * @returns {Promise<Permissions[]>}
 */
const getAllPermissions = async () => {
  return Permission.findAll();
};

/**
 * Get permissions by id
 * @param {ObjectId} id
 * @returns {Promise<Permissions>}
 */
const getPermissionsById = async (id) => {
  return Permission.findByPk(id);
};

module.exports = {
  getAllPermissions,
  getPermissionsById,
};
