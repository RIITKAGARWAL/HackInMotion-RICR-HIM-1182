const db = require('../config/db');
const aiEngine = require('../services/aiEngine');

const getHealthScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const monthYear = req.query.month_year || new Date().toISOString().substring(0, 7);

    const healthSummary = await aiEngine.calculateHealthScore(userId, monthYear);

    return res.json({
      health_summary: {
        health_score: healthSummary.health_score,
        savings_rate: healthSummary.savings_rate,
        overall_status: healthSummary.overall_status
      }
    });
  } catch (error) {
    console.error('Get Health Score Error:', error);
    return res.status(500).json({ error: 'Failed to calculate health score.' });
  }
};

module.exports = { getHealthScore };
