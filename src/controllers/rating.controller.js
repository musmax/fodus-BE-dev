const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { ratingService } = require('../services');
const pick = require('../utils/pick');

const createRating = catchAsync(async (req, res) => {
  const Rating = await ratingService.createRating(req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Rating created successfully',
    data: Rating,
  });
});

const getRatings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['productId']);
  const options = pick(req.query, ['page', 'paginate']);
  const Ratings = await ratingService.fetchAllratings(filter, options);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Ratings fetched successfully',
    data: Ratings,
  });
});

const getRatingById = catchAsync(async (req, res) => {
  const Rating = await ratingService.fetchRateyId(req.params.id);
  if (!Rating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rating not found');
  }

  res.status(httpStatus.OK).send({
    success: true,
    message: 'Rating fetched successfully',
    data: Rating,
  });
});



module.exports = {
  createRating,
  getRatings,
  getRatingById
};
