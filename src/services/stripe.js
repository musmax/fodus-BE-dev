const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { secret } = require('../config/config').stripe;
const logger = require('../config/logger');

// Initialize Stripe
const stripe = require('stripe')(secret);
/**
 * Initialize stripe payment intent (equivalent to paystack initialize)
 *
 * @param {number} amount - Amount in pence (£20.00 = 2000)
 * @param {string} email - Customer email
 * @param {object} metadata - Additional data (order info, etc.)
 * @return {Promise<object>}
 */
const initializeStripeTransaction = async (amount, email, metadata = {}) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'gbp',
            metadata: {
                email,
                ...metadata
            },
            // Enable automatic payment methods
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return {
            status: true,
            message: 'Payment intent created successfully',
            data: {
                client_secret: paymentIntent.client_secret,
                payment_intent_id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status
            }
        };
    } catch (error) {
        logger.error('Stripe initialization error:', error);
        throw new ApiError(httpStatus.BAD_REQUEST, error.message || 'Failed to initialize payment');
    }
};

/**
 * Verify stripe payment (equivalent to paystack verify)
 *
 * @param {string} paymentIntentId - Payment Intent ID
 * @returns {Promise<object>}
 */
const verifyStripePayment = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Check if payment was successful
        if (paymentIntent.status !== 'succeeded') {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Payment not completed');
        }

        return {
            status: true,
            message: 'Payment verified successfully',
            data: {
                id: paymentIntent.id,
                amount: paymentIntent.amount / 100, // Convert pence back to pounds
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                created: paymentIntent.created,
                metadata: paymentIntent.metadata,
                payment_method: paymentIntent.payment_method,
                customer_email: paymentIntent.metadata?.email
            }
        };
    } catch (error) {
        logger.error('Stripe verification error:', error);
        throw new ApiError(httpStatus.BAD_REQUEST, error.message || 'Payment verification failed');
    }
};

/**
 * Handle Stripe webhook events (recommended for production)
 *
 * @param {object} req - Express request object
 * @param {string} webhookSecret - Stripe webhook secret
 * @returns {Promise<object>}
 */
const handleStripeWebhook = async (req, webhookSecret) => {
    try {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            logger.error('Webhook signature verification failed:', err);
            throw new ApiError(httpStatus.BAD_REQUEST, 'Webhook signature verification failed');
        }

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                logger.info('Payment succeeded:', paymentIntent.id);
                return {
                    status: true,
                    event_type: 'payment_intent.succeeded',
                    data: {
                        id: paymentIntent.id,
                        amount: paymentIntent.amount / 100,
                        currency: paymentIntent.currency,
                        metadata: paymentIntent.metadata
                    }
                };

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                logger.error('Payment failed:', failedPayment.id);
                return {
                    status: false,
                    event_type: 'payment_intent.payment_failed',
                    data: {
                        id: failedPayment.id,
                        last_payment_error: failedPayment.last_payment_error
                    }
                };

            default:
                logger.info('Unhandled event type:', event.type);
                return {
                    status: true,
                    event_type: event.type,
                    message: 'Event received but not processed'
                };
        }
    } catch (error) {
        logger.error('Webhook handling error:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Webhook processing failed');
    }
};

/**
 * Create a customer in Stripe (optional, for recurring customers)
 *
 * @param {string} email
 * @param {string} name
 * @returns {Promise<object>}
 */
const createStripeCustomer = async (email, name) => {
    try {
        const customer = await stripe.customers.create({
            email,
            name,
        });

        return {
            status: true,
            data: {
                customer_id: customer.id,
                email: customer.email,
                name: customer.name
            }
        };
    } catch (error) {
        logger.error('Customer creation error:', error);
        throw new ApiError(httpStatus.BAD_REQUEST, error.message || 'Failed to create customer');
    }
};

/**
 * Refund a payment
 *
 * @param {string} paymentIntentId
 * @param {number} amount - Amount to refund in pence (optional, defaults to full refund)
 * @returns {Promise<object>}
 */
const refundStripePayment = async (paymentIntentId, amount = null) => {
    try {
        const refundData = {
            payment_intent: paymentIntentId,
        };

        if (amount) {
            refundData.amount = Math.round(amount * 100); // Convert to pence
        }

        const refund = await stripe.refunds.create(refundData);

        return {
            status: true,
            message: 'Refund processed successfully',
            data: {
                refund_id: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
                payment_intent: refund.payment_intent
            }
        };
    } catch (error) {
        logger.error('Refund error:', error);
        throw new ApiError(httpStatus.BAD_REQUEST, error.message || 'Refund failed');
    }
};

module.exports = {
    initializeStripeTransaction,
    verifyStripePayment,
    handleStripeWebhook,
    createStripeCustomer,
    refundStripePayment,
};