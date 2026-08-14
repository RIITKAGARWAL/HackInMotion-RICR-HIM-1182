const { Pool } = require('pg');

// Local Postgres (pgAdmin, localhost:5432) fallbacks. Docker compose
// overrides these via env vars (DB_HOST=postgres, DB_PASSWORD=secret,
// DB_NAME=financial_dashboard), so the container still resolves correctly.
const dbPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'spensight_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Suraj@97',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

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
