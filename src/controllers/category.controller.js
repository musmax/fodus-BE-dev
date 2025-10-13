const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { categoryService } = require('../services');
const pick = require('../utils/pick');

const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

const getCategories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const categories = await categoryService.fetchAllCategories(filter);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Categories fetched successfully',
    data: categories,
  });});

const getCategoryById = catchAsync(async (req, res) => {
  const category = await categoryService.fetchCategoryById(req.params.id);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Category fetch successfully',
    data: category,
  });
});

const updateCategoryById = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategoryById(req.params.id, req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

const deleteCategoryById = catchAsync(async (req, res) => {
  await categoryService.deleteCategoryById(req.params.id);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Category deleted successfully',
  });
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};
