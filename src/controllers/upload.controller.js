const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { uploadService } = require('../services');

const uploadFile = catchAsync(async (req, res) => {
  const url = await uploadService.uploadFile(req.file);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'File uploaded successfully',
    data: url,
  });
});

module.exports = {
  uploadFile,
};
