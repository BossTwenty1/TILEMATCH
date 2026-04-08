const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({path: './server/.env'});

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
    
    const hash = await bcrypt.hash('admin123', 10);
    await conn.query('UPDATE customers SET password = ? WHERE role = ?', [hash, 'admin']);
    console.log('Successfully updated live admin password to: admin123');
    await conn.end();
  } catch (e) {
    console.error(e.message);
  }
}
fix();
