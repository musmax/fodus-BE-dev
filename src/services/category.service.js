const httpStatus = require('http-status');
const { Category } = require('../models/category.model');
const ApiError = require('../utils/ApiError');
const { buildWhereCondition } = require('../utils/FilterSort');

/**
 * check for name duplicate
 */
const checkNameDuplicate = async (name) => {
  const category = await Category.findOne({ where: { name } });
  if (category) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category name already exists');
  }
};


/**
 * Fetch all categories
 * @param {Object} filter
 * @param {string} filter.name
 * @returns {Promise<*>}
 */
const fetchAllCategories = async (filter) => {
  return Category.findAll({
    where: buildWhereCondition(filter),
  });
};

/**
 * Fetch a category by id
 * @param {number} id
 * @returns {Promise<*>}
 */
const fetchCategoryById = async (id) => {
  const category =  await Category.findByPk(id);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return category;
};

/**
 * Create category
 * @param {Object} categoryBody
 * @returns {Promise<*>}
 */
const createCategory = async (categoryBody) => {
  await checkNameDuplicate(categoryBody.name);

  return Category.create(categoryBody);
};

/**
 * Update category by id
 * @param {number} categoryId
 * @param {Object} updateBody
 * @param {string} updateBody.name
 * @param {number} updateBody.parentId
 * @param {string} updateBody.url
 * @returns {Promise<*>}
 */
const updateCategoryById = async (categoryId, updateBody) => {
  const category = await fetchCategoryById(categoryId);

  if (updateBody.name) {
    await checkNameDuplicate(updateBody.name);
  }

  Object.assign(category, updateBody);
  await category.save();
  return category;
};

/**
 * Delete category by id
 * @param {number} categoryId
 * @returns {Promise<*>}
 */
const deleteCategoryById = async (categoryId) => {
  const category = await fetchCategoryById(categoryId);

  await category.destroy();
  return category;
};

module.exports = {
  fetchAllCategories,
  fetchCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
};
