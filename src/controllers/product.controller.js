const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');
const pick = require('../utils/pick');

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user.id);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

const getProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'availableColors', 'availableSizes', 'category', 'price', 'section', 'isOutOfStock']);
  const options = pick(req.query, ['page', 'paginate']);
  // Pass user info to service for authentication-based filtering
  const products = await productService.fetchAllProducts(filter, options, req.user);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Products fetched successfully',
    data: products,
  });
});

const getProductById = catchAsync(async (req, res) => {
  const product = await productService.fetchProductById(req.params.id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  res.status(httpStatus.OK).send({
    success: true,
    message: 'Product fetched successfully',
    data: product,
  });
});

const updateProductById = catchAsync(async (req, res) => {
  await productService.updateProductById(req.params.id, req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Product updated successfully',
  });
});

const deleteProductById = catchAsync(async (req, res) => {
  await productService.deleteProductById(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Product deleted successfully',
  });
});


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  deleteProductById,
  updateProductById
};
