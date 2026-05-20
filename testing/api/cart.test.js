const request = require('supertest');
const app = require('../../server/server');
const db = require('../../server/config/db');

describe('🛒 Cart CRUD & Recalculation API Endpoints', () => {
  let customerToken;
  let customerId;
  let activeProduct;
  
  const testCustomer = {
    email: 'carttest@example.com',
    password: 'securepassword123',
    firstName: 'Cart',
    lastName: 'TestUser'
  };

  beforeAll(async () => {
    try {
      // 1. Clean up potential leftover user
      await db.execute('DELETE FROM customers WHERE email = ?', [testCustomer.email]);

      // 2. Register test user
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(testCustomer);
      
      customerToken = registerRes.body.token;
      customerId = registerRes.body.user.id;

      // 3. Find a product that has active inventory to test cart addition
      const [products] = await db.execute(
        `SELECT p.id, p.name, p.price, i.stock_qty 
         FROM products p 
         JOIN inventory i ON p.id = i.product_id 
         WHERE p.is_active = TRUE AND i.stock_qty > 5 
         LIMIT 1`
      );
      if (products.length > 0) {
        activeProduct = products[0];
      }
    } catch (err) {
      console.error('Setup failed for cart integration test:', err.message);
    }
  });

  afterAll(async () => {
    try {
      // Clean up test user (will cascade delete cart items and cart itself)
      if (customerId) {
        await db.execute('DELETE FROM customers WHERE id = ?', [customerId]);
      }
    } finally {
      await db.end();
    }
  });

  describe('🛒 Cart Lifecycle Operations', () => {
    it('should retrieve cart details successfully for authenticated user (should be empty initially)', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body.items.length).toBe(0);
      expect(res.body).toMatchObject({
        itemCount: 0,
        subtotal: 0,
        shippingFee: 200, // Under 2000 has 200 shipping fee
        tax: 0,
        total: 200
      });
    });

    it('should successfully add an active stocked item to the cart', async () => {
      if (!activeProduct) return;

      const res = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: activeProduct.id,
          quantity: 2
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', `${activeProduct.name} added to cart.`);

      // Verify item count in cart increased
      const cartRes = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);
      
      expect(cartRes.body.items.length).toBe(1);
      expect(cartRes.body.itemCount).toBe(2);
      expect(Number(cartRes.body.subtotal)).toBe(Number(activeProduct.price) * 2);
    });

    it('should block adding out of stock items or exceeding inventory bounds', async () => {
      if (!activeProduct) return;

      const res = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: activeProduct.id,
          quantity: activeProduct.stock_qty + 10 // Exceeds stock
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should successfully update item quantities and correctly recalculate subtotal, 12% VAT, and shipping exemptions', async () => {
      if (!activeProduct) return;

      const newQty = 3;
      const res = await request(app)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: activeProduct.id,
          quantity: newQty
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Cart updated.');

      // Check calculations
      const cartRes = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      const subtotal = Number(activeProduct.price) * newQty;
      const shippingFee = subtotal >= 2000 ? 0 : 200;
      const expectedTax = Math.round(subtotal * 0.12 * 100) / 100;
      const expectedTotal = Math.round((subtotal + shippingFee + expectedTax) * 100) / 100;

      expect(cartRes.body.items[0].quantity).toBe(newQty);
      expect(Number(cartRes.body.subtotal)).toBe(subtotal);
      expect(cartRes.body.shippingFee).toBe(shippingFee);
      expect(Number(cartRes.body.tax)).toBe(expectedTax);
      expect(Number(cartRes.body.total)).toBe(expectedTotal);
    });

    it('should successfully remove the item from the cart', async () => {
      if (!activeProduct) return;

      const res = await request(app)
        .delete(`/api/cart/remove/${activeProduct.id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Item removed from cart.');

      // Verify cart is empty again
      const cartRes = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);
      
      expect(cartRes.body.items.length).toBe(0);
      expect(cartRes.body.itemCount).toBe(0);
      expect(cartRes.body.total).toBe(200);
    });
  });
});
