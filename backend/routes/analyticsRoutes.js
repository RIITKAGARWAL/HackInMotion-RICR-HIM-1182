const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Range-aware analytics endpoints: ?range=daily|weekly|monthly|yearly&month_year=YYYY-MM
router.get('/summary', authMiddleware, analyticsController.getSummary);
router.get('/breakdown', authMiddleware, analyticsController.getBreakdown);
router.get('/trends', authMiddleware, analyticsController.getTrends);
router.get('/cashflow', authMiddleware, analyticsController.getCashFlow);

module.exports = router;
