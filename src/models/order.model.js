const sequelizePaginate = require('sequelize-paginate');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('order', {
  amount: {
    type: DataTypes.INTEGER,
  },
  deliveryAddress: {
    type: DataTypes.STRING,
  },
  reference: {
    type: DataTypes.STRING,
  },
  isDelivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deliveryNoteTracker: {
    type: DataTypes.STRING,
  },
  firstName: {
    type: DataTypes.STRING,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  postCode: {
    type: DataTypes.STRING,
  },
  townOrCity: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.STRING,
  },
  country: {
    type: DataTypes.STRING,
  },
  payment_intent_id: {
    type: DataTypes.STRING,
  },
});

sequelizePaginate.paginate(Order);

module.exports = { Order };
