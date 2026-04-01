const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const db = require('../config/db');

// Log email to database
const logEmail = async (recipient, subject, body, status) => {
  try {
    await db.execute(
      'INSERT INTO email_logs (recipient, subject, body, status, sent_at) VALUES (?, ?, ?, ?, ?)',
      [recipient, subject, body, status, status === 'Sent' ? new Date() : null]
    );
  } catch (err) {
    console.error('Email log error:', err.message);
  }
};

// Send order confirmation email (FR-48, FR-49)
const sendOrderConfirmation = async (order) => {
  const itemsList = order.items.map(i => `• ${i.product_name} x${i.quantity} — PHP ${i.line_total.toFixed(2)}`).join('\n');
  const subject = `Order Confirmed — ${order.order_number}`;
  const body = `Hi ${order.customer_name},\n\nYour order has been placed successfully!\n\nOrder #: ${order.order_number}\nPayment Ref: ${order.payment_ref}\n\nItems:\n${itemsList}\n\nSubtotal: PHP ${order.subtotal.toFixed(2)}\nTax (12%): PHP ${order.tax.toFixed(2)}\nShipping: PHP ${order.shipping_fee.toFixed(2)}\nTotal: PHP ${order.total.toFixed(2)}\n\nEstimated Delivery: ${order.estimated_delivery}\n\nThank you for shopping at TileMatch!`;

  try {
    await transporter.sendMail({
      from: `"TileMatch" <${process.env.EMAIL_USER}>`,
      to: order.customer_email,
      subject,
      text: body
    });
    await logEmail(order.customer_email, subject, body, 'Sent');
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    await logEmail(order.customer_email, subject, body, 'Failed');
    return false;
  }
};

// Send order status update email (FR-50, FR-51, FR-52)
const sendStatusUpdate = async (order, newStatus) => {
  const statusMessages = {
    'Processing': `Your order ${order.order_number} is now being processed. We'll notify you when it ships.`,
    'Shipped': `Great news! Your order ${order.order_number} has been shipped. Estimated delivery: ${order.estimated_delivery}.`,
    'Delivered': `Your order ${order.order_number} has been delivered. Thank you for shopping at TileMatch!`
  };

  const subject = `Order ${newStatus} — ${order.order_number}`;
  const body = `Hi ${order.customer_name},\n\n${statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`}\n\nOrder #: ${order.order_number}\nTotal: PHP ${order.total.toFixed(2)}\n\n— TileMatch Team`;

  try {
    await transporter.sendMail({
      from: `"TileMatch" <${process.env.EMAIL_USER}>`,
      to: order.customer_email,
      subject,
      text: body
    });
    await logEmail(order.customer_email, subject, body, 'Sent');
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    await logEmail(order.customer_email, subject, body, 'Failed');
    return false;
  }
};

module.exports = { sendOrderConfirmation, sendStatusUpdate };
