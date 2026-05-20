const request = require('supertest');
const app = require('../../server/server');
const db = require('../../server/config/db');

describe('🔑 Authentication & Session API Endpoints', () => {
  const testUser = {
    email: 'testcustomer@example.com',
    password: 'securepassword123',
    firstName: 'Test',
    lastName: 'Customer',
    phone: '09123456789',
    municipality: 'Sample Municipality',
    city: 'Sample City',
    barangay: 'Sample Barangay',
    street: '123 Test Street',
    postalCode: '1000'
  };

  // Clean up any existing test user before starting
  beforeAll(async () => {
    try {
      // Delete any residual orders or items from prior runs
      await db.execute('DELETE FROM customers WHERE email = ?', [testUser.email]);
    } catch (err) {
      console.warn('Pre-test cleanup warning (safe to ignore if database not seeded yet):', err.message);
    }
  });

  // Clean up test user after finishing
  afterAll(async () => {
    try {
      await db.execute('DELETE FROM customers WHERE email = ?', [testUser.email]);
    } finally {
      // Close the database pool so Jest exits gracefully
      await db.end();
    }
  });

  describe('📥 POST /api/auth/register', () => {
    it('should successfully register a new customer and automatically provision a cart', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('message', 'Registration successful.');
      expect(res.body.user).toMatchObject({
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: 'customer'
      });

      // Verify customer is in DB
      const [rows] = await db.execute('SELECT id FROM customers WHERE email = ?', [testUser.email]);
      expect(rows.length).toBe(1);
      
      // Verify associated cart is provisioned (FR-26)
      const [carts] = await db.execute('SELECT id FROM cart WHERE customer_id = ?', [rows[0].id]);
      expect(carts.length).toBe(1);
    });

    it('should reject registration if email format is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid email format.');
    });

    it('should reject registration if email is a duplicate', async () => {
      // Attempting to register the same email again
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error', 'Email already registered.');
    });

    it('should reject registration if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'anotheruser@example.com',
          password: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Password must be at least 6 characters.');
    });
  });

  describe('🔐 POST /api/auth/login', () => {
    it('should successfully log in and return a valid JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('message', 'Login successful.');
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('should reject login for non-existent users', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somepassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid email or password.');
    });

    it('should reject login for incorrect passwords', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid email or password.');
    });
  });

  describe('👤 GET /api/auth/profile (Session Verification)', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      token = res.body.token;
    });

    it('should retrieve profile details when authenticated with Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: 'customer'
      });
    });

    it('should reject access to profile when no token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Access denied. No token provided.');
    });

    it('should reject profile details if token is invalid or corrupted', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-and-fake-token');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid or expired token.');
    });
  });
});
