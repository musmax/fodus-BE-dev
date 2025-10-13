const sequelizePaginate = require('sequelize-paginate');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Feedback = sequelize.define('feedback', {
  email: {
    type: DataTypes.STRING,
  },
  content: {
    type: DataTypes.TEXT,
  },
  name: {
    type: DataTypes.STRING,
  },
});

sequelizePaginate.paginate(Feedback);
module.exports = { Feedback };
