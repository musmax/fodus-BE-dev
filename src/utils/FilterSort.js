const { Op } = require('sequelize');

const determineOperator = (value) => {
  if (typeof value === 'string') {
    return { [Op.like]: `%${value}%` };
  }
  // You can add more type checks here for other data types and decide the operator accordingly
  return value;
};

const buildWhereCondition = (filter) => {
  const condition = {};
  Object.keys(filter).forEach((key) => {
    condition[key] = determineOperator(filter[key]);
  });
  return condition;
};

module.exports = {
  buildWhereCondition,
};
