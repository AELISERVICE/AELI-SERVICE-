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

/**
 * Auto-ban IP after too many suspicious activities
 * Called from security middleware when anomalies detected
 */
const autoBanSuspiciousIP = async (ip, reason, req) => {
    const SecurityLog = require('../models/SecurityLog');
    const { Op } = require('sequelize');

    // Count suspicious events from this IP in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const suspiciousCount = await SecurityLog.count({
        where: {
            ipAddress: ip,
            success: false,
            riskLevel: ['medium', 'high'],
            createdAt: { [Op.gte]: oneHourAgo }
        }
    });

    // If 10+ suspicious events, auto-ban for 24 hours
    if (suspiciousCount >= 10) {
        await BannedIP.banIP(ip, {
            reason: `Auto-ban: ${reason} (${suspiciousCount} suspicious events)`,
            duration: 24 * 60 * 60 // 24 hours
        });

        // Clear cache so ban takes effect immediately
        bannedIPCache.delete(ip);

        logger.warn(`Auto-banned IP ${ip} for 24h: ${reason}`);
        return true;
    }

    return false;
};

/**
 * Honeypot middleware
 * Detects bots by checking for hidden form fields that should remain empty
 * Add hidden fields named: website, url, phone2, email2, company
 */
const honeypotMiddleware = (fieldNames = ['website', 'hp_check', 'url2']) => {
    return async (req, res, next) => {
        try {
            // Check if any honeypot fields are filled (bots fill them, humans don't)
            for (const field of fieldNames) {
                if (req.body && req.body[field] && req.body[field].trim() !== '') {
                    const clientIP = req.ip || req.headers['x-forwarded-for']?.split(',')[0].trim();

                    logger.warn(`Honeypot triggered by IP: ${clientIP}, field: ${field}`);

                    // Log as high risk
                    const SecurityLog = require('../models/SecurityLog');
                    await SecurityLog.logEvent({
                        userId: req.user?.id,
                        eventType: 'honeypot_triggered',
                        ipAddress: clientIP,
                        userAgent: req.get('user-agent'),
                        details: { field, value: req.body[field].substring(0, 100) },
                        success: false,
                        riskLevel: 'high'
                    });

                    // Auto-ban after repeated honeypot triggers
                    await autoBanSuspiciousIP(clientIP, 'Honeypot triggered', req);

                    // Don't reveal it's a honeypot - just silently reject
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid request'
                    });
                }
            }

            // Remove honeypot fields from body before processing
            for (const field of fieldNames) {
                if (req.body && req.body[field] !== undefined) {
                    delete req.body[field];
                }
            }

            next();
        } catch (error) {
            logger.error('Honeypot middleware error:', error.message);
            next();
        }
    };
};

module.exports = {
    ipBanlistMiddleware,
    clearIPCache,
    getCacheStats,
    autoBanSuspiciousIP,
    honeypotMiddleware
};
