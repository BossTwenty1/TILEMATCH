const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function initAiven() {
  try {
    const schemaPath = path.join(__dirname, '../../database/tilematch_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running schema on Aiven...');
    await db.query(schemaSql);
    console.log('Schema successfully imported.');

    // We also need to fix the LONGTEXT issue for Aiven, since the schema might have VARCHAR
    console.log('Applying LONGTEXT fixes for images...');
    await db.query('ALTER TABLE products MODIFY image_url LONGTEXT');
    // Ignore error if product_images doesn't exist
    try {
      await db.query('ALTER TABLE product_images MODIFY image_url LONGTEXT');
    } catch(e) {}
    
    console.log('Aiven database initialized successfully!');
    process.exit(0);
  } catch(e) {
    console.error('Error initializing Aiven:', e);
    process.exit(1);
  }
}

initAiven();
