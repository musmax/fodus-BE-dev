const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { permissionService } = require('../services');

const getPermissions = catchAsync(async (req, res) => {
  const permissions = await permissionService.getAllPermissions();
  res.status(httpStatus.OK).send(permissions);
});

const getPermissionById = catchAsync(async (req, res) => {
  const permission = await permissionService.getPermissionsById(req.params.permissionId);
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  res.status(httpStatus.OK).send(permission);
});

module.exports = {
  getPermissions,
  getPermissionById,
};
