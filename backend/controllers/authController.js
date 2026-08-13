const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, password, monthly_income } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      'INSERT INTO users (name, email, password_hash, monthly_income) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name || 'User', email, password_hash, parseFloat(monthly_income) || 0.00]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, email: newUser.rows[0].email },
      process.env.JWT_SECRET || 'super_secret_jwt_key_hackathon_2026',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('Registration Error Details:', error);
    return res.status(500).json({ error: error.message || 'Registration failed.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'super_secret_jwt_key_hackathon_2026',
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login Error Details:', error);
    return res.status(500).json({ error: 'Login failed.' });
  }
};

module.exports = {
  register,
  login
};