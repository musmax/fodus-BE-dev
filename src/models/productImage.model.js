const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductImages = sequelize.define('productImages', {
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
});

module.exports = { ProductImages };
