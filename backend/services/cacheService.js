const redis = require('../config/redis');
const db = require('../config/db');

const CACHE_PREFIX = 'dashboard:';
const CACHE_TTL = 1800;

async function getCachedDashboardData(userId) {
  const cacheKey = `${CACHE_PREFIX}${userId}`;

  // 1. Try reading pre-aggregated data from Redis
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Aggregate from DB on Cache Miss
  const summaryQuery = `
    SELECT c.name as category, SUM(t.amount) as total
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = $1 AND t.date >= NOW() - INTERVAL '30 days'
    GROUP BY c.name
  `;
  const result = await db.query(summaryQuery, [userId]);

  const dashboardPayload = {
    spendingBreakdown: result.rows,
    updatedAt: new Date().toISOString(),
  };

  // 3. Cache payload
  await redis.set(cacheKey, JSON.stringify(dashboardPayload), 'EX', CACHE_TTL);
  return dashboardPayload;
}

async function invalidateUserCache(userId) {
  await redis.del(`${CACHE_PREFIX}${userId}`);
}

// Clear every cached dashboard (used when global categories change)
async function invalidateAllUserCache() {
  let cursor = '0';
  do {
    const reply = await redis.scan(cursor, 'MATCH', `${CACHE_PREFIX}*`, 'COUNT', 100);
    cursor = reply[0];
    const keys = reply[1];
    if (keys.length > 0) await redis.del(keys);
  } while (cursor !== '0');
}

module.exports = { getCachedDashboardData, invalidateUserCache, invalidateAllUserCache };
