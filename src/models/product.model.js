const sequelizePaginate = require('sequelize-paginate');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  description: {
    type: DataTypes.STRING,
  },
  section: {
    type: DataTypes.ENUM('fashion', 'edibles'),
  },
  category: {
    type: DataTypes.STRING,
  },
  productImage: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.FLOAT,
  },
  availableColors: {
    type: DataTypes.JSON,
  },
  availableSizes: {
    type: DataTypes.JSON,
  },
  product_variation_prices: {
    type: DataTypes.JSON,
  },
  isOutOfStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  availableQuantity: {
    type: DataTypes.INTEGER,
  },
  discount: {
    type: DataTypes.FLOAT,
  },
  hasBeenDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
  }
});

sequelizePaginate.paginate(Product);

module.exports = { Product };
