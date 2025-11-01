const Joi = require('joi');

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    availableColors: Joi.array().items(Joi.string()),
    availableSizes: Joi.array().items(Joi.string()),
    category: Joi.string().required(),
    productImage: Joi.string().required(),
    section: Joi.string().valid('fashion', 'edibles', 'buka').required(),
    availableQuantity: Joi.number(), // This is the total quantity of the product
    discount: Joi.number(),
    quantity: Joi.number().default(1),
    price: Joi.number().required(),
    isOutOfStock: Joi.boolean().required(),
    // categoriesId: Joi.array().items(Joi.number()),
    product_variation_prices: Joi.array().items(
      Joi.object().keys({
        variety_name: Joi.string().required(),
        price: Joi.number().required(),
      })
    ),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    name: Joi.string(),
    price: Joi.number(),
    category: Joi.string(),
    availableColors: Joi.string(),
    category: Joi.string(),
    availableSizes: Joi.string(),
    categoryId: Joi.number(),
    section: Joi.string().valid('fashion', 'edibles', 'buka'),
    isOutOfStock: Joi.boolean(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer(),
    paginate: Joi.number().integer().min(1).default(25),
  }),
};

const getProductById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};


const updateProductById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    availableColors: Joi.array().items(Joi.string()),
    availableSizes: Joi.array().items(Joi.string()),
    availableQuantity: Joi.number(),
    price: Joi.number(),
    discount: Joi.number(),
    category: Joi.string(),
    quantity: Joi.number(),
    isOutOfStock: Joi.boolean(),
    section: Joi.string().valid('fashion', 'edibles'),
    productImage: Joi.string(),
    product_variation_prices: Joi.array().items(
      Joi.object().keys({
        variety_name: Joi.string().required(),
        price: Joi.number().required(),
      })
    ),
  }),
};

const deleteProductById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

module.exports = {
  createProduct,
  getProductById,
  updateProductById,
  deleteProductById,
  getProducts,
};
