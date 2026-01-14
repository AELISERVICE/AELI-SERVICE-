const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom token for response time in ms
morgan.token('response-time-ms', (req, res) => {
    if (!req._startAt || !res._startAt) return '';
    const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
        (res._startAt[1] - req._startAt[1]) * 1e-6;
    return ms.toFixed(2);
});

// Custom token for user ID (if authenticated)
morgan.token('user-id', (req) => {
    return req.user?.id || 'anonymous';
});

// Custom token for request body size
morgan.token('req-body-size', (req) => {
    if (req.body && Object.keys(req.body).length > 0) {
        return JSON.stringify(req.body).length + 'b';
    }
    return '0b';
});

// Development format (colorized, detailed)
const devFormat = ':method :url :status :response-time-ms ms - :res[content-length]';

// Production format (JSON for log aggregation)
const prodFormat = JSON.stringify({
    method: ':method',
    url: ':url',
    status: ':status',
    responseTime: ':response-time-ms',
    contentLength: ':res[content-length]',
    userId: ':user-id',
    ip: ':remote-addr',
    userAgent: ':user-agent',
    timestamp: ':date[iso]'
});

// Skip logging for certain paths
const skip = (req) => {
    // Skip health checks and static files in production
    const skipPaths = ['/api/health', '/api-docs', '/favicon.ico'];
    return skipPaths.some(path => req.path.startsWith(path));
};

// Stream for file logging
const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
);

/**
 * Get Morgan middleware based on environment
 */
const getRequestLogger = () => {
    if (process.env.NODE_ENV === 'production') {
        // Production: log to file in JSON format
        return morgan(prodFormat, {
            stream: accessLogStream,
            skip
        });
    } else if (process.env.NODE_ENV === 'test') {
        // Test: skip logging
        return (req, res, next) => next();
    } else {
        // Development: colorized console output
        return morgan(devFormat, {
            skip
        });
    }
};

/**
 * Request timing middleware
 * Adds request start time for accurate timing
 */
const requestTiming = (req, res, next) => {
    req.startTime = Date.now();

    // Track response time
    res.on('finish', () => {
        const duration = Date.now() - req.startTime;

        // Log slow requests (>1000ms)
        if (duration > 1000) {
            logger.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
        }
    });

    next();
};

module.exports = {
    getRequestLogger,
    requestTiming
};
