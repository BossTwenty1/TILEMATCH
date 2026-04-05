const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function importProducts() {
  try {
    const filePath = path.join(__dirname, '../data/products_backup.json');
    if (!fs.existsSync(filePath)) {
      console.error('❌ Backup file not found at', filePath);
      console.log('Ask the team member who added the products to run "npm run db:export" and push the result to GitHub.');
      process.exit(1);
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const { products, inventory } = JSON.parse(rawData);

    if (!products || !inventory) {
      throw new Error('Invalid JSON format');
    }

    // Disable foreign key checks to avoid errors during truncate
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clear existing local data
    await db.execute('TRUNCATE TABLE inventory');
    await db.execute('TRUNCATE TABLE products');
    
    // Insert Products
    for (const p of products) {
      const createdAt = new Date(p.created_at).toISOString().slice(0, 19).replace('T', ' ');
      
      await db.execute(
        `INSERT INTO products (id, name, description, category, material, color, size, room_application, price, image_url, is_active, sold_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.description, p.category, p.material, p.color, p.size, p.room_application, p.price, p.image_url, p.is_active, p.sold_count, createdAt]
      );
    }

    // Insert Inventory
    for (const inv of inventory) {
      const lastUpdated = new Date(inv.last_updated).toISOString().slice(0, 19).replace('T', ' ');
      await db.execute(
        `INSERT INTO inventory (id, product_id, stock_qty, low_stock_threshold, last_updated)
         VALUES (?, ?, ?, ?, ?)`,
        [inv.id, inv.product_id, inv.stock_qty, inv.low_stock_threshold, lastUpdated]
      );
    }

    // Re-enable foreign key checks
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log(`✅ Successfully imported ${products.length} products to your local database!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing products:', error.message);
    // Be absolutely sure to turn foreign keys back on if it fails
    try { await db.execute('SET FOREIGN_KEY_CHECKS = 1'); } catch (e) {}
    process.exit(1);
  }
}

importProducts();
