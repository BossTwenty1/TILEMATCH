const mysql = require('mysql2/promise');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tilematch_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

// Check if we requested SSL connection or if it is Aiven
if (process.env.DB_SSL === 'true') {
  try {
    dbConfig.ssl = {
      ca: fs.readFileSync(path.join(__dirname, 'ca.pem'))
    };
  } catch(e) {
    console.error('Could not load CA certificate for SSL connection:', e);
  }
}

const pool = mysql.createPool(dbConfig);

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected to', process.env.DB_NAME || 'tilematch_db');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
  });

module.exports = pool;
