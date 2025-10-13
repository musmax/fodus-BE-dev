const { Country } = require('../models/country.model');
const { buildWhereCondition } = require('../utils/FilterSort');

/**
 *  Fetch all countries
 * @param {Object} filter
 * @param {string} filter.name
 * @returns {Promise<*>}
 */
const fetchAllCountries = async (filter) => {
  return Country.findAll({
    where: buildWhereCondition(filter),
  });
};

/**
 * Fetch a country by id
 * @param id
 * @returns {Promise<*>}
 */
const fetchCountryById = async (id) => {
  return Country.findByPk(id);
};

module.exports = {
  fetchAllCountries,
  fetchCountryById,
};
