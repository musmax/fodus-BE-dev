const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createFeedback = {
  body: Joi.object().keys({
    content: Joi.string().required().min(1).max(1000),
    email: Joi.string().required().email(),
  }),
};

const getFeedbacks = {
  query: Joi.object().keys({
    email: Joi.string().email(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    paginate: Joi.number().integer(),
  }),
};

const getFeedback = {
  params: Joi.object().keys({
    feedbackId: Joi.string(),
  }),
};

const updateFeedback = {
  params: Joi.object().keys({
    feedbackId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      content: Joi.string().min(1).max(1000),
      email: Joi.string().email(),
    })
    .min(1),
};

const deleteFeedback = {
  params: Joi.object().keys({
    feedbackId: Joi.string(),
  }),
};

module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedback,
  updateFeedback,
  deleteFeedback,
}; 