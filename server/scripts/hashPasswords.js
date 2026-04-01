/**
 * Run this once to hash the placeholder passwords in the seed data.
 * Usage: node scripts/hashPasswords.js
 */
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function hashPasswords() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tilematch_db'
  });

  const passwords = {
    'juan@email.com': 'password123',
    'maria@email.com': 'password123',
    'pedro@email.com': 'password123',
    'ana@email.com': 'password123',
    'carlos@email.com': 'password123',
    'admin@tilematch.com': 'admin123'
  };

  for (const [email, plaintext] of Object.entries(passwords)) {
    const hashed = await bcrypt.hash(plaintext, 10);
    await pool.execute('UPDATE customers SET password = ? WHERE email = ?', [hashed, email]);
    console.log(`✅ Hashed password for ${email}`);
  }

  console.log('\n🔒 All passwords hashed successfully!');
  await pool.end();
}

hashPasswords().catch(console.error);
