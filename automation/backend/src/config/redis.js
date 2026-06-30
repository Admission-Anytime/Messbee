import dotenv from 'dotenv';

dotenv.config();

/**
 * MOCK REDIS CLIENT
 * Since Redis is not available locally on Windows, this prevents the backend 
 * from constantly spamming ECONNREFUSED errors while trying to reconnect.
 */
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

console.log(`[Redis] Mocking Redis connection to avoid local connection errors.`);

const redis = {
  on: (event, handler) => {
    // silently ignore event listeners
  },
  get: async () => null,
  set: async () => 'OK',
  quit: async () => 'OK'
};

export default redis;
