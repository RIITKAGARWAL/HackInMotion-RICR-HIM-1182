const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initDatabase() {
  try {
    console.log('Resetting database schema using schema.sql...');
    const schemaPath = path.join(__dirname, '../schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await db.pool.query(sql);
    console.log('✓ Database schema recreated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database schema:', error);
    process.exit(1);
  }
}

initDatabase();