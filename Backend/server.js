const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Activate BullMQ background queue worker
require('./workers/csvWorker');

const app = express();
const ROOT_DIR = path.join(__dirname, '..');
app.set('ROOT_DIR', ROOT_DIR);

// Global Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Serve static frontend assets
app.use(express.static(path.join(ROOT_DIR, 'Frontend')));

// API Routes Registration
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Static HTML Page Fallbacks
app.get('/', (req, res) => res.sendFile(path.join(ROOT_DIR, 'Frontend/index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'Frontend/login.html')));
app.get('/register.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'Frontend/register.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'Frontend/dashboard.html')));
app.get('/categories.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'Frontend/categories.html')));
app.get('/subscriptions.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'Frontend/subscriptions.html')));

// 404 handler + central error handler (must be last)
const { notFoundMiddleware, errorMiddleware } = require('./middleware/errorMiddleware');
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SpenSight server running on port ${PORT}`);
});
