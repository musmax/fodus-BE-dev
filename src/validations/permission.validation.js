const Joi = require('joi');

const getPermissionById = {
  params: Joi.object().keys({
    permissionId: Joi.string().required(),
  }),
};

module.exports = {
  getPermissionById,
};
