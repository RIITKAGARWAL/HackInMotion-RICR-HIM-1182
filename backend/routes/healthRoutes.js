const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const authMiddleware = require('../middleware/authMiddleware');

// Simple unauthenticated liveness probe (Docker healthcheck)
router.get('/status', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Authenticated health score
router.get('/score', authMiddleware, healthController.getHealthScore);

module.exports = router;
