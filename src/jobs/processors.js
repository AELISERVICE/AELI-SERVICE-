const { sendEmail } = require('../config/email');
const { RefreshToken, SecurityLog, AuditLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const axios = require('axios');

/**
 * Email processor
 */
const emailProcessor = async (job) => {
    const { to, subject, html, text } = job.data;

    logger.debug(`Processing email job ${job.id} to ${to}`);

    try {
        await sendEmail({ to, subject, html, text });
        return { success: true, to, subject };
    } catch (error) {
        logger.error(`Email job ${job.id} failed:`, error.message);
        throw error;
    }
};

/**
 * Cleanup processor
 */
const cleanupProcessor = async (job) => {
    const { data } = job;

    logger.info(`Processing cleanup job: ${job.name}`);

    try {
        switch (job.name) {
            case 'expired-tokens':
                const tokenResult = await RefreshToken.destroy({
                    where: {
                        [Op.or]: [
                            { expiresAt: { [Op.lt]: new Date() } },
                            { isRevoked: true }
                        ]
                    }
                });
                logger.info(`Cleaned ${tokenResult} expired/revoked tokens`);
                return { cleaned: tokenResult, type: 'tokens' };

            case 'old-audit-logs':
                const auditCutoff = new Date();
                auditCutoff.setDate(auditCutoff.getDate() - (data.daysToKeep || 90));

                const auditResult = await AuditLog.destroy({
                    where: { createdAt: { [Op.lt]: auditCutoff } }
                });
                logger.info(`Cleaned ${auditResult} old audit logs`);
                return { cleaned: auditResult, type: 'audit-logs' };

            case 'old-security-logs':
                const securityCutoff = new Date();
                securityCutoff.setDate(securityCutoff.getDate() - (data.daysToKeep || 30));

                const securityResult = await SecurityLog.destroy({
                    where: { createdAt: { [Op.lt]: securityCutoff } }
                });
                logger.info(`Cleaned ${securityResult} old security logs`);
                return { cleaned: securityResult, type: 'security-logs' };

            default:
                logger.warn(`Unknown cleanup job type: ${job.name}`);
                return { skipped: true };
        }
    } catch (error) {
        logger.error(`Cleanup job ${job.name} failed:`, error.message);
        throw error;
    }
};

/**
 * Webhook processor
 */
const webhookProcessor = async (job) => {
    const { url, event, payload, secret } = job.data;

    logger.debug(`Processing webhook job ${job.id} to ${url}`);

    try {
        const crypto = require('crypto');
        const timestamp = Date.now();
        const signature = crypto
            .createHmac('sha256', secret || 'default-secret')
            .update(`${timestamp}.${JSON.stringify(payload)}`)
            .digest('hex');

        const response = await axios.post(url, {
            event,
            timestamp,
            payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature,
                'X-Webhook-Timestamp': timestamp.toString()
            },
            timeout: 30000 // 30 second timeout
        });

        return {
            success: true,
            status: response.status,
            url,
            event
        };
    } catch (error) {
        logger.error(`Webhook to ${url} failed:`, error.message);
        throw error;
    }
};

/**
 * Analytics processor
 */
const analyticsProcessor = async (job) => {
    const { data } = job;

    // For now, just log analytics events
    // In production, this could send to an analytics service
    logger.info(`Analytics event: ${job.name}`, data);

    return { recorded: true, event: job.name };
};

/**
 * Setup all processors
 */
const setupProcessors = (queues) => {
    const { emailQueue, cleanupQueue, webhookQueue, analyticsQueue } = queues;

    emailQueue.process('send', 5, emailProcessor); // 5 concurrent
    cleanupQueue.process('*', 1, cleanupProcessor); // 1 at a time
    webhookQueue.process('dispatch', 10, webhookProcessor); // 10 concurrent
    analyticsQueue.process('*', 20, analyticsProcessor); // 20 concurrent

    logger.info('✅ Queue processors initialized');
};

module.exports = {
    emailProcessor,
    cleanupProcessor,
    webhookProcessor,
    analyticsProcessor,
    setupProcessors
};
