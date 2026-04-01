const db = require('../config/db');

async function testInsert() {
  try {
    const dummyLargeImage = 'data:image/jpeg;base64,' + 'a'.repeat(3000000); // 3MB base64 string
    const [result] = await db.execute(
      `INSERT INTO products (name, description, category, material, color, size, room_application, price, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Test Product', 'Large String Test', 'Ceramic', 'Test', 'Red', '30x30', 'Floor', 100, dummyLargeImage, true]
    );
    console.log('Insert succeeded with ID:', result.insertId);
    
    await db.execute('DELETE FROM products WHERE id = ?', [result.insertId]);
    console.log('Cleanup done.');
    
    process.exit(0);
  } catch(e) {
    console.error('Insert failed:', e.message);
    process.exit(1);
  }
}
testInsert();
