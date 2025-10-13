const { Sequelize } = require('sequelize');
const { sequelize } = require('./config');

exports.sequelize = new Sequelize(sequelize.url);
