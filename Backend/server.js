const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client:', err.stack);
  }
  console.log('Connected to PostgreSQL Database (spensight_db)');
  release();
});

// Test Health Check Route
app.get('/', (req, res) => {
  res.send('SpenSight API Server is Running');
});

// Fetch Categories Route
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await pool.query('SELECT id, name, type, icon FROM categories ORDER BY name ASC');
    res.status(200).json(categories.rows);
  } catch (err) {
    console.error('Categories Error:', err);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// Start Active Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SpenSight Backend API online at http://localhost:${PORT}`);
});