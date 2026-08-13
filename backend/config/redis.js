const Redis = require('ioredis');

// 1. If REDIS_URL is provided in .env (e.g., Upstash / Render Cloud Redis), use it directly.
// 2. Otherwise fall back to local settings (127.0.0.1 for local dev, or 'redis' inside Docker).
const redisConfig = process.env.REDIS_URL
  ? process.env.REDIS_URL
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null, // Critical requirement for BullMQ / queues
    };

const redis = new Redis(redisConfig, {
  // Retain maxRetriesPerRequest setting if connecting via URL string
  maxRetriesPerRequest: null,
});

redis.on('connect', () => console.log('Connected to Redis Cache & Queue Cluster'));
redis.on('error', (err) => console.error('Redis Connection Error:', err));

module.exports = redis;