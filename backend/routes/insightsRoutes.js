const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insightsController');
const authMiddleware = require('../middleware/authMiddleware');

// Insights endpoints: ?month_year=YYYY-MM (defaults to current month)
router.get('/overview', authMiddleware, insightsController.getOverview);

module.exports = router;
