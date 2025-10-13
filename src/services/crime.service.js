const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Crime } = require('../models/crime.model');
const { buildWhereCondition } = require('../utils/FilterSort');

/**
 * @typedef {Object} CrimeObject
 * @property {string} name
 * @property {string} description
 * @property {number} minimumDetentionDays
 */

/**
 * Fetch all City
 * @param {Object} filter
 * @param {string} filter.name
 * @returns {Promise<*>}
 */
const fetchAllCrimes = async (filter, options) => {
  const { docs, pages, total } = await Crime.paginate({
    where: buildWhereCondition({ ...filter }),
    ...options,
  });
  return {
    docs,
    pagination: {
      limit: options.paginate,
      page: options.page,
      totalResults: total,
      totalPages: pages,
    },
  };
};

/**
 * Fetch a Crime by id
 * @param {number} id
 * @returns {Promise<CrimeObject>}
 */
const fetchCrimeById = async (id) => {
  const crime = await Crime.findByPk(id);
  if (!crime) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Crime not found');
  }
  return crime;
};

/**
 * Helper function to find crime by name
 * @param {String} input
 */
const findCrimeByName = async (input) => {
  const crime = await Crime.findOne({ where: { name: input } });
  if (crime) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Crime already exist');
  }
  return crime;
};

/**
 * Create a new crime
 * @param {Object} crimeBody
 * @param {string} crimeBody.name
 * @param {string} crimeBody.description
 * @param {number} crimeBody.probableDetentionDays
 * @returns {Promise<CrimeObject>}
 */
const createCrime = async (crimeBody) => {
  await findCrimeByName(crimeBody.name);
  return Crime.create(crimeBody);
};

/**
 * Update Crime by id
 * @param {number} id
 * @param {CrimeObject} updateBody
 * @returns {Promise<CrimeObject>}
 */
const updateCrimeById = async (id, updateBody) => {
  const crime = await fetchCrimeById(id);
  return Object.assign(crime, updateBody).save();
};

module.exports = {
  fetchAllCrimes,
  fetchCrimeById,
  createCrime,
  updateCrimeById,
};
