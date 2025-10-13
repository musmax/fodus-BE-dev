const Joi = require('joi');

const createOrder = {
  body: Joi.object().keys({
    paymentMethod: Joi.string().valid('paystack', 'flutterwave', 'wallet', 'monify', 'stripe', 'offline').required(),
    deliveryAddress: Joi.string().required(),
    currentUser: Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      cityTown: Joi.string().required(),
      postCode: Joi.string().required(),
      state: Joi.string(),
      country: Joi.string(),
    }),
    paymentObjects: Joi.array()
      .items(
        Joi.object().keys({
          productId: Joi.number().required(),
          quantity: Joi.number().required(),
        })
      )
      .min(1)
      .required(),
  }),
};


const getOrders = {
  query: Joi.object().keys({
    transactionId: Joi.number(),
    deliveryAddress: Joi.string(),
    isDelivered: Joi.boolean(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string(),
    phoneNumber: Joi.string(),
    cityTown: Joi.string(),
    postCode: Joi.string(),
    state: Joi.string(),
  }),
};

const getTransactions = {
  query: Joi.object().keys({
    orderId: Joi.number(),
    status: Joi.string(),
    reference: Joi.string(),
    paymentMethod: Joi.string().valid('paystack', 'flutterwave', 'monify', 'wallet', 'offline'),
    alertType: Joi.string().valid('credit', 'debit', 'reverse', 'overdraft'),
  }),
};

const verifyTransaction = {
  query: Joi.object().keys({
    reference: Joi.string(),
    payment_intent_id: Joi.string(),
  }),
};

const getOrderById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const getTransactionById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const updateOrderTracker = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    deliveryNote: Joi.string(),
    isDelivered: Joi.string(),
  }),
};



module.exports = {
  createOrder,
  getOrderById,
  getOrders,
  verifyTransaction,
  getTransactionById,
  updateOrderTracker,
  getTransactions
};
