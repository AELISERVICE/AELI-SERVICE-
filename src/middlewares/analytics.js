const ApiUsage = require('../models/ApiUsage');
const logger = require('../utils/logger');

/**
 * API Analytics tracking middleware
 * Tracks all API requests for analytics
 */
const analyticsMiddleware = (req, res, next) => {
    // Skip tracking for certain paths
    const skipPaths = ['/api/health', '/api-docs', '/favicon.ico'];
    if (skipPaths.some(path => req.path.startsWith(path))) {
        return next();
    }

    const startTime = Date.now();

    // Save original end function
    const originalEnd = res.end;

    // Override res.end to capture response
    res.end = function (chunk, encoding) {
        // Restore original function
        res.end = originalEnd;

        // Calculate duration
        const duration = Date.now() - startTime;

        // Get response size
        const responseSize = chunk ? Buffer.byteLength(chunk) : 0;

        // Track asynchronously (don't block response)
        setImmediate(async () => {
            try {
                await ApiUsage.create({
                    endpoint: req.path,
                    method: req.method,
                    statusCode: res.statusCode,
                    duration,
                    userId: req.user?.id || null,
                    ipAddress: req.ip || req.connection?.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    requestSize: req.headers['content-length'] ? parseInt(req.headers['content-length']) : null,
                    responseSize
                });
            } catch (error) {
                // Don't log errors in test environment
                if (process.env.NODE_ENV !== 'test') {
                    logger.error('Analytics tracking error:', error.message);
                }
            }
        });

        // Call original end
        return originalEnd.call(this, chunk, encoding);
    };

    next();
};

module.exports = { analyticsMiddleware };
