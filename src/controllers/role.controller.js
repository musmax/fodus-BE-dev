const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { roleService } = require('../services');

const createRole = catchAsync(async (req, res) => {
  const role = await roleService.createRole(req.body);
  res.status(httpStatus.CREATED).send(role);
});

const getRoles = catchAsync(async (req, res) => {
  const roles = await roleService.getAllRoles();
  res.status(httpStatus.OK).send(roles);
});

const getRoleById = catchAsync(async (req, res) => {
  const role = await roleService.getRolesById(req.params.roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  res.status(httpStatus.OK).send(role);
});

const updateRoleById = catchAsync(async (req, res) => {
  const role = await roleService.updateRolesById(req.params.roleId, req.body);
  res.status(httpStatus.OK).send(role);
});

const deleteRoleById = catchAsync(async (req, res) => {
  await roleService.deleteRolesById(req.params.roleId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRoleById,
  deleteRoleById,
};
