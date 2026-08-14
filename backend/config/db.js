const { Pool } = require('pg');

// Determine connection strategy:
// If DATABASE_URL is available (Render/Neon), use connectionString with SSL.
// Otherwise, fall back to individual env vars or localhost defaults (Docker/Dev).
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for Neon PostgreSQL on Render
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'spensight_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Suraj@97',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const dbPool = new Pool(poolConfig);

dbPool.on('connect', () => {
  console.log('Connected to PostgreSQL Database');
});

dbPool.on('error', (err) => {
  console.error('PostgreSQL Connection Pool Error:', err);
});

module.exports = {
  query: (text, params) => dbPool.query(text, params),
  pool: dbPool,
};