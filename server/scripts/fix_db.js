const db = require('../config/db');

async function debugDB() {
  try {
    console.log('Testing DB connection...');
    await db.execute('SELECT 1');
    console.log('Connection OK.');

    console.log('Altering products table to LONGTEXT...');
    await db.execute('ALTER TABLE products MODIFY image_url LONGTEXT');
    console.log('Altering product_images table to LONGTEXT...');
    await db.execute('ALTER TABLE product_images MODIFY image_url LONGTEXT');
    
    console.log('Running test query to check size limits...');
    // Create a dummy string of 5MB
    // Depending on max_allowed_packet, this might fail!
    const dummy = 'a'.repeat(5 * 1024 * 1024); 
    try {
      await db.execute('SELECT ? as test', [dummy]);
      console.log('5MB query OK.');
    } catch(e) {
      console.error('5MB query failed:', e.message);
    }

    console.log('Done.');
    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
debugDB();
