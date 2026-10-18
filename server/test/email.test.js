const { test } = require('node:test');
const assert = require('node:assert/strict');
const sent = [];
const logs = [];
require.cache[require.resolve('nodemailer')] = {
  exports: { createTransport: () => ({ sendMail: async (mail) => sent.push(mail) }) }
};
require.cache[require.resolve('../config/db')] = {
  exports: { execute: async (sql, params) => logs.push(params) }
};
const { sendOrderConfirmation, sendStatusUpdate } = require('../services/emailService');
const order = {
  order_number: 'ORD-fixture', customer_name: 'Fixture', customer_email: 'fixture@example.invalid',
  payment_ref: 'DEMO-fixture', items: [{ product_name: 'Fixture tile', quantity: 1, line_total: 100 }],
  subtotal: 100, shipping_fee: 0, total: 100, estimated_delivery: 'Fixture date'
};

test('demo confirmation and status emails and logs clearly explain there is no real payment or delivery', async () => {
  await sendOrderConfirmation(order);
  await sendStatusUpdate(order, 'Shipped');
  assert.match(sent[0].subject, /^Demo Order/);
  for (let i = 0; i < 2; i++) {
    assert.match(sent[i].text, /^Academic demonstration only\. No payment was collected and no real delivery will occur\. Do not send money\./);
    assert.equal(logs[i][2], sent[i].text);
  }
});

test('legacy payment confirmations keep their existing behavior', async () => {
  await sendOrderConfirmation({ ...order, payment_ref: 'legacy-fixture' });
  assert.match(sent.at(-1).subject, /^Order Confirmed/);
  assert.doesNotMatch(sent.at(-1).text, /Academic demonstration/);
});
