const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// All cart routes require authentication
router.use(authenticate);

// FR-21: Get cart contents
router.get('/', async (req, res) => {
  try {
    // Get or create cart
    let [carts] = await db.execute('SELECT id FROM cart WHERE customer_id = ?', [req.user.id]);
    if (carts.length === 0) {
      const [result] = await db.execute('INSERT INTO cart (customer_id) VALUES (?)', [req.user.id]);
      carts = [{ id: result.insertId }];
    }
    const cartId = carts[0].id;

    // Get cart items with product details
    const [items] = await db.execute(
      `SELECT ci.id, ci.product_id, ci.quantity,
              p.name, p.price, p.image_url, p.category,
              i.stock_qty
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    // FR-22: Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal >= 2000 ? 0 : 200;
    const tax = subtotal * 0.12;
    const total = subtotal + shippingFee + tax;

    res.json({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      shippingFee,
      tax,
      total
    });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-18: Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check product exists and has stock (FR-67)
    const [products] = await db.execute(
      'SELECT p.id, p.name, i.stock_qty FROM products p LEFT JOIN inventory i ON p.id = i.product_id WHERE p.id = ? AND p.is_active = TRUE',
      [productId]
    );
    if (products.length === 0) return res.status(404).json({ error: 'Product not found.' });
    if (products[0].stock_qty <= 0) return res.status(400).json({ error: 'Product is out of stock.' });
    if (quantity > products[0].stock_qty) return res.status(400).json({ error: `Only ${products[0].stock_qty} units available.` });

    // Get cart
    let [carts] = await db.execute('SELECT id FROM cart WHERE customer_id = ?', [req.user.id]);
    if (carts.length === 0) {
      const [result] = await db.execute('INSERT INTO cart (customer_id) VALUES (?)', [req.user.id]);
      carts = [{ id: result.insertId }];
    }
    const cartId = carts[0].id;

    // Check if item already in cart
    const [existing] = await db.execute(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );

    if (existing.length > 0) {
      // FR-23: Update quantity
      const newQty = existing[0].quantity + quantity;
      if (newQty > products[0].stock_qty) {
        return res.status(400).json({ error: `Cannot add more. Only ${products[0].stock_qty} units available.` });
      }
      await db.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
    } else {
      await db.execute('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cartId, productId, quantity]);
    }

    // FR-19: Return confirmation
    res.json({ message: `${products[0].name} added to cart.` });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-23: Update quantity
router.put('/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1.' });

    // Check stock
    const [inv] = await db.execute('SELECT stock_qty FROM inventory WHERE product_id = ?', [productId]);
    if (inv.length > 0 && quantity > inv[0].stock_qty) {
      return res.status(400).json({ error: `Only ${inv[0].stock_qty} units available.` });
    }

    const [carts] = await db.execute('SELECT id FROM cart WHERE customer_id = ?', [req.user.id]);
    if (carts.length === 0) return res.status(404).json({ error: 'Cart not found.' });

    // FR-25: Update and recalculate
    await db.execute(
      'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
      [quantity, carts[0].id, productId]
    );

    res.json({ message: 'Cart updated.' });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-24: Remove item from cart
router.delete('/remove/:productId', async (req, res) => {
  try {
    const [carts] = await db.execute('SELECT id FROM cart WHERE customer_id = ?', [req.user.id]);
    if (carts.length === 0) return res.status(404).json({ error: 'Cart not found.' });

    await db.execute('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [carts[0].id, req.params.productId]);
    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
