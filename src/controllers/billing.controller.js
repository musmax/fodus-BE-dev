const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { billingService } = require('../services');
const pick = require('../utils/pick');

const initializeWalletTransaction = catchAsync(async (req, res) => {
  const response = await billingService.initializeWalletTransaction(req.body, req.user);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Transaction for wallet initiated successfully',
    data: response,
  });
});
const transferFromWallet = catchAsync(async (req, res) => {
  const response = await billingService.transferFromWallet(req.body, req.user);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Transaction for wallet transfer successful',
    data: response,
  });
});
const initializeOrderTransaction = catchAsync(async (req, res) => {
  const reference = await billingService.initializeOrderTransaction(req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Transaction initiated successfully',
    data: reference,
  });
});

const verifyStripeOrderTransaction = catchAsync(async (req, res) => {
  const data = await billingService.verifyStripeOrderTransaction(req.query.payment_intent_id);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Transaction verified successfully',
    data: data,
  });
});
const verifyTransaction = catchAsync(async (req, res) => {
  const data = await billingService.verifyTransaction(req.query.reference, req.user);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Transaction verified successfully',
    data: data,
  });
});

const fetchTransactions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['productId']);
  const options = pick(req.query, ['page', 'paginate']);
  const Billings = await billingService.fetchTransactions(filter, options);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Transactions fetched successfully',
    data: Billings,
  });
});

const fetchAllOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['productId']);
  const options = pick(req.query, ['page', 'paginate']);
  const Billings = await billingService.fetchAllOrders(filter, options);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Orders fetched successfully',
    data: Billings,
  });
});

const fetchOrderById = catchAsync(async (req, res) => {
  const order = await billingService.fetchOrderById(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Order fetched successfully',
    data: order,
  });
});

const updateOrderTracker = catchAsync(async (req, res) => {
  const order = await billingService.updateOrderTracker(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Order  tracker updated successfully',
    data: order,
  });
});

const fetchTransactionById = catchAsync(async (req, res) => {
  const transaction = await billingService.fetchTransactionById(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Transaction fetched successfully',
    data: transaction,
  });
});



module.exports = {
  verifyTransaction,
  fetchTransactions,
  fetchAllOrders,
  fetchOrderById,
  updateOrderTracker,
  transferFromWallet,
  initializeWalletTransaction,
  fetchTransactionById,
  initializeOrderTransaction,
  verifyStripeOrderTransaction
};
