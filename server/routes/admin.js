const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { sendStatusUpdate } = require('../services/emailService');

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(authorizeAdmin);

// ============================================================
// DASHBOARD (FR-74, FR-75)
// ============================================================
router.get('/dashboard', async (req, res) => {
  try {
    const [revenue] = await db.execute('SELECT COALESCE(SUM(total), 0) as totalRevenue FROM orders');
    const [orderCount] = await db.execute('SELECT COUNT(*) as count FROM orders');
    const [customerCount] = await db.execute("SELECT COUNT(*) as count FROM customers WHERE role = 'customer'");
    const [lowStockCount] = await db.execute('SELECT COUNT(*) as count FROM inventory WHERE stock_qty < low_stock_threshold');

    // Recent 5 orders
    const [recentOrders] = await db.execute(
      `SELECT order_number, customer_name, total, status, created_at
       FROM orders ORDER BY created_at DESC LIMIT 5`
    );

    res.json({
      stats: {
        totalRevenue: revenue[0].totalRevenue,
        totalOrders: orderCount[0].count,
        totalCustomers: customerCount[0].count,
        lowStockItems: lowStockCount[0].count
      },
      recentOrders
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ============================================================
// PRODUCT MANAGEMENT (FR-53 through FR-61)
// ============================================================

// FR-53: Get all products (admin view includes inactive)
router.get('/products', async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `SELECT p.*, i.stock_qty, i.low_stock_threshold FROM products p LEFT JOIN inventory i ON p.id = i.product_id`;
    const params = [];

    if (search) {
      sql += ' WHERE p.name LIKE ?';
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY p.created_at DESC';

    const [products] = await db.execute(sql, params);
    res.json(products);
  } catch (err) {
    console.error('Admin products error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-54, FR-56: Add new product
router.post('/products', async (req, res) => {
  try {
    const { name, description, category, material, color, size, roomApplication, price, stock, imageUrl, isActive } = req.body;

    // FR-56: Validate required
    if (!name || !category || !material || !color || !size || !price) {
      return res.status(400).json({ error: 'Name, category, material, color, size, and price are required.' });
    }

    const [result] = await db.execute(
      `INSERT INTO products (name, description, category, material, color, size, room_application, price, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || '', category, material, color, size, roomApplication || null, price, imageUrl || 'https://placehold.co/400x400/e8e0d5/555555?text=New+Tile', isActive !== false]
    );

    // Create inventory record
    await db.execute('INSERT INTO inventory (product_id, stock_qty) VALUES (?, ?)', [result.insertId, stock || 0]);

    res.status(201).json({ message: 'Product added.', productId: result.insertId });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-57, FR-60: Edit product
router.put('/products/:id', async (req, res) => {
  try {
    const { name, description, category, material, color, size, roomApplication, price, imageUrl, isActive } = req.body;

    await db.execute(
      `UPDATE products SET name=?, description=?, category=?, material=?, color=?, size=?, room_application=?, price=?, image_url=?, is_active=? WHERE id=?`,
      [name, description, category, material, color, size, roomApplication, price, imageUrl, isActive, req.params.id]
    );
    res.json({ message: 'Product updated.' });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-58: Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM inventory WHERE product_id = ?', [req.params.id]);
    await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ============================================================
// INVENTORY MANAGEMENT (FR-62 through FR-67)
// ============================================================

// FR-62, FR-63: Get inventory
router.get('/inventory', async (req, res) => {
  try {
    const { filter } = req.query; // 'low' | 'out'
    let sql = `
      SELECT p.id, p.name, p.category, p.image_url,
             i.stock_qty, i.low_stock_threshold, i.last_updated,
             CASE WHEN i.stock_qty = 0 THEN 'Out of Stock'
                  WHEN i.stock_qty < i.low_stock_threshold THEN 'Low Stock'
                  ELSE 'In Stock' END AS stock_status
      FROM products p LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = TRUE
    `;

    if (filter === 'low') sql += ' AND i.stock_qty > 0 AND i.stock_qty < i.low_stock_threshold';
    else if (filter === 'out') sql += ' AND i.stock_qty = 0';

    sql += ' ORDER BY i.stock_qty ASC';
    const [items] = await db.execute(sql);

    // FR-64: Low stock alert count
    const [lowStock] = await db.execute('SELECT COUNT(*) as count FROM inventory WHERE stock_qty > 0 AND stock_qty < low_stock_threshold');

    res.json({ items, lowStockAlertCount: lowStock[0].count });
  } catch (err) {
    console.error('Inventory error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-66: Update stock quantity
router.put('/inventory/:productId', async (req, res) => {
  try {
    const { stockQty } = req.body;
    if (stockQty < 0) return res.status(400).json({ error: 'Stock cannot be negative.' });

    await db.execute('UPDATE inventory SET stock_qty = ? WHERE product_id = ?', [stockQty, req.params.productId]);
    res.json({ message: 'Stock updated.' });
  } catch (err) {
    console.error('Update stock error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ============================================================
// ORDER MANAGEMENT (FR-68 through FR-73)
// ============================================================

// FR-68: Display all orders
router.get('/orders', async (req, res) => {
  try {
    const { search, status } = req.query;
    let sql = `SELECT o.*, p.payment_ref FROM orders o LEFT JOIN payments p ON o.id = p.order_id WHERE 1=1`;
    const params = [];

    // FR-72: Search
    if (search) {
      sql += ' AND (o.order_number LIKE ? OR o.customer_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    // FR-72: Filter by status
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.created_at DESC';
    const [orders] = await db.execute(sql, params);
    res.json(orders);
  } catch (err) {
    console.error('Admin orders error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-69: Order details
router.get('/orders/:id', async (req, res) => {
  try {
    const [orders] = await db.execute(
      'SELECT o.*, p.payment_ref, p.status as payment_status FROM orders o LEFT JOIN payments p ON o.id = p.order_id WHERE o.id = ?',
      [req.params.id]
    );
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found.' });

    const [items] = await db.execute(
      'SELECT product_name, quantity, unit_price, line_total FROM order_items WHERE order_id = ?',
      [req.params.id]
    );

    res.json({ ...orders[0], items });
  } catch (err) {
    console.error('Order detail error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-70, FR-71: Update order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);

    // If delivered, confirm payment
    if (status === 'Delivered') {
      await db.execute('UPDATE payments SET status = ?, paid_at = NOW() WHERE order_id = ?', ['Confirmed', req.params.id]);
    }

    // FR-71: Send status update email
    const [orders] = await db.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length > 0) {
      sendStatusUpdate(orders[0], status).catch(err => console.error('Email error:', err));
    }

    res.json({ message: `Order status updated to ${status}.`, emailSent: true });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ============================================================
// ANALYTICS & REPORTS (FR-74 through FR-80)
// ============================================================

// FR-78: Monthly revenue chart data
router.get('/analytics/monthly', async (req, res) => {
  try {
    const [data] = await db.execute(`
      SELECT MONTH(sale_date) as month, MONTHNAME(sale_date) as monthName,
             SUM(revenue) as revenue, SUM(quantity_sold) as unitsSold
      FROM sales GROUP BY MONTH(sale_date), MONTHNAME(sale_date) ORDER BY month
    `);
    res.json(data);
  } catch (err) {
    console.error('Monthly analytics error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-79: Sales by category
router.get('/analytics/categories', async (req, res) => {
  try {
    const [data] = await db.execute(`
      SELECT category, SUM(revenue) as revenue, SUM(quantity_sold) as unitsSold
      FROM sales GROUP BY category ORDER BY revenue DESC
    `);
    res.json(data);
  } catch (err) {
    console.error('Category analytics error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-77: Top 10 best-selling products
router.get('/analytics/bestsellers', async (req, res) => {
  try {
    const [data] = await db.execute(`
      SELECT p.id, p.name, p.category, p.sold_count, p.price,
             (p.sold_count * p.price) as totalRevenue
      FROM products p WHERE p.is_active = TRUE
      ORDER BY p.sold_count DESC LIMIT 10
    `);
    res.json(data);
  } catch (err) {
    console.error('Bestsellers error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-80: Export orders to CSV
router.get('/analytics/export-csv', async (req, res) => {
  try {
    const [orders] = await db.execute(`
      SELECT o.order_number, o.customer_name, o.customer_email,
             o.total, o.status, o.created_at, p.payment_ref
      FROM orders o LEFT JOIN payments p ON o.id = p.order_id
      ORDER BY o.created_at DESC
    `);

    const headers = 'Order ID,Customer,Email,Total,Status,Date,Payment Ref\n';
    const rows = orders.map(o =>
      `${o.order_number},${o.customer_name},${o.customer_email},${o.total},${o.status},${o.created_at},${o.payment_ref || ''}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tilematch_orders.csv');
    res.send(headers + rows);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
