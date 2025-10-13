const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { countryService } = require('../services');
const pick = require('../utils/pick');

const fetchAllCountries = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const countries = await countryService.fetchAllCountries(filter);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Countries fetched successfully',
    data: countries,
  });
});

const fetchCountryById = catchAsync(async (req, res) => {
  const country = await countryService.fetchCountryById(req.params.countryId);
  if (!country) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Country not found');
  }
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Country fetched successfully',
    data: country,
  });
});

module.exports = {
  fetchAllCountries,
  fetchCountryById,
};
