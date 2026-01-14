const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;
let isConnected = false;

/**
 * Initialize Redis connection
 */
const initRedis = () => {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
            lazyConnect: true,
            connectTimeout: 10000,
            // Don't crash the app if Redis is not available
            enableOfflineQueue: false
        });

        redis.on('connect', () => {
            isConnected = true;
            logger.info('✅ Redis connected');
        });

        redis.on('error', (err) => {
            isConnected = false;
            logger.warn('Redis error (cache disabled):', err.message);
        });

        redis.on('close', () => {
            isConnected = false;
            logger.info('Redis connection closed');
        });

        // Attempt connection
        redis.connect().catch((err) => {
            logger.warn('Redis connection failed (cache disabled):', err.message);
        });

    } catch (error) {
        logger.warn('Redis initialization failed (cache disabled):', error.message);
    }

    return redis;
};

/**
 * Check if Redis is available
 */
const isRedisAvailable = () => isConnected && redis !== null;

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached value or null
 */
const get = async (key) => {
    if (!isRedisAvailable()) return null;

    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error('Redis GET error:', error.message);
        return null;
    }
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttlSeconds - Time to live in seconds (default: 5 min)
 * @returns {Promise<boolean>} Success status
 */
const set = async (key, value, ttlSeconds = 300) => {
    if (!isRedisAvailable()) return false;

    try {
        await redis.setex(key, ttlSeconds, JSON.stringify(value));
        return true;
    } catch (error) {
        logger.error('Redis SET error:', error.message);
        return false;
    }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
const del = async (key) => {
    if (!isRedisAvailable()) return false;

    try {
        await redis.del(key);
        return true;
    } catch (error) {
        logger.error('Redis DEL error:', error.message);
        return false;
    }
};

/**
 * Delete multiple keys by pattern
 * @param {string} pattern - Pattern (e.g., "providers:*")
 * @returns {Promise<number>} Number of deleted keys
 */
const delByPattern = async (pattern) => {
    if (!isRedisAvailable()) return 0;

    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
        return keys.length;
    } catch (error) {
        logger.error('Redis DEL pattern error:', error.message);
        return 0;
    }
};

/**
 * Cache middleware for Express routes
 * @param {number} ttlSeconds - Cache TTL in seconds
 * @param {Function} keyGenerator - Function to generate cache key from req
 */
const cacheMiddleware = (ttlSeconds = 300, keyGenerator = null) => {
    return async (req, res, next) => {
        if (!isRedisAvailable()) return next();

        // Generate cache key
        const key = keyGenerator
            ? keyGenerator(req)
            : `route:${req.originalUrl}`;

        try {
            const cached = await get(key);
            if (cached) {
                logger.debug(`Cache HIT: ${key}`);
                return res.json(cached);
            }

            // Store original json method
            const originalJson = res.json.bind(res);

            // Override json to cache response
            res.json = (data) => {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    set(key, data, ttlSeconds).catch(() => { });
                }
                return originalJson(data);
            };

            next();
        } catch (error) {
            logger.error('Cache middleware error:', error.message);
            next();
        }
    };
};

/**
 * Close Redis connection
 */
const closeRedis = async () => {
    if (redis) {
        await redis.quit();
        redis = null;
        isConnected = false;
    }
};

// Cache key generators
const cacheKeys = {
    providers: (page, filters) => `providers:list:${page}:${JSON.stringify(filters)}`,
    provider: (id) => `providers:${id}`,
    categories: () => 'categories:all',
    services: (providerId) => `services:provider:${providerId}`,
    reviews: (providerId, page) => `reviews:provider:${providerId}:${page}`,
    userFavorites: (userId) => `favorites:user:${userId}`
};

module.exports = {
    initRedis,
    isRedisAvailable,
    get,
    set,
    del,
    delByPattern,
    cacheMiddleware,
    closeRedis,
    cacheKeys
};
