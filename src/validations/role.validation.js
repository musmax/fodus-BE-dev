const Joi = require('joi');

const createRole = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    permissions: Joi.array().items(Joi.number()).required(),
  }),
};

const getRole = {
  params: Joi.object().keys({
    roleId: Joi.string().required(),
  }),
};

const updateRole = {
  params: Joi.object().keys({
    roleId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    permissions: Joi.array().items(Joi.number()),
  }),
};

const deleteRole = {
  params: Joi.object().keys({
    roleId: Joi.string().required(),
  }),
};

module.exports = {
  createRole,
  getRole,
  updateRole,
  deleteRole,
};
