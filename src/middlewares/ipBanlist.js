const BannedIP = require('../models/BannedIP');
const logger = require('../utils/logger');

// Cache for banned IPs (reduce DB queries)
const bannedIPCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Check if IP is in cache
 */
const isIPInCache = (ip) => {
    const cached = bannedIPCache.get(ip);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
        bannedIPCache.delete(ip);
        return null;
    }

    return cached.banned;
};

/**
 * Add IP to cache
 */
const cacheIP = (ip, banned) => {
    bannedIPCache.set(ip, {
        banned,
        expiry: Date.now() + CACHE_TTL
    });
};

/**
 * IP Banlist middleware
 * Blocks requests from banned IP addresses
 */
const ipBanlistMiddleware = async (req, res, next) => {
    try {
        const clientIP = req.ip ||
            req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.connection?.remoteAddress;

        if (!clientIP) {
            return next();
        }

        // Check cache first
        const cachedResult = isIPInCache(clientIP);
        if (cachedResult !== null) {
            if (cachedResult) {
                logger.warn(`Blocked banned IP: ${clientIP}`);
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé',
                    code: 'IP_BANNED'
                });
            }
            return next();
        }

        // Check database
        const isBanned = await BannedIP.isIPBanned(clientIP);
        cacheIP(clientIP, isBanned);

        if (isBanned) {
            logger.warn(`Blocked banned IP: ${clientIP}`);
            return res.status(403).json({
                success: false,
                message: 'Accès refusé',
                code: 'IP_BANNED'
            });
        }

        next();
    } catch (error) {
        // Don't block on errors, just log and continue
        logger.error('IP banlist check error:', error.message);
        next();
    }
};

/**
 * Clear banned IP cache
 */
const clearIPCache = () => {
    bannedIPCache.clear();
};

/**
 * Get cache stats
 */
const getCacheStats = () => ({
    size: bannedIPCache.size,
    ttl: CACHE_TTL
});

module.exports = {
    ipBanlistMiddleware,
    clearIPCache,
    getCacheStats
};
