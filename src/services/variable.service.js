const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Variable } = require('../models/variable.model');

/**
 * Get all variables
 * @param {Object} filter - Sequelize filter
 * @returns {Promise<Variable[]>}
 */
const getAllVariables = async (filter) => {
  return Variable.findAll({ where: filter });
};

/**
 * Get variable by id
 * @param {ObjectId} id
 * @returns {Promise<Variable>}
 */
const getVariableById = async (id) => {
  return Variable.findByPk(id);
};

/**
 * Create variable
 * @param {Object} variableBody
 * @returns {Promise<Variable>}
 */
const createVariable = async (variableBody) => {
  // check if variable name is taken
  const variable = await Variable.findOne({ where: { name: variableBody.name } });
  if (variable) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Variable name already taken');
  }
  return Variable.create(variableBody);
};

/**
 * Update variable by id
 * @param {ObjectId} variableId
 * @param {Object} updateBody
 * @returns {Promise<Variable>}
 */
const updateVariableById = async (variableId, updateBody) => {
  const variable = await getVariableById(variableId);
  if (!variable) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Variable not found');
  }
  Object.assign(variable, updateBody);
  await variable.save();
  return variable;
};

/**
 * Delete variable by id
 * @param {ObjectId} variableId
 * @returns {Promise<Variable>}
 */
const deleteVariableById = async (variableId) => {
  const variable = await getVariableById(variableId);
  if (!variable) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Variable not found');
  }
  await variable.destroy();
  return variable;
};

module.exports = {
  getAllVariables,
  getVariableById,
  createVariable,
  updateVariableById,
  deleteVariableById,
};
