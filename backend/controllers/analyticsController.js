const analytics = require('../services/analyticsService');

// Time-range filtered summary for the header bar / balance strip
const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await analytics.getSummary(userId, req.query);
    return res.json(summary);
  } catch (error) {
    console.error('Analytics Summary Error:', error);
    return res.status(500).json({ error: 'Failed to compute analytics summary.' });
  }
};

// Category breakdown with percentages (doughnut + legend)
const getBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await analytics.getCategoryBreakdown(userId, req.query);
    return res.json(data);
  } catch (error) {
    console.error('Analytics Breakdown Error:', error);
    return res.status(500).json({ error: 'Failed to compute category breakdown.' });
  }
};

// Time series trends for line/bar charts
const getTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await analytics.getTrends(userId, req.query);
    return res.json(data);
  } catch (error) {
    console.error('Analytics Trends Error:', error);
    return res.status(500).json({ error: 'Failed to compute spending trends.' });
  }
};

// Income vs expense cash-flow ratio
const getCashFlow = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await analytics.getCashFlow(userId, req.query);
    return res.json(data);
  } catch (error) {
    console.error('Analytics CashFlow Error:', error);
    return res.status(500).json({ error: 'Failed to compute cash flow.' });
  }
};

module.exports = { getSummary, getBreakdown, getTrends, getCashFlow };
