const nodemailer = require('nodemailer');
const { baseUrl } = require('../config/config').frontendurl;
const config = require('../config/config');
const logger = require('../config/logger');
const { User } = require('../models/user.model');
const { convertTemplateToMessage, getMessageTemplateByTitle } = require('./message_template.service');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  try {
    const msg = { from: config.email.from, to, subject, text };
    await transport.sendMail(msg);
  } catch (error) {
    logger.info(error);
  }
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  // get email template
  const {
    dataValues: { emailSubject, emailBody },
  } = await getMessageTemplateByTitle('Reset_Password');

  // get user information
  const user = await User.findOne({ where: { email: to } });
  // replace the placeholders with the actual values
  const text = await convertTemplateToMessage(emailBody, {
    firstName: user.dataValues.firstName,
    token,
  });

  await sendEmail(to, emailSubject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `${baseUrl}/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * send confirmation email
 */
const sendConfirmationEmail = async (to, emailSubject, text) => {
  // design tempplate and send to user after successful order purchase
  await sendEmail(to, emailSubject, text);
};

/**
 * Send order confirmation email with detailed order information
 * @param {Object} orderData - Complete order data with products and transaction info
 * @returns {Promise}
 */
const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const {
      id: orderId,
      amount,
      deliveryAddress,
      reference,
      firstName,
      lastName,
      email,
      phoneNumber,
      postCode,
      townOrCity,
      state,
      createdAt,
      order_product: orderProducts,
      order_transaction: transaction
    } = orderData;

    // Format date
    const orderDate = new Date(createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Check if orderProducts exists and has data
    if (!orderProducts || !Array.isArray(orderProducts) || orderProducts.length === 0) {
      logger.warn(`No order products found for order #${orderId}, sending basic confirmation email`);
      
      // Send a basic confirmation email without product details
      const basicHtmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; }
            .order-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank you for your order!</h1>
              <p>Hi ${firstName},</p>
            </div>
            
            <div class="content">
              <p>Thanks for your order #${orderId}. It's on-hold until we confirm that payment has been received.</p>
              
              <div class="order-details">
                <h3>Order Summary</h3>
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>Total Amount:</strong> £${amount.toFixed(2)}</p>
                <p><strong>Order Date:</strong> ${orderDate}</p>
                <p><strong>Payment Method:</strong> ${transaction?.paymentMethod || 'Not specified'}</p>
              </div>
              
              <p>We look forward to fulfilling your order soon.</p>
            </div>
            
            <div class="footer">
              <p><strong>UK #1 African Food Store</strong></p>
              <p>Order Reference: ${reference}</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const msg = { 
        from: config.email.from, 
        to: email, 
        subject, 
        html: basicHtmlContent 
      };
      
      await transport.sendMail(msg);
      logger.info(`Basic order confirmation email sent to ${email} for order #${orderId}`);
      return;
    }

    // Calculate subtotal
    const subtotal = orderProducts.reduce((total, item) => {
      return total + (item.product_order.price * item.quantity);
    }, 0);

    // Generate products HTML
    const productsHtml = orderProducts.map(item => {
      const product = item.product_order;
      const itemTotal = product.price * item.quantity;
      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${product.name}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">£${product.price.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    // Generate billing address
    const billingAddress = [
      `${firstName || ''} ${lastName || ''}`.trim(),
      deliveryAddress,
      townOrCity,
      state,
      postCode,
      'United Kingdom (UK)',
      phoneNumber,
      email
    ].filter(Boolean).join('<br>');

    const subject = `Order Confirmation - Order #${orderId}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; }
          .order-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .product-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .product-table th { background-color: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .product-table td { padding: 10px 0; border-bottom: 1px solid #eee; }
          .total-row { font-weight: bold; background-color: #f8f9fa; }
          .billing-section { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
          .highlight { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank you for your order!</h1>
            <p>Hi ${firstName},</p>
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; border: 2px solid #2196f3;">
              <h3 style="margin: 0; color: #1976d2;">Order Reference: ${reference}</h3>
              <p style="margin: 5px 0 0 0; color: #1976d2; font-weight: bold;">Order #${orderId}</p>
            </div>
          </div>
          
          <div class="content">
            <p>Thanks for your order. ${transaction?.paymentMethod === 'stripe' ? 'Your payment has been received. Your order will be processed for delivery and it will be delivered in the shortest period of time.' : 'It\'s on-hold until we confirm that payment has been received.'}</p>
            
            ${transaction?.paymentMethod !== 'stripe' ? `
            <div class="highlight">
              <strong>After payment, send a screenshot of your receipt and your Order ID via WhatsApp to +44 7939 872679. Your order will be processed once payment is confirmed.</strong>
            </div>
            
            <div class="order-details">
              <h3>Our bank details</h3>
              <p><strong>GM PLAZA LTD:</strong><br>
              Bank: Sample bank<br>
              Account number: 12345678<br>
              Sort code: 01-23-45</p>
            </div>
            ` : ''}
            
            <div class="order-details">
              <h3>[Order #${orderId}] (${orderDate})</h3>
              
              <table class="product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsHtml}
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td colspan="2">Subtotal:</td>
                    <td style="text-align: right;">£${subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2">Shipping:</td>
                    <td style="text-align: right;">Store Pickup</td>
                  </tr>
                  <tr>
                    <td colspan="2">Payment method:</td>
                    <td style="text-align: right;">${transaction.paymentMethod}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="2">Total:</td>
                    <td style="text-align: right;">£${amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div class="billing-section">
              <h3>Billing address</h3>
              <p>${billingAddress}</p>
            </div>
            
            <p>We look forward to fulfilling your order soon.</p>
          </div>
          
          <div class="footer">
            <p><strong>UK #1 African Food Store</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email with HTML content
    const msg = { 
      from: config.email.from, 
      to: email, 
      subject, 
      html: htmlContent 
    };
    
    await transport.sendMail(msg);
    logger.info(`Order confirmation email sent to ${email} for order #${orderId}`);
    
  } catch (error) {
    logger.error('Error sending order confirmation email:', error);
    throw error;
  }
};

/**
 * Send order notification email to platform owner
 * @param {Object} orderData - Complete order data with products and transaction info
 * @returns {Promise}
 */
const sendOrderNotificationToOwner = async (orderData) => {
  try {
    const {
      id: orderId,
      amount,
      deliveryAddress,
      reference,
      firstName,
      lastName,
      email,
      phoneNumber,
      postCode,
      townOrCity,
      state,
      createdAt,
      order_product: orderProducts,
      order_transaction: transaction
    } = orderData;

    // Format date
    const orderDate = new Date(createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Calculate subtotal
    const subtotal = orderProducts ? orderProducts.reduce((total, item) => {
      return total + (item.product_order.price * item.quantity);
    }, 0) : amount;

    // Generate products HTML
    const productsHtml = orderProducts ? orderProducts.map(item => {
      const product = item.product_order;
      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${product.name}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">£${product.price.toFixed(2)}</td>
        </tr>
      `;
    }).join('') : '';

    // Generate customer address
    const customerAddress = [
      `${firstName || ''} ${lastName || ''}`.trim(),
      deliveryAddress,
      townOrCity,
      state,
      postCode,
      'United Kingdom (UK)',
      phoneNumber,
      email
    ].filter(Boolean).join('<br>');

    const subject = `🛒 New Order #${orderId} - ${firstName} ${lastName}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; }
          .order-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .product-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .product-table th { background-color: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .product-table td { padding: 10px 0; border-bottom: 1px solid #eee; }
          .total-row { font-weight: bold; background-color: #f8f9fa; }
          .customer-section { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
          .urgent { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 New Order Received!</h1>
            <p>Order #${orderId} - ${orderDate}</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <strong>⚠️ Action Required:</strong> Process this order and prepare for delivery.
            </div>
            
            <div class="customer-section">
              <h3>👤 Customer Information</h3>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phoneNumber}</p>
              <p><strong>Order Reference:</strong> ${reference}</p>
            </div>
            
            <div class="order-details">
              <h3>📦 Order Details</h3>
              
              ${orderProducts ? `
              <table class="product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsHtml}
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td colspan="2">Subtotal:</td>
                    <td style="text-align: right;">£${subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2">Shipping:</td>
                    <td style="text-align: right;">Store Pickup</td>
                  </tr>
                  <tr>
                    <td colspan="2">Payment method:</td>
                    <td style="text-align: right;">${transaction?.paymentMethod || 'Not specified'}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="2">Total:</td>
                    <td style="text-align: right;">£${amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              ` : `
              <p><strong>Total Amount:</strong> £${amount.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${transaction?.paymentMethod || 'Not specified'}</p>
              `}
            </div>
            
            <div class="customer-section">
              <h3>📍 Delivery Address</h3>
              <p>${customerAddress}</p>
            </div>
            
            <div class="urgent">
              <strong>📞 Next Steps:</strong>
              <ul>
                <li>Prepare the order items</li>
                <li>Contact customer if needed: ${phoneNumber}</li>
                <li>Arrange delivery or pickup</li>
                <li>Update order status in admin panel</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>UK #1 African Food Store</strong></p>
            <p>Order Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to owner
    const msg = { 
      from: config.email.from, 
      to: 'ediblesbyfodus@gmail.com', 
      subject, 
      html: htmlContent 
    };
    
    await transport.sendMail(msg);
    logger.info(`Order notification sent to owner for order #${orderId}`);
    
  } catch (error) {
    logger.error('Error sending order notification to owner:', error);
    throw error;
  }
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendConfirmationEmail,
  sendOrderConfirmationEmail,
  sendOrderNotificationToOwner
};
