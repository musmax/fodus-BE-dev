const sequelizePaginate = require('sequelize-paginate');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rating = sequelize.define('rating', {
  star: {
    type: DataTypes.INTEGER,
  },
  review: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  }
});

sequelizePaginate.paginate(Rating);
module.exports = { Rating };
