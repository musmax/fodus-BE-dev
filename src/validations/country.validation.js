const Joi = require('joi');

const getCountryById = {
  params: Joi.object().keys({
    countryId: Joi.number().required(),
  }),
};

const queryCountries = {
  query: Joi.object().keys({
    name: Joi.string(),
  }),
};

module.exports = {
  getCountryById,
  queryCountries,
};
