const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { emailQueueService } = require('../services');

const getEmailQueueStatus = catchAsync(async (req, res) => {
  const status = emailQueueService.getStatus();
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Email queue status retrieved successfully',
    data: status,
  });
});

const clearEmailQueue = catchAsync(async (req, res) => {
  emailQueueService.clear();
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Email queue cleared successfully',
  });
});

module.exports = {
  getEmailQueueStatus,
  clearEmailQueue,
};
