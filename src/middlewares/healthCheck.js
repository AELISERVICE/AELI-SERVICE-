const { sequelize } = require('../config/database');
const { isRedisAvailable } = require('../config/redis');
const { verifyTransporter } = require('../config/email');
const { asyncHandler } = require('./errorHandler');
const { successResponse } = require('../utils/helpers');
const os = require('os');

/**
 * Basic health check
 */
const basicHealth = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'AELI Services API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        uptime: Math.floor(process.uptime())
    });
});

/**
 * Detailed health check with all services status
 */
const detailedHealth = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const checks = {};

    // Database check
    try {
        await sequelize.authenticate();
        const [result] = await sequelize.query('SELECT NOW() as time');
        checks.database = {
            status: 'healthy',
            responseTime: Date.now() - startTime,
            timestamp: result[0]?.time || new Date().toISOString()
        };
    } catch (error) {
        checks.database = {
            status: 'unhealthy',
            error: error.message
        };
    }

    // Redis check
    const redisStart = Date.now();
    try {
        const redisAvailable = isRedisAvailable();
        if (redisAvailable) {
            const cache = require('../config/redis');
            await cache.set('health:check', 'ok', 5);
            const value = await cache.get('health:check');
            checks.redis = {
                status: value === 'ok' ? 'healthy' : 'degraded',
                responseTime: Date.now() - redisStart,
                available: true
            };
        } else {
            checks.redis = {
                status: 'disabled',
                available: false,
                message: 'Redis not configured'
            };
        }
    } catch (error) {
        checks.redis = {
            status: 'unhealthy',
            error: error.message
        };
    }

    // Email check
    const emailStart = Date.now();
    try {
        const emailVerified = await verifyTransporter();
        checks.email = {
            status: emailVerified ? 'healthy' : 'unhealthy',
            responseTime: Date.now() - emailStart
        };
    } catch (error) {
        checks.email = {
            status: 'unhealthy',
            error: error.message
        };
    }

    // System metrics
    const systemMetrics = {
        memory: {
            total: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
            free: Math.round(os.freemem() / 1024 / 1024) + 'MB',
            usage: Math.round((1 - os.freemem() / os.totalmem()) * 100) + '%'
        },
        cpu: {
            cores: os.cpus().length,
            load: os.loadavg()
        },
        process: {
            pid: process.pid,
            uptime: Math.floor(process.uptime()) + 's',
            memoryUsage: {
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
                heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
            }
        }
    };

    // Determine overall status
    const statuses = Object.values(checks).map(c => c.status);
    const overallStatus = statuses.includes('unhealthy') ? 'unhealthy' :
        statuses.includes('degraded') ? 'degraded' : 'healthy';

    const responseCode = overallStatus === 'healthy' ? 200 :
        overallStatus === 'degraded' ? 200 : 503;

    res.status(responseCode).json({
        success: overallStatus !== 'unhealthy',
        status: overallStatus,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        totalResponseTime: Date.now() - startTime,
        checks,
        system: systemMetrics
    });
});

/**
 * Readiness probe (for Kubernetes)
 */
const readinessProbe = asyncHandler(async (req, res) => {
    try {
        await sequelize.authenticate();
        res.status(200).json({ ready: true });
    } catch (error) {
        res.status(503).json({ ready: false, error: error.message });
    }
});

/**
 * Liveness probe (for Kubernetes)
 */
const livenessProbe = (req, res) => {
    res.status(200).json({ alive: true, uptime: process.uptime() });
};

module.exports = {
    basicHealth,
    detailedHealth,
    readinessProbe,
    livenessProbe
};
