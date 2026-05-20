const request = require('supertest');
const app = require('../../server/server');
const db = require('../../server/config/db');

describe('🛡️ Administrator Operations & Security API Endpoints', () => {
  let adminToken;
  let adminId;
  let customerToken;
  let customerId;
  let testProductId;

  const testAdmin = {
    email: 'adminjest@example.com',
    password: 'secureadminpassword123',
    firstName: 'Admin',
    lastName: 'TestUser'
  };

  const testCustomer = {
    email: 'standardjest@example.com',
    password: 'securecustomerpassword123',
    firstName: 'Standard',
    lastName: 'Customer'
  };

  beforeAll(async () => {
    try {
      // 1. Clean up potential leftover test data
      await db.execute('DELETE FROM customers WHERE email IN (?, ?)', [testAdmin.email, testCustomer.email]);

      // 2. Register standard customer
      const custRes = await request(app)
        .post('/api/auth/register')
        .send(testCustomer);
      customerToken = custRes.body.token;
      customerId = custRes.body.user.id;

      // 3. Register admin customer (starts as customer role, then promoted in DB)
      const adminRes = await request(app)
        .post('/api/auth/register')
        .send(testAdmin);
      adminId = adminRes.body.user.id;

      // Promote test user to admin in DB (bypasses regular registration rule)
      await db.execute("UPDATE customers SET role = 'admin' WHERE id = ?", [adminId]);

      // Log in again to get fresh JWT containing the 'admin' role claims
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password
        });
      adminToken = loginRes.body.token;
    } catch (err) {
      console.error('Setup failed for admin integration test:', err.message);
    }
  });

  afterAll(async () => {
    try {
      // Clean up test products
      if (testProductId) {
        await db.execute('DELETE FROM inventory WHERE product_id = ?', [testProductId]);
        await db.execute('DELETE FROM products WHERE id = ?', [testProductId]);
      }
      // Clean up users
      await db.execute('DELETE FROM customers WHERE email IN (?, ?)', [testAdmin.email, testCustomer.email]);
    } finally {
      await db.end();
    }
  });

  describe('🚫 Role-Based Access Control (Security Audits)', () => {
    it('should block non-admin customers from fetching administrative dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'Access denied. Admin only.');
    });

    it('should block non-admin customers from modifying inventory levels', async () => {
      const res = await request(app)
        .put('/api/admin/inventory/1')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ stockQty: 50 });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'Access denied. Admin only.');
    });
  });

  describe('📊 Dashboard & Analytics API Endpoints', () => {
    it('should retrieve overall dashboard summary card numbers when requested by authorized admin', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stats');
      expect(res.body.stats).toHaveProperty('totalRevenue');
      expect(res.body.stats).toHaveProperty('totalOrders');
      expect(res.body.stats).toHaveProperty('totalCustomers');
      expect(res.body.stats).toHaveProperty('lowStockItems');
      expect(res.body).toHaveProperty('recentOrders');
      expect(Array.isArray(res.body.recentOrders)).toBe(true);
    });

    it('should retrieve bestsellers chart stats successfully for analytics overview', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/bestsellers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('🛠️ Product Inventory Management (CRUD Endpoints)', () => {
    const dummyProduct = {
      name: 'Automated QA Ceramic Tile',
      description: 'Super premium tile built via automated software tests.',
      category: 'Ceramic',
      material: 'Ceramic',
      color: 'White',
      size: '60x60',
      roomApplication: 'Bathroom',
      price: 349.50,
      stock: 45,
      imageUrl: 'https://placehold.co/400x400/e8e0d5/555555?text=QA+Ceramic+Tile',
      isActive: true
    };

    it('should successfully create a new product and initialize stock inventory records', async () => {
      const res = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dummyProduct);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Product added.');
      expect(res.body).toHaveProperty('productId');
      testProductId = res.body.productId;

      // Verify insertion in database
      const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [testProductId]);
      expect(rows.length).toBe(1);
      expect(Number(rows[0].price)).toBe(dummyProduct.price);

      // Verify inventory was initialized
      const [inv] = await db.execute('SELECT * FROM inventory WHERE product_id = ?', [testProductId]);
      expect(inv.length).toBe(1);
      expect(inv[0].stock_qty).toBe(dummyProduct.stock);
    });

    it('should reject product creation if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Malformed product without a name or category'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Name, category, material, color, size, and price are required.');
    });

    it('should successfully update product configurations and stock amounts', async () => {
      if (!testProductId) return;

      const updatedPrice = 399.99;
      const updatedStock = 75;

      const res = await request(app)
        .put(`/api/admin/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...dummyProduct,
          price: updatedPrice,
          stock: updatedStock
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Product updated.');

      // Asserts fields are changed
      const [rows] = await db.execute('SELECT price FROM products WHERE id = ?', [testProductId]);
      expect(Number(rows[0].price)).toBe(updatedPrice);

      const [inv] = await db.execute('SELECT stock_qty FROM inventory WHERE product_id = ?', [testProductId]);
      expect(inv[0].stock_qty).toBe(updatedStock);
    });

    it('should successfully delete products and cascade delete inventories', async () => {
      if (!testProductId) return;

      const res = await request(app)
        .delete(`/api/admin/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Product deleted.');

      // Ensure removal from databases
      const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [testProductId]);
      expect(rows.length).toBe(0);

      const [inv] = await db.execute('SELECT * FROM inventory WHERE product_id = ?', [testProductId]);
      expect(inv.length).toBe(0);

      testProductId = null; // Clear tracking variable so tear-down afterAll passes
    });
  });
});
