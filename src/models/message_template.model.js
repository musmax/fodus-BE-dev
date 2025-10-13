const sequelizePaginate = require('sequelize-paginate');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MessageTemplate = sequelize.define('message_template', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  smsSubject: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  emailSubject: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  smsBody: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  emailBody: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  type: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
    defaultValue: 'admin',
  },
});

sequelizePaginate.paginate(MessageTemplate);

module.exports = { MessageTemplate };
