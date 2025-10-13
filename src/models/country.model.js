const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Country = sequelize.define('country', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  code: {
    type: DataTypes.STRING,
  },
});

module.exports = { Country };
