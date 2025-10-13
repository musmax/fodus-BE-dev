const Joi = require('joi');

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    icon: Joi.string().required(),
  }),
};

const getCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
  }),
};

const getCategoryById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const updateCategoryById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    icon: Joi.string(),
  }),
};

const deleteCategoryById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

module.exports = {
  createCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
  getCategories,
};
