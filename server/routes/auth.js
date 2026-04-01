const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticate, generateToken } = require('../middleware/auth');

// FR-01: Register with email, password, full name, address
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, municipality, city, barangay, street, postalCode } = req.body;

    // FR-02: Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required.' });
    }

    // FR-02: Check duplicate email
    const [existing] = await db.execute('SELECT id FROM customers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Hash password (never stored plain text per SRS 5.2)
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO customers (email, password, first_name, last_name, phone, role, municipality, city, barangay, street, postal_code, is_verified)
       VALUES (?, ?, ?, ?, ?, 'customer', ?, ?, ?, ?, ?, TRUE)`,
      [email, hashedPassword, firstName, lastName, phone || null, municipality || null, city || null, barangay || null, street || null, postalCode || null]
    );

    // Create a cart for the new user (FR-26: persistent cart)
    await db.execute('INSERT INTO cart (customer_id) VALUES (?)', [result.insertId]);

    const token = generateToken({ id: result.insertId, email, role: 'customer' });

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: result.insertId, email, firstName, lastName, role: 'customer' }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// FR-04: Login with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [users] = await db.execute('SELECT * FROM customers WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // FR-05: Maintain session (via JWT)
    const token = generateToken(user);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        address: {
          municipality: user.municipality,
          city: user.city,
          barangay: user.barangay,
          street: user.street,
          postalCode: user.postal_code
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// FR-07: Get/Update profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, email, first_name, last_name, phone, role, municipality, city, barangay, street, postal_code, created_at FROM customers WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

    const u = users[0];
    res.json({
      id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name,
      phone: u.phone, role: u.role, createdAt: u.created_at,
      address: { municipality: u.municipality, city: u.city, barangay: u.barangay, street: u.street, postalCode: u.postal_code }
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-07: Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, phone, municipality, city, barangay, street, postalCode } = req.body;
    await db.execute(
      `UPDATE customers SET first_name=?, last_name=?, phone=?, municipality=?, city=?, barangay=?, street=?, postal_code=? WHERE id=?`,
      [firstName, lastName, phone, municipality, city, barangay, street, postalCode, req.user.id]
    );
    res.json({ message: 'Profile updated.' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
