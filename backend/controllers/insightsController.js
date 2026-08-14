const insightsService = require('../services/insightsService');

// Full Insights Overview for a user + month (?month_year=YYYY-MM)
const getOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const monthYear = req.query.month_year || new Date().toISOString().substring(0, 7);
    const data = await insightsService.getOverview(userId, monthYear);
    return res.json(data);
  } catch (error) {
    console.error('Insights Overview Error:', error);
    return res.status(500).json({ error: 'Failed to compute insights overview.' });
  }
};

module.exports = { getOverview };
