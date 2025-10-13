const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  description: {
    type: DataTypes.STRING,
  },
  icon: {
    type: DataTypes.STRING,
  },
});

module.exports = { Category };
