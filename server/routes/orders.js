const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { sendOrderConfirmation } = require('../services/emailService');
const { buildCartPricing, ensurePromotionSchema, promotionJoins, promotionSelect } = require('../services/promotionService');

// All order routes require authentication
router.use(authenticate);

// FR-28 through FR-36: Place order (checkout)
router.post('/place', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await ensurePromotionSchema(conn);
    await conn.beginTransaction();

    const { municipality, barangay, street, postalCode, paymentRef } = req.body;
    const requestedProductIds = Array.isArray(req.body.productIds)
      ? req.body.productIds.map(Number).filter((id) => Number.isInteger(id) && id > 0)
      : [];
    const city = municipality;

    // FR-30: Validate address
    if (!municipality || !barangay || !street || !postalCode) {
      await conn.rollback();
      return res.status(400).json({ error: 'All address fields are required.' });
    }

    // Get cart items
    const [carts] = await conn.execute('SELECT id FROM cart WHERE customer_id = ?', [req.user.id]);
    if (carts.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Cart not found.' });
    }

    const [allCartItems] = await conn.execute(
      `SELECT ci.product_id, ci.quantity, p.name, p.price, p.category, i.stock_qty
              , ${promotionSelect}
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN inventory i ON p.id = i.product_id
       ${promotionJoins}
       WHERE ci.cart_id = ?`,
      [carts[0].id]
    );
    const cartItems = requestedProductIds.length
      ? allCartItems.filter((item) => requestedProductIds.includes(Number(item.product_id)))
      : allCartItems;

    if (cartItems.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: requestedProductIds.length ? 'Select at least one available cart item.' : 'Cart is empty.' });
    }

    // FR-67: Verify stock for all items
    for (const item of cartItems) {
      if (item.stock_qty < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ error: `Insufficient stock for ${item.name}. Only ${item.stock_qty} available.` });
      }
    }

    // Calculate totals
    const pricing = buildCartPricing(cartItems);
    const orderLines = pricing.items;
    const { subtotal, tax, shippingFee, total } = pricing;

    // FR-33: Generate unique order number
    const orderNumber = `ORD-2025-${String(Date.now()).slice(-4).padStart(4, '0')}`;

    // Get customer info
    const [users] = await conn.execute('SELECT first_name, last_name, email FROM customers WHERE id = ?', [req.user.id]);
    const customerName = `${users[0].first_name} ${users[0].last_name}`;
    const customerEmail = users[0].email;

    // Estimated delivery = order date + 7 days
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    // FR-34: Save order
    const [orderResult] = await conn.execute(
      `INSERT INTO orders (order_number, customer_id, customer_name, customer_email,
        ship_municipality, ship_city, ship_barangay, ship_street, ship_postal_code,
        subtotal, tax, shipping_fee, total, status, estimated_delivery)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [orderNumber, req.user.id, customerName, customerEmail,
       municipality, city, barangay, street, postalCode,
       subtotal, tax, shippingFee, total, estimatedDelivery]
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of orderLines) {
      const lineTotal = item.line_total;
      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.is_freebie ? `[Bonus] ${item.name}` : item.name, item.quantity, item.effective_price, lineTotal]
      );

      // FR-65: Decrease stock
      await conn.execute('UPDATE inventory SET stock_qty = stock_qty - ? WHERE product_id = ?', [item.quantity, item.product_id]);

      if (item.is_freebie) continue;

      // Update sold count and insert sales record for paid items.
      await conn.execute('UPDATE products SET sold_count = sold_count + ? WHERE id = ?', [item.quantity, item.product_id]);
      await conn.execute(
        'INSERT INTO sales (order_id, product_id, category, quantity_sold, revenue, sale_date) VALUES (?, ?, ?, ?, ?, CURDATE())',
        [orderId, item.product_id, item.category, item.quantity, lineTotal]
      );
    }

    // FR-37 through FR-42: Record GCash payment
    const gcashRef = paymentRef || Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
    await conn.execute(
      'INSERT INTO payments (order_id, payment_method, payment_ref, amount, status) VALUES (?, ?, ?, ?, ?)',
      [orderId, 'GCash', gcashRef, total, 'Pending']
    );

    // FR-36: Clear checked out cart items
    if (requestedProductIds.length) {
      const placeholders = requestedProductIds.map(() => '?').join(',');
      await conn.execute(
        `DELETE FROM cart_items WHERE cart_id = ? AND product_id IN (${placeholders})`,
        [carts[0].id, ...requestedProductIds]
      );
    } else {
      await conn.execute('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
    }

    await conn.commit();

    // FR-48: Send confirmation email (async, don't block response)
    const orderData = {
      order_number: orderNumber, customer_name: customerName, customer_email: customerEmail,
      payment_ref: gcashRef, items: orderLines.map(i => ({ product_name: i.is_freebie ? `[Bonus] ${i.name}` : i.name, quantity: i.quantity, line_total: i.line_total })),
      subtotal, tax, shipping_fee: shippingFee, total, estimated_delivery: estimatedDelivery.toDateString()
    };
    sendOrderConfirmation(orderData).catch(err => console.error('Email error:', err));

    res.status(201).json({
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        orderNumber,
        gcashRef,
        total,
        status: 'Pending',
        estimatedDelivery: estimatedDelivery.toDateString()
      }
    });
  } catch (err) {
    await conn.rollback();
    console.error('Place order error:', err);
    res.status(500).json({ error: 'Server error placing order.' });
  } finally {
    conn.release();
  }
});

// FR-43: Order history
router.get('/history', async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*, p.payment_ref, p.status as payment_status
       FROM orders o LEFT JOIN payments p ON o.id = p.order_id
       WHERE o.customer_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json(orders);
  } catch (err) {
    console.error('Order history error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-44, FR-45, FR-47: Track order by order number
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*, p.payment_ref, p.status as payment_status
       FROM orders o LEFT JOIN payments p ON o.id = p.order_id
       WHERE o.order_number = ?`,
      [req.params.orderNumber]
    );
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found.' });

    const [items] = await db.execute(
      'SELECT product_name, quantity, unit_price, line_total FROM order_items WHERE order_id = ?',
      [orders[0].id]
    );

    res.json({ ...orders[0], items });
  } catch (err) {
    console.error('Track order error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
