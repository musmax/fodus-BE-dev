const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('role', {
  name: {
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

module.exports = { Role };
