const Queue = require('bull');
const logger = require('../utils/logger');

// Redis connection configuration
const redisConfig = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: 3
    }
};

// Default job options
const defaultJobOptions = {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500 // Keep last 500 failed jobs
};

// Create queues
const emailQueue = new Queue('email', redisConfig.redis.host ? redisConfig : undefined);
const cleanupQueue = new Queue('cleanup', redisConfig.redis.host ? redisConfig : undefined);
const webhookQueue = new Queue('webhook', redisConfig.redis.host ? redisConfig : undefined);
const analyticsQueue = new Queue('analytics', redisConfig.redis.host ? redisConfig : undefined);

// Queue event handlers
const setupQueueEvents = (queue, name) => {
    queue.on('completed', (job, result) => {
        logger.debug(`[${name}] Job ${job.id} completed`);
    });

    queue.on('failed', (job, err) => {
        logger.error(`[${name}] Job ${job.id} failed:`, err.message);
    });

    queue.on('stalled', (job) => {
        logger.warn(`[${name}] Job ${job.id} stalled`);
    });

    queue.on('error', (error) => {
        logger.error(`[${name}] Queue error:`, error.message);
    });
};

// Setup events for all queues
setupQueueEvents(emailQueue, 'Email');
setupQueueEvents(cleanupQueue, 'Cleanup');
setupQueueEvents(webhookQueue, 'Webhook');
setupQueueEvents(analyticsQueue, 'Analytics');

// ==================== QUEUE METHODS ====================

/**
 * Add email job to queue
 */
const queueEmail = async (emailData, options = {}) => {
    return emailQueue.add('send', emailData, {
        ...defaultJobOptions,
        ...options
    });
};

/**
 * Add cleanup job to queue
 */
const queueCleanup = async (cleanupType, data = {}, options = {}) => {
    return cleanupQueue.add(cleanupType, data, {
        ...defaultJobOptions,
        ...options
    });
};

/**
 * Add webhook job to queue
 */
const queueWebhook = async (webhookData, options = {}) => {
    return webhookQueue.add('dispatch', webhookData, {
        ...defaultJobOptions,
        attempts: 5, // More retries for webhooks
        ...options
    });
};

/**
 * Add analytics job to queue
 */
const queueAnalytics = async (eventType, data, options = {}) => {
    return analyticsQueue.add(eventType, data, {
        ...defaultJobOptions,
        attempts: 1, // Analytics can fail
        ...options
    });
};

/**
 * Schedule recurring cleanup jobs
 */
const scheduleRecurringJobs = async () => {
    // Clean expired tokens every hour
    await cleanupQueue.add('expired-tokens', {}, {
        repeat: { cron: '0 * * * *' }, // Every hour
        ...defaultJobOptions
    });

    // Clean old audit logs every day at 2 AM
    await cleanupQueue.add('old-audit-logs', { daysToKeep: 90 }, {
        repeat: { cron: '0 2 * * *' },
        ...defaultJobOptions
    });

    // Clean old security logs every day at 3 AM
    await cleanupQueue.add('old-security-logs', { daysToKeep: 30 }, {
        repeat: { cron: '0 3 * * *' },
        ...defaultJobOptions
    });

    logger.info('✅ Recurring jobs scheduled');
};

/**
 * Get queue stats
 */
const getQueueStats = async () => {
    const [
        emailCounts,
        cleanupCounts,
        webhookCounts,
        analyticsCounts
    ] = await Promise.all([
        emailQueue.getJobCounts(),
        cleanupQueue.getJobCounts(),
        webhookQueue.getJobCounts(),
        analyticsQueue.getJobCounts()
    ]);

    return {
        email: emailCounts,
        cleanup: cleanupCounts,
        webhook: webhookCounts,
        analytics: analyticsCounts
    };
};

/**
 * Close all queues gracefully
 */
const closeQueues = async () => {
    await Promise.all([
        emailQueue.close(),
        cleanupQueue.close(),
        webhookQueue.close(),
        analyticsQueue.close()
    ]);
    logger.info('✅ All queues closed');
};

module.exports = {
    emailQueue,
    cleanupQueue,
    webhookQueue,
    analyticsQueue,
    queueEmail,
    queueCleanup,
    queueWebhook,
    queueAnalytics,
    scheduleRecurringJobs,
    getQueueStats,
    closeQueues
};
