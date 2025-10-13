const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const productCategory = sequelize.define('product_categories', {
});

module.exports = { productCategory };
