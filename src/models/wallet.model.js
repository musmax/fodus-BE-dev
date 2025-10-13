const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Wallet = sequelize.define('wallet', {
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  isSuspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = { Wallet };
