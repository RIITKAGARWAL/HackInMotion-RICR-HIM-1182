const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;

let redisClient = null;

// Only initialize Redis if explicitly provided, or configured safely
const createRedisClient = () => {
  const options = {
    maxRetriesPerRequest: null, // Required for BullMQ compatibility
    enableOfflineQueue: false, // Don't queue commands if Redis is down
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️ Redis connection unreachable. Running in fallback mode (Redis features disabled).');
        return null; // Stop retrying after 3 attempts to prevent log spamming
      }
      return Math.min(times * 200, 2000);
    },
  };

  if (redisUrl) {
    return new Redis(redisUrl, options);
  }

  // If on Render production without REDIS_URL, don't attempt loop
  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_HOST) {
    console.warn('ℹ️ No production REDIS_URL set. Dynamic queue caching disabled.');
    return null;
  }

  return new Redis({
    host: redisHost,
    port: redisPort,
    ...options,
  });
};

try {
  redisClient = createRedisClient();

  if (redisClient) {
    redisClient.on('connect', () => {
      console.log('✓ Successfully connected to Redis.');
    });

    redisClient.on('error', (err) => {
      // Quiet down ECONNREFUSED spam
      if (err.code === 'ECONNREFUSED') {
        console.warn('⚠️ Redis unavailable. App operates in fallback mode.');
        redisClient.disconnect();
      } else {
        console.error('Redis Error:', err.message);
      }
    });
  }
} catch (error) {
  console.warn('⚠️ Redis initialization bypassed:', error.message);
}

module.exports = redisClient;
