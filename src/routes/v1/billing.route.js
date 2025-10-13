const express = require('express');
const validate = require('../../middlewares/validate');
const { billingValidation } = require('../../validations');
const { billingController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/create-order')
  .post(validate(billingValidation.createOrder), billingController.initializeOrderTransaction);

router
  .route('/verify-order-transaction')
  .get(validate(billingValidation.verifyTransaction), billingController.verifyStripeOrderTransaction);

router
  .route('/orders')
  .get(auth(), validate(billingValidation.getOrders), billingController.fetchAllOrders);

router
  .route('/transactions')
  .get(auth(), validate(billingValidation.getTransactions), billingController.fetchTransactions);

router
  .route('/order/:id')
  .get(auth(), validate(billingValidation.getOrderById), billingController.fetchOrderById);

router
  .route('/transaction/:id')
  .get(auth(), validate(billingValidation.getTransactionById), billingController.fetchTransactionById);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Billings
 *   description: Billing management and retrieval
 */


/**
 * @swagger
 * /billings/create-order:
 *   post:
 *     summary: Create an order
 *     description: Only admins can create an order.
 *     tags: [Billings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       "201":
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Transaction initiated successfully
 *                 reference:
 *                   type: string
 *                   example: unique-payment-reference
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /billings/verify-order-transaction:
 *   get:
 *     summary: verify the orer transaction
 *     description: Only admins can retrieve all orders.
 *     tags: [Billings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: payment_intent_id
 *         schema:
 *           type: string
 *         description: Billing payment_intent_id
 *     responses:
 *       "200":
 *         description: List of orders retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */


/**
 * @swagger
 * /billings/orders:
 *   get:
 *     summary: Get all Orders
 *     description: Only admins can retrieve all Orders.
 *     tags: [Billings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: reference
 *        schema:
 *          type: string
 *          description: Billing reference
 *      - in: query
 *        name: amount
 *        schema:
 *          type: integer
 *          description: Billing amount
 *      - in: query
 *        name: isDelivered
 *        schema:
 *          type: boolean
 *          description: Billing isDelivered
 *      - in: query
 *        name: deliveryAddress
 *        schema:
 *          type: string
 *          description: Billing deliveryAddress
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /billings/transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Only admins can retrieve all transactions.
 *     tags: [Billings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: orderId
 *        schema:
 *          type: integer
 *          description: Billing orderId
 *      - in: query
 *        name: userId
 *        schema:
 *          type: integer
 *          description: Billing userId
 *      - in: query
 *        name: status
 *        schema:
 *          type: string
 *          enum:
 *            - pending
 *            - success
 *          description: Billing status
 *      - in: query
 *        name: reference
 *        schema:
 *          type: string
 *          description: Billing reference
 *      - in: query
 *        name: alertType
 *        schema:
 *          type: string
 *          enum:
 *            - credit
 *            - debit
 *            - reverse
 *            - overdraft    
 *          description: Billing transaction alertType
 *      - in: query
 *        name: paymentMethod
 *        schema:
 *          type: string
 *          enum:
 *            - flutterwave
 *            - paystack
 *            - wallet
 *            - monify    
 *          description: Billing transaction paymentMethod
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /billings/order/{id}:
 *   get:
 *     summary: Get an  order
 *     description: Only admins can fetch order.
 *     tags: [Billings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: order id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Order'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /billings/transaction/{id}:
 *   get:
 *     summary: Get a transaction
 *     description: Only admins can fetch transaction.
 *     tags: [Billings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: transaction id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Order'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */



/**
 * @swagger
 * /billings/tracker/{id}:
 *   patch:
 *     summary: Update a order tracker
 *     description: Only admins can update order tracker.
 *     tags: [Billings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: order id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tracker'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Crime updated successfully
 */
