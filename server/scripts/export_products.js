const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function exportProducts() {
  try {
    const [products] = await db.execute('SELECT * FROM products');
    const [inventory] = await db.execute('SELECT * FROM inventory');

    const data = {
      products,
      inventory
    };

    const filePath = path.join(__dirname, '../data/products_backup.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`✅ Successfully exported ${products.length} products to ${filePath}`);
    console.log(`Make sure to commit the server/data/products_backup.json file to GitHub!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting products:', error.message);
    process.exit(1);
  }
}

exportProducts();
