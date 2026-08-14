const pool = require('../config/db');

async function verifyDatabaseTables() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('--- SpenSight PostgreSQL Schema Integrity ---');
    console.log(`Active tables found: ${res.rows.length}`);
    res.rows.forEach((r, idx) => console.log(`  ${idx + 1}. ${r.table_name}`));
    process.exit(0);
  } catch (err) {
    console.error('Database connection verification failed:', err.message);
    process.exit(1);
  }
}

verifyDatabaseTables();