const sequelizePaginate = require('sequelize-paginate');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderProducts = sequelize.define('orderProducts', {
  quantity: {
    type: DataTypes.INTEGER,
  },
});

sequelizePaginate.paginate(OrderProducts);

module.exports = { OrderProducts };
