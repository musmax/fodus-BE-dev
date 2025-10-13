const { DataTypes } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const { sequelize } = require('../config/database');

const AuditTrail = sequelize.define('audit_trail', {
  actor: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'anonymous user',
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  module: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  browser: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  route: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

sequelizePaginate.paginate(AuditTrail);

module.exports = { AuditTrail };
