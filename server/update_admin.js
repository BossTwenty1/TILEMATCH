const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({path: './.env'});

async function fix() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST, 
      port: process.env.DB_PORT, 
      user: process.env.DB_USER, 
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_NAME, 
      ssl: {rejectUnauthorized: false}
    });

    const admins = [
      { email: 'admin1@tilematch.com', pass: 'admin123', first: 'Admin', last: 'One', phone: '09170000001' },
      { email: 'admin2@tilematch.com', pass: 'admin123', first: 'Admin', last: 'Two', phone: '09170000002' },
      { email: 'admin3@tilematch.com', pass: 'admin123', first: 'Admin', last: 'Three', phone: '09170000003' }
    ];

    for (const admin of admins) {
      const hash = await bcrypt.hash(admin.pass, 10);
      const [rows] = await conn.query('SELECT id FROM customers WHERE email = ?', [admin.email]);
      
      if (rows.length === 0) {
        await conn.query(
          "INSERT INTO customers (email, password, first_name, last_name, phone, role, is_verified) VALUES (?, ?, ?, ?, ?, 'admin', TRUE)", 
          [admin.email, hash, admin.first, admin.last, admin.phone]
        );
        console.log(`Successfully inserted live admin account: ${admin.email}`);
      } else {
        await conn.query('UPDATE customers SET password = ? WHERE email = ?', [hash, admin.email]);
        console.log(`Successfully updated live admin password: ${admin.email}`);
      }
    }
    
    await conn.end();
  } catch (e) {
    console.error(e.message);
  }
}
fix();
