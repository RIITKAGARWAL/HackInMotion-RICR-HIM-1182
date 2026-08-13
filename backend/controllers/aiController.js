const aiEngine = require('../services/aiEngine');
const db = require('../config/db');

const streamChatAssistant = async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const { prompt } = req.body || {};
  if (!prompt || !String(prompt).trim()) {
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  const userId = req.user && req.user.id;
  await aiEngine.streamChatReply({ userId, prompt, res });
};

const getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const monthYear = req.query.month_year || new Date().toISOString().substring(0, 7);

    // Generate fresh alerts (idempotent via dedupe) then return all for the month
    await aiEngine.generateAIInsights(userId, monthYear);

    const result = await db.query(
      `SELECT id, type, title, message, severity, created_at
       FROM ai_insights
       WHERE user_id = $1
       ORDER BY CASE severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at DESC
       LIMIT 30`,
      [userId]
    );

    const insights = result.rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      message: r.message,
      severity: r.severity,
      created_at: r.created_at
    }));

    return res.json({ insights });
  } catch (error) {
    console.error('Get Insights Error:', error);
    return res.status(500).json({ error: 'Failed to load AI insights.' });
  }
};

module.exports = { streamChatAssistant, getInsights };
