const Joi = require('joi');

const createRating = {
  body: Joi.object().keys({
    review: Joi.string().required(),
    star: Joi.number().required(),
    name: Joi.string().required(),
    location: Joi.string().required(),
    productId: Joi.number().required()
  })
};

const getRatings = {
  query: Joi.object().keys({
    productId: Joi.number(),
  }),
};

const getRatingById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};


const updateRatingById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    review: Joi.string(),
    star: Joi.number(),
    productId: Joi.number(),
    location: Joi.string(),
  }),
};


module.exports = {
  createRating,
  getRatingById,
  updateRatingById,
  getRatings,
};
