const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database (will test connection on require)
require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TileMatch API', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 TileMatch API running on http://localhost:${PORT}`);
  console.log(`📦 Routes:`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/auth/profile`);
  console.log(`   GET    /api/products`);
  console.log(`   GET    /api/products/:id`);
  console.log(`   GET    /api/cart`);
  console.log(`   POST   /api/cart/add`);
  console.log(`   PUT    /api/cart/update`);
  console.log(`   DELETE /api/cart/remove/:productId`);
  console.log(`   POST   /api/orders/place`);
  console.log(`   GET    /api/orders/history`);
  console.log(`   GET    /api/orders/track/:orderNumber`);
  console.log(`   GET    /api/admin/dashboard`);
  console.log(`   GET    /api/admin/products`);
  console.log(`   POST   /api/admin/products`);
  console.log(`   PUT    /api/admin/products/:id`);
  console.log(`   DELETE /api/admin/products/:id`);
  console.log(`   GET    /api/admin/inventory`);
  console.log(`   PUT    /api/admin/inventory/:productId`);
  console.log(`   GET    /api/admin/orders`);
  console.log(`   PUT    /api/admin/orders/:id/status`);
  console.log(`   GET    /api/admin/analytics/monthly`);
  console.log(`   GET    /api/admin/analytics/categories`);
  console.log(`   GET    /api/admin/analytics/bestsellers`);
  console.log(`   GET    /api/admin/analytics/export-csv`);
});

module.exports = app;
