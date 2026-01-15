/**
 * Email Worker for AELI Services
 * Processes email queue using Bull
 */

const { emailQueue } = require('../config/queue');
const { sendEmail } = require('../config/email');
const logger = require('../utils/logger');

/**
 * Initialize email worker
 */
const initEmailWorker = () => {
    logger.info('📧 Initializing email worker...');

    // Process email jobs
    emailQueue.process('send', async (job) => {
        const { to, subject, html, text } = job.data;

        logger.debug(`[EMAIL] Processing job ${job.id} to ${to}`);

        try {
            await sendEmail({ to, subject, html, text });
            logger.info(`[EMAIL] Sent to ${to}: ${subject}`);
            return { success: true, to, subject };
        } catch (error) {
            logger.error(`[EMAIL] Failed to send to ${to}:`, error.message);
            throw error; // Will trigger retry
        }
    });

    // Job completed handler
    emailQueue.on('completed', (job, result) => {
        logger.debug(`[EMAIL] Job ${job.id} completed`);
    });

    // Job failed handler
    emailQueue.on('failed', (job, err) => {
        logger.error(`[EMAIL] Job ${job.id} failed after ${job.attemptsMade} attempts:`, err.message);
    });

    logger.info('✅ Email worker initialized');
};

/**
 * Queue an email for async sending
 * @param {Object} emailData - Email data (to, subject, html, text)
 * @param {Object} options - Job options (priority, delay, etc.)
 */
const queueEmailAsync = async (emailData, options = {}) => {
    const defaultOptions = {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: 100,
        removeOnFail: 500
    };

    const job = await emailQueue.add('send', emailData, {
        ...defaultOptions,
        ...options
    });

    logger.debug(`[EMAIL] Queued job ${job.id} to ${emailData.to}`);
    return job;
};

/**
 * Get email queue stats
 */
const getEmailQueueStats = async () => {
    const counts = await emailQueue.getJobCounts();
    return {
        waiting: counts.waiting,
        active: counts.active,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed
    };
};

/**
 * Clear failed jobs
 */
const clearFailedJobs = async () => {
    await emailQueue.clean(0, 'failed');
    logger.info('[EMAIL] Cleared failed jobs');
};

/**
 * Pause email queue
 */
const pauseEmailQueue = async () => {
    await emailQueue.pause();
    logger.info('[EMAIL] Queue paused');
};

/**
 * Resume email queue
 */
const resumeEmailQueue = async () => {
    await emailQueue.resume();
    logger.info('[EMAIL] Queue resumed');
};

module.exports = {
    initEmailWorker,
    queueEmailAsync,
    getEmailQueueStats,
    clearFailedJobs,
    pauseEmailQueue,
    resumeEmailQueue
};
