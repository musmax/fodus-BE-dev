const httpStatus = require('http-status');
const { Feedback } = require('../models/feedback.model');
const ApiError = require('../utils/ApiError');
const { buildWhereCondition } = require('../utils/FilterSort');

/**
 * Create a feedback
 * @param {Object} feedbackBody
 * @returns {Promise<Feedback>}
 */
const createFeedback = async (feedbackBody) => {
  return Feedback.create(feedbackBody);
};

/**
 * Get feedback by id
 * @param {number} id
 * @returns {Promise<Feedback>}
 */
const getFeedbackById = async (id) => {
  const feedback = await Feedback.findByPk(id);
  if (!feedback) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feedback not found');
  }
  return feedback;
};

/**
 * Get feedbacks with pagination
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const getFeedbacks = async (filter, options) => {
  const { docs, pages, total } = await Feedback.paginate({
    where: buildWhereCondition({ ...filter }),
    ...options,
  });
  return {
    feedbacks: docs,
    pagination: {
      limit: options.paginate,
      page: options.page,
      totalResults: total,
      totalPages: pages,
    },
  };
};

/**
 * Update feedback by id
 * @param {number} feedbackId
 * @param {Object} updateBody
 * @returns {Promise<Feedback>}
 */
const updateFeedbackById = async (feedbackId, updateBody) => {
  const feedback = await getFeedbackById(feedbackId);
  Object.assign(feedback, updateBody);
  await feedback.save();
  return feedback;
};

/**
 * Delete feedback by id
 * @param {number} feedbackId
 * @returns {Promise<Feedback>}
 */
const deleteFeedbackById = async (feedbackId) => {
  const feedback = await getFeedbackById(feedbackId);
  await feedback.destroy();
  return feedback;
};

module.exports = {
  createFeedback,
  getFeedbackById,
  getFeedbacks,
  updateFeedbackById,
  deleteFeedbackById,
}; 