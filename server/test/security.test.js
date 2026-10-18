const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { tmpdir } = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

process.env.JWT_SECRET = randomBytes(32).toString('hex');
const { generateToken } = require('../middleware/auth');
const db = {};
const emails = [];
// Prevent any real database connection or outgoing mail, including at module load.
require.cache[require.resolve('../config/db')] = { exports: db };
require.cache[require.resolve('../services/emailService')] = {
  exports: { sendOrderConfirmation: async (order) => emails.push(order) }
};
const app = express();
app.use(express.json());
app.use('/orders', require('../routes/orders'));
let server;
let baseUrl;
const token = (id, role = 'customer') => generateToken({ id, role, email: 'fixture@example.invalid' });
const call = async (url, id, options = {}) => {
  const res = await fetch(baseUrl + url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(id ? { Authorization: `Bearer ${token(id)}` } : {}), ...options.headers }
  });
  return { status: res.status, body: await res.json() };
};

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});
beforeEach(() => {
  emails.length = 0;
  db.execute = async () => { throw new Error('Unexpected database query'); };
  db.getConnection = async () => { throw new Error('Unexpected database connection'); };
});

test('JWT configuration fails closed without leaking invalid values', () => {
  for (const value of [undefined, '', 'short-test-value', 'a'.repeat(64), 'unsafe-placeholder'.repeat(4)]) {
    const env = { ...process.env };
    if (value === undefined) delete env.JWT_SECRET;
    else env.JWT_SECRET = value;
    const result = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(require.resolve('../middleware/auth'))})`], {
      cwd: tmpdir(), env, encoding: 'utf8'
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /JWT_SECRET must be 32 random bytes/);
    if (value) assert.ok(!result.stderr.includes(value));
  }
  const valid = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(require.resolve('../middleware/auth'))})`], {
    cwd: tmpdir(), env: { ...process.env, JWT_SECRET: randomBytes(32).toString('hex') }, encoding: 'utf8'
  });
  assert.equal(valid.status, 0);
});

test('tracking rejects unauthenticated, invalid, and wrong-secret tokens before querying', async () => {
  assert.equal((await call('/orders/track/ORD-fixture')).status, 401);
  assert.equal((await call('/orders/track/ORD-fixture', null, { headers: { Authorization: 'Bearer invalid' } })).status, 401);
  const forged = require('jsonwebtoken').sign({ id: 1, role: 'admin' }, randomBytes(32).toString('hex'));
  assert.equal((await call('/orders/track/ORD-fixture', null, { headers: { Authorization: `Bearer ${forged}` } })).status, 401);
});

test('tracking returns only the owner order and hides foreign and nonexistent orders equally', async () => {
  let itemQueries = 0;
  db.execute = async (sql, params) => {
    if (sql.includes('FROM orders o')) {
      assert.match(sql, /o\.order_number = \? AND o\.customer_id = \?/);
      return [params[0] === 'ORD-fixture' && params[1] === 1 ? [{ id: 7, customer_id: 1, ship_street: 'Fixture Street' }] : []];
    }
    assert.deepEqual(params, [7]);
    itemQueries++;
    return [[{ product_name: 'Fixture tile', quantity: 2 }]];
  };
  const owner = await call('/orders/track/ORD-fixture', 1);
  assert.equal(owner.status, 200);
  assert.equal(owner.body.items[0].product_name, 'Fixture tile');
  const foreign = await call('/orders/track/ORD-fixture', 2);
  const absent = await call('/orders/track/ORD-absent', 2);
  assert.deepEqual(foreign, absent);
  assert.equal(foreign.status, 404);
  // Admin access to other customers remains on the separately authorized admin routes.
  assert.equal((await call('/orders/track/ORD-fixture', null, { headers: { Authorization: `Bearer ${token(2, 'admin')}` } })).status, 404);
  assert.equal(itemQueries, 1);
});

test('checkout generates distinct UUID orders at the same time and ignores supplied payment references', async () => {
  const orders = [];
  const payments = [];
  const calls = [];
  const conn = {
    beginTransaction: async () => calls.push('begin'),
    commit: async () => calls.push('commit'),
    rollback: async () => calls.push('rollback'),
    release: () => calls.push('release'),
    execute: async (sql, params) => {
      if (sql.includes('SELECT id FROM cart')) return [[{ id: 5 }]];
      if (sql.includes('FROM cart_items ci')) return [[{ product_id: 3, quantity: 2, name: 'Fixture tile', price: 100, category: 'Ceramic', stock_qty: 10 }]];
      if (sql.includes('SELECT first_name')) return [[{ first_name: 'Test', last_name: 'Customer', email: 'fixture@example.invalid' }]];
      if (sql.includes('INSERT INTO orders')) { orders.push(params); return [{ insertId: orders.length }]; }
      if (sql.includes('INSERT INTO payments')) payments.push(params);
      return [{}];
    }
  };
  db.getConnection = async () => conn;
  const now = Date.now;
  Date.now = () => 1700000000000;
  try {
    for (let i = 0; i < 20; i++) {
      const result = await call('/orders/place', 1, {
        method: 'POST', body: JSON.stringify({ municipality: 'Test', barangay: 'Test', street: 'Fixture Street', postalCode: '0000', paymentRef: 'REAL-REF-MUST-BE-IGNORED', productIds: [3] })
      });
      assert.equal(result.status, 201);
      assert.equal(result.body.paymentMode, 'simulation');
      assert.match(result.body.order.orderNumber, /^ORD-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      assert.match(result.body.order.gcashRef, /^DEMO-[0-9a-f]{14}$/);
    }
  } finally { Date.now = now; }
  assert.equal(new Set(orders.map((p) => p[0])).size, 20);
  assert.ok(orders.every((p) => p[0].length === 40 && p[1] === 1));
  assert.ok(payments.every((p) => p[1] === 'GCash' && p[2].startsWith('DEMO-') && p[2].length <= 20 && p[4] === 'Pending'));
  assert.equal(emails.length, 20);
  assert.ok(emails.every((o) => o.payment_ref.startsWith('DEMO-')));
  assert.equal(calls.filter((c) => c === 'commit').length, 20);
  assert.equal(calls.filter((c) => c === 'release').length, 20);
  assert.ok(!calls.includes('rollback'));
});

test('unsafe reset scripts and QR asset are absent; schema retains unique order numbers', () => {
  for (const file of ['update_admin.js', 'server/update_admin.js', 'server/scripts/hashPasswords.js', 'client/public/gcash-qr.png']) {
    assert.equal(fs.existsSync(path.resolve(__dirname, '../..', file)), false);
  }
  const seed = fs.readFileSync(path.resolve(__dirname, '../../database/tilematch_seed.sql'), 'utf8');
  assert.match(seed, /^\(6,\s*'[^']+',\s*'!'/m);
  const schema = fs.readFileSync(path.resolve(__dirname, '../../database/tilematch_schema.sql'), 'utf8');
  assert.match(schema, /order_number\s+VARCHAR\(40\) NOT NULL UNIQUE/);
  const migration = fs.readFileSync(path.resolve(__dirname, '../../database/migrations/20261018_order_number_uuid.sql'), 'utf8');
  assert.match(migration, /ALTER TABLE orders MODIFY COLUMN order_number VARCHAR\(40\) NOT NULL;/);
  assert.doesNotMatch(migration, /\b(?:DELETE|DROP|TRUNCATE)\b/i);
});
