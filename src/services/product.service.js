const { Op, Sequelize } = require('sequelize');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { buildWhereCondition } = require('../utils/FilterSort');
const { Product } = require('../models/product.model');
// const { fetchCategoryById } = require('./category.service');
// const { ProductImages } = require('../models/productImage.model');
// const { Category } = require('../models/category.model');
// const { productCategory } = require('../models/productCategory.model');

/**
 * @typedef {Object} ProductObject
 * @property {string} name
 * @property {string} description
 * @property {number} discount
 * @property {number} availableQuantity
 * @property {array} availableSizes
 * @property {array} availableColors
 * @property {array} categoriesId
 * @property {array} availableColors
 * @property {array} productImages
 */

/**
 * Fetch all Products
 * @param {Object} filter
 * @param {string} filter.name
 * @param {string} filter.availableSizes
 * @param {string} filter.availableColors
 * @param {Object} options
 * @param {Object} user - User object (optional, for admin filtering)
 * @returns {Promise<*>}
 */
const fetchAllProducts = async (filter, options, user = null) => {
  try {
    // Base where condition
    let whereCondition = { hasBeenDeleted: false };
    
    // If user is not authenticated (public access), hide products marked as out of stock
    // EXCEPT for 'buka' section products (preorder items) which should always show
    // Note: Products with quantity 0 will still be returned - frontend handles "out of stock" messaging
    if (!user) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { isOutOfStock: false },
          { section: 'buka' }
        ]
      };
    }
    
    // Add any additional filters
    const finalFilter = { ...whereCondition, ...buildWhereCondition(filter) };
    
    const { docs, pages, total } = await Product.paginate({
      where: finalFilter,
      order: [['createdAt', 'DESC']],
      ...options,
    });

    // Return the paginated response
    return {
      products: docs,
      pagination: {
        limit: options.paginate,
        page: options.page,
        totalResults: total,
        totalPages: pages,
      },
    };
  } catch (error) {
    // Log the error for debugging
    console.error('Database connection error in fetchAllProducts:', error);
    
    // If it's a connection error, try to reconnect
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
      console.log('Attempting to reconnect to database...');
      // Wait a bit and retry once
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchAllProducts(filter, options, user);
    }
    
    throw error;
  }
};



/**
 * Fetch a Product by id
 * @param {number} id
 * @returns {Promise<ProductObject>}
 */
const fetchProductById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      {
        association: 'product_creator',
        attributes: ['id', 'firstname', 'lastname', 'email']
      },
      // {
      //   association: 'categories',
      //   through: { attributes: [] },
      // },
      {
        association: 'product_ratings',
      }
    ]
  });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};


/**
 * Create a new Product
 * @param {Object} ProductBody
 * @returns {Promise<ProductObject>}
 */
const createProduct = async (productBody, currentUser) => {

  // const { categoriesId, productImages } = productBody;

  // Validate category IDs
  // await Promise.all(
  //   categoriesId.map(async (categoryId) => {
  //     await fetchCategoryById(categoryId);
  //   })
  // );

  // Create the product
  const product = await Product.create({ ...productBody, userId: currentUser });

  // // Associate the product with its categories
  // await Promise.all(
  //   categoriesId.map(async (categoryId) => {
  //     await productCategory.create({ productId: product.id, categoryId })
  //   })
  // )

  // // Create and associate product images
  // const productImagesInstances = await Promise.all(
  //   productImages.map(async (image) => {
  //     return ProductImages.create({ ...image, productId: product.id });
  //   })
  // );

  // return { product, productImages: productImagesInstances };
  return product;
};



/**
 * Update Product by id
 * @param {number} id
 * @param {ProductObject} updateBody
 * @returns {Promise<ProductObject>}
 */
const updateProductById = async (id, updateBody) => {
  const product = await fetchProductById(id);
  return Object.assign(product, updateBody).save();
};


const deleteProductById = async (id) => {
  const product = await fetchProductById(id);
  product.hasBeenDeleted = true;
  await product.save();
  return product;
};


module.exports = {
  fetchAllProducts,
  fetchProductById,
  createProduct,
  updateProductById,
  deleteProductById,
};
