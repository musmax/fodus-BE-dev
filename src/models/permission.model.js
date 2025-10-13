const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('permission', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  groupName: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
});

module.exports = { Permission };
