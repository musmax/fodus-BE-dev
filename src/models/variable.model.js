const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Variable = sequelize.define('variables', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
});

module.exports = { Variable };
