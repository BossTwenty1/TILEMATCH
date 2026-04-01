const express = require('express');
const router = express.Router();
const db = require('../config/db');

// FR-10: Display all products | FR-11: By category | FR-12: Search | FR-13: Filters | FR-14: Sort
router.get('/', async (req, res) => {
  try {
    const { search, category, material, color, size, room, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;

    let sql = `
      SELECT p.*, i.stock_qty, i.low_stock_threshold,
        CASE
          WHEN i.stock_qty = 0 THEN 'Out of Stock'
          WHEN i.stock_qty < i.low_stock_threshold THEN 'Low Stock'
          ELSE 'In Stock'
        END AS stock_status
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    // FR-12: Search by name, color, material, size
    if (search) {
      sql += ` AND (p.name LIKE ? OR p.color LIKE ? OR p.material LIKE ? OR p.size LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    // FR-11: Filter by category
    if (category) {
      const cats = category.split(',');
      sql += ` AND p.category IN (${cats.map(() => '?').join(',')})`;
      params.push(...cats);
    }

    // FR-13: Filter by material
    if (material) {
      const mats = material.split(',');
      sql += ` AND p.material IN (${mats.map(() => '?').join(',')})`;
      params.push(...mats);
    }

    // FR-13: Filter by color
    if (color) {
      const cols = color.split(',');
      sql += ` AND p.color IN (${cols.map(() => '?').join(',')})`;
      params.push(...cols);
    }

    // FR-13: Filter by size
    if (size) {
      const sizes = size.split(',');
      sql += ` AND p.size IN (${sizes.map(() => '?').join(',')})`;
      params.push(...sizes);
    }

    // FR-13: Filter by room application
    if (room) {
      const rooms = room.split(',');
      sql += ` AND p.room_application IN (${rooms.map(() => '?').join(',')})`;
      params.push(...rooms);
    }

    // FR-13: Filter by price range
    if (minPrice) {
      sql += ` AND p.price >= ?`;
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      sql += ` AND p.price <= ?`;
      params.push(Number(maxPrice));
    }

    // FR-14: Sorting
    switch (sort) {
      case 'price_asc':  sql += ` ORDER BY p.price ASC`; break;
      case 'price_desc': sql += ` ORDER BY p.price DESC`; break;
      case 'newest':     sql += ` ORDER BY p.created_at DESC`; break;
      case 'best':       sql += ` ORDER BY p.sold_count DESC`; break;
      default:           sql += ` ORDER BY p.created_at DESC`; break;
    }

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const [products] = await db.execute(sql, params);

    // Get total count (without LIMIT) for pagination
    let countSql = `SELECT COUNT(*) as total FROM products p LEFT JOIN inventory i ON p.id = i.product_id WHERE p.is_active = TRUE`;
    const countParams = [];

    if (search) {
      countSql += ` AND (p.name LIKE ? OR p.color LIKE ? OR p.material LIKE ? OR p.size LIKE ?)`;
      const s = `%${search}%`;
      countParams.push(s, s, s, s);
    }
    if (category) {
      const cats = category.split(',');
      countSql += ` AND p.category IN (${cats.map(() => '?').join(',')})`;
      countParams.push(...cats);
    }

    const [countResult] = await db.execute(countSql, countParams);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FR-15, FR-16: Product detail with images and specs
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.execute(
      `SELECT p.*, i.stock_qty, i.low_stock_threshold,
        CASE WHEN i.stock_qty = 0 THEN 'Out of Stock' WHEN i.stock_qty < i.low_stock_threshold THEN 'Low Stock' ELSE 'In Stock' END AS stock_status
       FROM products p LEFT JOIN inventory i ON p.id = i.product_id WHERE p.id = ?`,
      [req.params.id]
    );
    if (products.length === 0) return res.status(404).json({ error: 'Product not found.' });

    // Get additional images (FR-16)
    const [images] = await db.execute(
      'SELECT image_url, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [req.params.id]
    );

    // Get characteristics
    const [chars] = await db.execute(
      'SELECT attr_key, attr_value FROM characteristics WHERE product_id = ?',
      [req.params.id]
    );

    res.json({
      ...products[0],
      images: [products[0].image_url, ...images.map(i => i.image_url)],
      characteristics: chars
    });
  } catch (err) {
    console.error('Product detail error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get available filter options (for the sidebar)
router.get('/filters/options', async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT DISTINCT category FROM products WHERE is_active = TRUE ORDER BY category');
    const [materials] = await db.execute('SELECT DISTINCT material FROM products WHERE is_active = TRUE ORDER BY material');
    const [colors] = await db.execute('SELECT DISTINCT color FROM products WHERE is_active = TRUE ORDER BY color');
    const [sizes] = await db.execute('SELECT DISTINCT size FROM products WHERE is_active = TRUE ORDER BY size');
    const [rooms] = await db.execute('SELECT DISTINCT room_application FROM products WHERE is_active = TRUE AND room_application IS NOT NULL ORDER BY room_application');
    const [priceRange] = await db.execute('SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM products WHERE is_active = TRUE');

    res.json({
      categories: categories.map(c => c.category),
      materials: materials.map(m => m.material),
      colors: colors.map(c => c.color),
      sizes: sizes.map(s => s.size),
      rooms: rooms.map(r => r.room_application),
      priceRange: priceRange[0]
    });
  } catch (err) {
    console.error('Filter options error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
