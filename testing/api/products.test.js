const request = require('supertest');
const app = require('../../server/server');
const db = require('../../server/config/db');

describe('📦 Product Catalog API Endpoints', () => {
  let sampleProduct = null;

  beforeAll(async () => {
    // Dynamically retrieve an active product from the database to use in our detail queries
    try {
      const [rows] = await db.execute('SELECT * FROM products WHERE is_active = TRUE LIMIT 1');
      if (rows.length > 0) {
        sampleProduct = rows[0];
      }
    } catch (err) {
      console.warn('Could not load sample product for test dependency:', err.message);
    }
  });

  afterAll(async () => {
    // Close connection pool
    await db.end();
  });

  describe('🔍 GET /api/products', () => {
    it('should successfully retrieve active products list with pagination metadata', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toMatchObject({
        page: 1,
        limit: 20
      });
      expect(res.body.pagination).toHaveProperty('total');
    });

    it('should correctly filter products by category', async () => {
      if (!sampleProduct) return; // Skip if no products seeded

      const res = await request(app)
        .get('/api/products')
        .query({ category: sampleProduct.category });

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBeGreaterThan(0);
      res.body.products.forEach(p => {
        expect(p.category).toBe(sampleProduct.category);
      });
    });

    it('should correctly perform keyword searches on name, color, or material', async () => {
      if (!sampleProduct) return;

      const res = await request(app)
        .get('/api/products')
        .query({ search: sampleProduct.color });

      expect(res.status).toBe(200);
      // Each matched product should have the color or some metadata containing the searched key
      res.body.products.forEach(p => {
        const matches = 
          p.name.toLowerCase().includes(sampleProduct.color.toLowerCase()) ||
          p.color.toLowerCase().includes(sampleProduct.color.toLowerCase()) ||
          p.material.toLowerCase().includes(sampleProduct.color.toLowerCase());
        expect(matches).toBe(true);
      });
    });

    it('should correctly filter products by price range', async () => {
      const minPrice = 100;
      const maxPrice = 1000;

      const res = await request(app)
        .get('/api/products')
        .query({ minPrice, maxPrice });

      expect(res.status).toBe(200);
      res.body.products.forEach(p => {
        const price = Number(p.price);
        expect(price).toBeGreaterThanOrEqual(minPrice);
        expect(price).toBeLessThanOrEqual(maxPrice);
      });
    });

    it('should sort products by price ascending order', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ sort: 'price_asc' });

      expect(res.status).toBe(200);
      const prices = res.body.products.map(p => Number(p.price));
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    it('should sort products by price descending order', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ sort: 'price_desc' });

      expect(res.status).toBe(200);
      const prices = res.body.products.map(p => Number(p.price));
      const sortedPrices = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sortedPrices);
    });
  });

  describe('🏷️ GET /api/products/filters/options', () => {
    it('should retrieve distinct list of filter options for client navigation', async () => {
      const res = await request(app).get('/api/products/filters/options');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('categories');
      expect(res.body).toHaveProperty('materials');
      expect(res.body).toHaveProperty('colors');
      expect(res.body).toHaveProperty('sizes');
      expect(res.body).toHaveProperty('rooms');
      expect(res.body).toHaveProperty('priceRange');
      expect(res.body.priceRange).toHaveProperty('minPrice');
      expect(res.body.priceRange).toHaveProperty('maxPrice');
    });
  });

  describe('🔍 GET /api/products/:id', () => {
    it('should retrieve individual product details including dynamic specs', async () => {
      if (!sampleProduct) return;

      const res = await request(app).get(`/api/products/${sampleProduct.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: sampleProduct.id,
        name: sampleProduct.name,
        category: sampleProduct.category,
        material: sampleProduct.material
      });
      expect(res.body).toHaveProperty('images');
      expect(res.body).toHaveProperty('characteristics');
      expect(Array.isArray(res.body.images)).toBe(true);
      expect(Array.isArray(res.body.characteristics)).toBe(true);
    });

    it('should return 404 for products that do not exist', async () => {
      const res = await request(app).get('/api/products/9999999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Product not found.');
    });
  });
});
