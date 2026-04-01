const db = require('../config/db');

async function check() {
  try {
    const [products] = await db.execute('SELECT COUNT(*) as c FROM products');
    const [activeProducts] = await db.execute('SELECT COUNT(*) as c FROM products WHERE is_active = TRUE');
    console.log('Total products:', products[0].c);
    console.log('Active products:', activeProducts[0].c);

    const [firstFew] = await db.execute('SELECT id, name, is_active FROM products LIMIT 5');
    console.log('First 5:', firstFew);

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
