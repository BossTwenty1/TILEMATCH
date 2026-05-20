const { test, expect } = require('@playwright/test');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

test.describe('🛡️ TileMatch E-Commerce Admin E2E Flow', () => {
  const adminEmail = 'admin_e2e@example.com';
  const adminPassword = 'secureadminpassword123';
  let dbPool;
  let adminUserId = null;

  test.beforeAll(async () => {
    // 1. Establish direct database pool connection to seed E2E admin credentials
    dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'tilematch_db',
      multipleStatements: true
    });

    try {
      // 2. Clean up residual E2E admin
      await dbPool.execute('DELETE FROM customers WHERE email = ?', [adminEmail]);

      // 3. Hash password and insert the administrator user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const [res] = await dbPool.execute(
        `INSERT INTO customers (email, password, first_name, last_name, phone, role, is_verified)
         VALUES (?, ?, 'E2E', 'Admin', '09170000000', 'admin', TRUE)`,
        [adminEmail, hashedPassword]
      );
      adminUserId = res.insertId;
    } catch (err) {
      console.error('E2E Admin DB seeding setup failed:', err.message);
    }
  });

  test.afterAll(async () => {
    try {
      // Clean up E2E admin and products created during E2E test runs
      if (adminUserId) {
        await dbPool.execute('DELETE FROM customers WHERE id = ?', [adminUserId]);
      }
      await dbPool.execute("DELETE FROM products WHERE name = 'E2E Test Porcelain Tile'");
    } catch (err) {
      console.warn('E2E Cleanup warning:', err.message);
    } finally {
      if (dbPool) await dbPool.end();
    }
  });

  test('should successfully log in as admin, create a product, inspect inventory, and view analytics charts', async ({ page }) => {
    // 1. Go to Account login page
    await page.goto('/account');
    
    // Fill in admin credentials
    await page.fill('input[name="loginEmail"]', adminEmail);
    await page.fill('input[name="loginPassword"]', adminPassword);
    
    // Click login submit
    await page.click('.auth-card form button[type="submit"]');

    // Wait for authentication toast or session change
    await page.waitForTimeout(1000);

    // 2. Navigate directly to Admin dashboard
    await page.goto('/admin');
    await page.waitForSelector('.admin-page');

    // Confirm that statistics card numbers are loaded
    await expect(page.locator('.stats-grid')).toBeVisible();
    await expect(page.locator('.stat-card:has-text("Total Revenue")')).toBeVisible();

    // 3. Navigate to Products tab and add a product
    await page.click('button.admin-tab:has-text("Products")');
    await page.waitForSelector('button:has-text("Add Product")');

    // Trigger modal overlay
    await page.click('button:has-text("Add Product")');
    await page.waitForSelector('.modal-overlay');

    // Fill in product data details using adjacent label selector strategy
    await page.locator('label:has-text("Name *") + input').fill('E2E Test Porcelain Tile');
    await page.locator('label:has-text("Category *") + select').selectOption('Porcelain');
    await page.locator('label:has-text("Material *") + input').fill('Porcelain Clay');
    await page.locator('label:has-text("Color *") + input').fill('Polished Beige');
    await page.locator('label:has-text("Size *") + select').selectOption('60x60');
    await page.locator('label:has-text("Room") + select').selectOption('Floor');
    await page.locator('label:has-text("Price (PHP) *") + input').fill('499.50');
    await page.locator('label:has-text("Stock *") + input').fill('120');
    await page.locator('textarea.input').fill('E2E Automated test description of high gloss polished porcelain tiles.');

    // Save product
    await page.click('.modal-footer button.btn-primary');

    // Verify insertion toast or modal exit
    await page.waitForSelector('.modal-overlay', { state: 'detached' });

    // Assert product exists in list
    await expect(page.locator('tr:has-text("E2E Test Porcelain Tile")')).toBeVisible();

    // 4. Navigate to Inventory tab and check stock level
    await page.click('button.admin-tab:has-text("Inventory")');
    await page.waitForSelector('tr:has-text("E2E Test Porcelain Tile")');
    
    // Check if stock quantity value matches what we registered
    const stockInput = page.locator('tr:has-text("E2E Test Porcelain Tile") input[type="number"]');
    await expect(stockInput).toHaveValue('120');

    // 5. Navigate to Analytics charts tab
    await page.click('button.admin-tab:has-text("Analytics")');
    
    // Verify chart containers are visible
    const charts = page.locator('.recharts-responsive-container');
    await expect(charts.first()).toBeVisible();
  });
});
