const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { tokenTypes } = require('../config/tokens');

const Token = sequelize.define('token', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
    index: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL),
    allowNull: false,
  },
  expires: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  blacklisted: {
    type: DataTypes.BOOLEAN,
  },
});

module.exports = { Token };
