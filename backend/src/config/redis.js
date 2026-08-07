import Redis from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  retryStrategy: (times) => {
    if (times > 10) return null;
    return Math.min(times * 200, 2000);
  },
});

redis.on('connect', () => console.log('Redis connecting...'));
redis.on('ready', () => console.log('Redis ready'));
redis.on('error', (e) => console.error('Redis error', e.message));

export const redisPub = new Redis(env.REDIS_URL);
export const redisSub = new Redis(env.REDIS_URL);

// Cache helpers with cache-aside pattern
export const cache = {
  async get(key) {
    try {
      const val = await redis.get(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },
  async set(key, value, ttlSeconds = 300) {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {}
  },
  async del(pattern) {
    try {
      if (pattern.includes('*')) {
        const keys = await redis.keys(pattern);
        if (keys.length) await redis.del(...keys);
      } else {
        await redis.del(pattern);
      }
    } catch {}
  },
  async invalidateTags(tags = []) {
    for (const tag of tags) {
      await cache.del(`cache:${tag}:*`);
    }
  },
};

export const CACHE_KEYS = {
  products: (queryHash) => `cache:products:${queryHash}`,
  product: (id) => `cache:product:${id}`,
  users: (hash) => `cache:users:${hash}`,
  user: (id) => `cache:user:${id}`,
  dashboard: (range) => `cache:dashboard:${range}`,
  onlineUsers: 'cache:presence:online',
  sales: (hash) => `cache:sales:${hash}`,
};
