const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { feedbackService } = require('../services');
const pick = require('../utils/pick');

const createFeedback = catchAsync(async (req, res) => {
  const feedback = await feedbackService.createFeedback(req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Feedback created successfully',
    data: feedback,
  });
});

const getFeedbacks = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['email']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'paginate']);
  const result = await feedbackService.getFeedbacks(filter, options);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Feedbacks fetched successfully',
    data: result.feedbacks,
    pagination: result.pagination,
  });
});

const getFeedback = catchAsync(async (req, res) => {
  const feedback = await feedbackService.getFeedbackById(req.params.feedbackId);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Feedback fetched successfully',
    data: feedback,
  });
});

const updateFeedback = catchAsync(async (req, res) => {
  const feedback = await feedbackService.updateFeedbackById(req.params.feedbackId, req.body);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Feedback updated successfully',
    data: feedback,
  });
});

const deleteFeedback = catchAsync(async (req, res) => {
  await feedbackService.deleteFeedbackById(req.params.feedbackId);
  res.status(httpStatus.NO_CONTENT).send({
    success: true,
    message: 'Feedback deleted successfully',
  });
});

module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedback,
  updateFeedback,
  deleteFeedback,
}; 