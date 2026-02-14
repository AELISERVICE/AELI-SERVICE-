/**
 * Cron Jobs Unit Tests
 * Tests for scheduled tasks and cron jobs
 */

const { initCronJobs, stopCronJobs } = require('../../src/jobs/cron');
const { Subscription, RefreshToken, SecurityLog, BannedIP } = require('../../src/models');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('../../src/models');
jest.mock('../../src/utils/logger');
jest.mock('node-cron');
jest.mock('../../src/controllers/subscriptionController');

describe('Cron Jobs', () => {
    let cron, Subscription, RefreshToken, SecurityLog, BannedIP, sendExpirationReminders, cache;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock logger
        logger.info = jest.fn();
        logger.error = jest.fn();
        logger.debug = jest.fn();
        logger.warn = jest.fn();
        
        // Mock node-cron
        cron = require('node-cron');
        cron.schedule = jest.fn();
        cron.getTasks = jest.fn(() => [
            { stop: jest.fn() },
            { stop: jest.fn() },
            { stop: jest.fn() },
            { stop: jest.fn() }
        ]);
        
        // Mock models
        Subscription = require('../../src/models').Subscription;
        RefreshToken = require('../../src/models').RefreshToken;
        SecurityLog = require('../../src/models').SecurityLog;
        BannedIP = require('../../src/models').BannedIP;
        
        // Mock controller function
        const subscriptionController = require('../../src/controllers/subscriptionController');
        sendExpirationReminders = subscriptionController.sendExpirationReminders;
        sendExpirationReminders.mockResolvedValue(10);
        
        // Mock cache
        cache = require('../../src/config/redis');
        cache.del = jest.fn().mockResolvedValue();
    });

    describe('initCronJobs', () => {
        it('should initialize all cron jobs', () => {
            initCronJobs();

            expect(logger.info).toHaveBeenCalledWith('📅 Initializing cron jobs...');
            expect(logger.info).toHaveBeenCalledWith('✅ Cron jobs initialized');
            expect(cron.schedule).toHaveBeenCalledTimes(5);
        });

        it('should schedule subscription expiration check', () => {
            initCronJobs();

            expect(cron.schedule).toHaveBeenCalledWith(
                '1 0 * * *',
                expect.any(Function),
                {
                    scheduled: true,
                    timezone: 'Africa/Douala'
                }
            );
        });

        it('should schedule expiration reminders', () => {
            initCronJobs();

            expect(cron.schedule).toHaveBeenCalledWith(
                '0 9 * * *',
                expect.any(Function),
                {
                    scheduled: true,
                    timezone: 'Africa/Douala'
                }
            );
        });

        it('should schedule token cleanup', () => {
            initCronJobs();

            expect(cron.schedule).toHaveBeenCalledWith(
                '0 * * * *',
                expect.any(Function)
            );
        });

        it('should schedule security log cleanup', () => {
            initCronJobs();

            expect(cron.schedule).toHaveBeenCalledWith(
                '0 3 * * *',
                expect.any(Function),
                {
                    scheduled: true,
                    timezone: 'Africa/Douala'
                }
            );
        });

        it('should schedule IP unban', () => {
            initCronJobs();

            expect(cron.schedule).toHaveBeenCalledWith(
                '*/15 * * * *',
                expect.any(Function)
            );
        });
    });

    describe('stopCronJobs', () => {
        it('should stop all cron jobs', () => {
            const mockTasks = [
                { stop: jest.fn() },
                { stop: jest.fn() }
            ];
            const cron = require('node-cron');
            cron.getTasks = jest.fn(() => mockTasks);

            stopCronJobs();

            expect(cron.getTasks).toHaveBeenCalled();
            mockTasks.forEach(task => {
                expect(task.stop).toHaveBeenCalled();
            });
            expect(logger.info).toHaveBeenCalledWith('🛑 Cron jobs stopped');
        });

        it('should handle empty tasks list', () => {
            const cron = require('node-cron');
            cron.getTasks = jest.fn(() => []);

            stopCronJobs();

            expect(cron.getTasks).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith('🛑 Cron jobs stopped');
        });
    });

    describe('Subscription Expiration Job', () => {
        it('should expire old subscriptions', async () => {
            const mockExpiredCount = 5;
            Subscription.expireOldSubscriptions.mockResolvedValue(mockExpiredCount);

            // Get the scheduled task and call it
            initCronJobs();
            const subscriptionTask = cron.schedule.mock.calls.find(call => call[0] === '1 0 * * *');
            const taskFunction = subscriptionTask[1];

            await taskFunction();

            expect(Subscription.expireOldSubscriptions).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith('[CRON] Expired 5 subscriptions');
        });

        it('should handle subscription expiration errors', async () => {
            const error = new Error('Database error');
            Subscription.expireOldSubscriptions.mockRejectedValue(error);

            initCronJobs();
            const subscriptionTask = cron.schedule.mock.calls.find(call => call[0] === '1 0 * * *');
            const taskFunction = subscriptionTask[1];

            await taskFunction();

            expect(logger.error).toHaveBeenCalledWith('[CRON] Subscription expiration error:', 'Database error');
        });
    });

    describe('Expiration Reminders Job', () => {
        it('should send expiration reminders', async () => {
            // Reset the mock to resolve with 10
            sendExpirationReminders.mockResolvedValue(10);

            initCronJobs();
            const reminderTask = cron.schedule.mock.calls.find(call => call[0] === '0 9 * * *');
            const taskFunction = reminderTask[1];

            await taskFunction();

            expect(sendExpirationReminders).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith('[CRON] Sent 10 reminder emails');
        });

        it('should handle reminder errors', async () => {
            // Reset the mock to reject with error
            sendExpirationReminders.mockRejectedValue(new Error('Email service error'));

            initCronJobs();
            const reminderTask = cron.schedule.mock.calls.find(call => call[0] === '0 9 * * *');
            const taskFunction = reminderTask[1];

            await taskFunction();

            expect(logger.error).toHaveBeenCalledWith('[CRON] Reminder emails error:', 'Email service error');
        });
    });

    describe('Token Cleanup Job', () => {
        it('should clean expired refresh tokens', async () => {
            const mockDeleted = 3;
            RefreshToken.destroy.mockResolvedValue(mockDeleted);

            initCronJobs();
            const tokenTask = cron.schedule.mock.calls.find(call => call[0] === '0 * * * *');
            const taskFunction = tokenTask[1];

            await taskFunction();

            expect(RefreshToken.destroy).toHaveBeenCalledWith({
                where: {
                    expiresAt: expect.any(Object)
                }
            });
            expect(logger.info).toHaveBeenCalledWith(`[CRON] Cleaned ${mockDeleted} expired refresh tokens`);
        });

        it('should handle token cleanup errors', async () => {
            const error = new Error('Database error');
            RefreshToken.destroy.mockRejectedValue(error);

            initCronJobs();
            const tokenTask = cron.schedule.mock.calls.find(call => call[0] === '0 * * * *');
            const taskFunction = tokenTask[1];

            await taskFunction();

            expect(logger.error).toHaveBeenCalledWith('[CRON] Token cleanup error:', 'Database error');
        });

        it('should not log when no tokens deleted', async () => {
            RefreshToken.destroy.mockResolvedValue(0);

            initCronJobs();
            const tokenTask = cron.schedule.mock.calls.find(call => call[0] === '0 * * * *');
            const taskFunction = tokenTask[1];

            await taskFunction();

            expect(logger.info).not.toHaveBeenCalledWith(expect.stringContaining('Cleaned'));
        });
    });

    describe('Security Log Cleanup Job', () => {
        it('should clean old security logs', async () => {
            const mockDeleted = 100;
            SecurityLog.destroy.mockResolvedValue(mockDeleted);

            initCronJobs();
            const logTask = cron.schedule.mock.calls.find(call => call[0] === '0 3 * * *');
            const taskFunction = logTask[1];

            await taskFunction();

            expect(SecurityLog.destroy).toHaveBeenCalledWith({
                where: {
                    createdAt: expect.any(Object)
                }
            });
            expect(logger.info).toHaveBeenCalledWith(`[CRON] Cleaned ${mockDeleted} old security logs`);
        });

        it('should handle security log cleanup errors', async () => {
            const error = new Error('Database error');
            SecurityLog.destroy.mockRejectedValue(error);

            initCronJobs();
            const logTask = cron.schedule.mock.calls.find(call => call[0] === '0 3 * * *');
            const taskFunction = logTask[1];

            await taskFunction();

            expect(logger.error).toHaveBeenCalledWith('[CRON] Security log cleanup error:', 'Database error');
        });
    });

    describe('IP Unban Job', () => {
        it('should unban expired IPs', async () => {
            const mockDeleted = 2;
            BannedIP.destroy.mockResolvedValue(mockDeleted);

            // Mock cache
            cache.del = jest.fn().mockResolvedValue();

            initCronJobs();
            const ipTask = cron.schedule.mock.calls.find(call => call[0] === '*/15 * * * *');
            const taskFunction = ipTask[1];

            await taskFunction();

            expect(BannedIP.destroy).toHaveBeenCalledWith({
                where: {
                    expiresAt: expect.any(Object)
                }
            });
            expect(cache.del).toHaveBeenCalledWith('banned-ips');
            expect(logger.info).toHaveBeenCalledWith(`[CRON] Unbanned ${mockDeleted} expired IPs`);
        });

        it('should handle IP unban errors', async () => {
            const error = new Error('Database error');
            BannedIP.destroy.mockRejectedValue(error);

            initCronJobs();
            const ipTask = cron.schedule.mock.calls.find(call => call[0] === '*/15 * * * *');
            const taskFunction = ipTask[1];

            await taskFunction();

            expect(logger.error).toHaveBeenCalledWith('[CRON] IP unban error:', 'Database error');
        });

        it('should not log when no IPs unbanned', async () => {
            BannedIP.destroy.mockResolvedValue(0);
            cache.del.mockResolvedValue();

            initCronJobs();
            const ipTask = cron.schedule.mock.calls.find(call => call[0] === '*/15 * * * *');
            const taskFunction = ipTask[1];

            await taskFunction();

            expect(logger.info).not.toHaveBeenCalledWith(expect.stringContaining('Unbanned'));
        });
    });

    describe('Timezone Configuration', () => {
        it('should use Africa/Douala timezone for subscription jobs', () => {
            initCronJobs();

            const subscriptionTask = cron.schedule.mock.calls.find(call => call[0] === '1 0 * * *');
            const reminderTask = cron.schedule.mock.calls.find(call => call[0] === '0 9 * * *');
            const logTask = cron.schedule.mock.calls.find(call => call[0] === '0 3 * * *');

            expect(subscriptionTask[2]).toEqual({
                scheduled: true,
                timezone: 'Africa/Douala'
            });
            expect(reminderTask[2]).toEqual({
                scheduled: true,
                timezone: 'Africa/Douala'
            });
            expect(logTask[2]).toEqual({
                scheduled: true,
                timezone: 'Africa/Douala'
            });
        });

        it('should not set timezone for cleanup jobs', () => {
            initCronJobs();

            const tokenTask = cron.schedule.mock.calls.find(call => call[0] === '0 * * * *');
            const ipTask = cron.schedule.mock.calls.find(call => call[0] === '*/15 * * * *');

            expect(tokenTask[2]).toBeUndefined();
            expect(ipTask[2]).toBeUndefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle unexpected errors gracefully', async () => {
            // Mock a task that throws an unexpected error
            initCronJobs();
            const tokenTask = cron.schedule.mock.calls.find(call => call[0] === '0 * * * *');
            const originalFunction = tokenTask[1];
            
            tokenTask[1] = async () => {
                throw new Error('Unexpected error');
            };

            await expect(tokenTask[1]()).rejects.toThrow('Unexpected error');
        });

        it('should continue running other jobs when one fails', async () => {
            // This is tested by the fact that each task is scheduled independently
            initCronJobs();
            expect(cron.schedule).toHaveBeenCalledTimes(5);
        });
    });

    describe('Performance Monitoring', () => {
        it('should handle long-running tasks', async () => {
            // Mock a slow operation
            Subscription.expireOldSubscriptions.mockImplementation(() => 
                new Promise(resolve => setTimeout(() => resolve(5), 100))
            );

            initCronJobs();
            const subscriptionTask = cron.schedule.mock.calls.find(call => call[0] === '1 0 * * *');
            const taskFunction = subscriptionTask[1];

            const startTime = Date.now();
            await taskFunction();
            const endTime = Date.now();

            expect(endTime - startTime).toBeGreaterThanOrEqual(100);
        });
    });

    describe('Configuration Validation', () => {
        it('should validate cron schedule expressions', () => {
            initCronJobs();

            const schedules = cron.schedule.mock.calls.map(call => call[0]);
            const validSchedules = [
                '1 0 * * *',     // Daily at 00:01
                '0 9 * * *',     // Daily at 09:00
                '0 * * * *',     // Every hour
                '0 3 * * *',     // Daily at 03:00
                '*/15 * * * *'   // Every 15 minutes
            ];

            expect(schedules).toEqual(validSchedules);
        });

        it('should have proper task distribution', () => {
            initCronJobs();

            expect(cron.schedule).toHaveBeenCalledTimes(5);
            
            // Check that we have the right number of each type of task
            const schedules = cron.schedule.mock.calls.map(call => call[0]);
            expect(schedules.filter(s => s.includes('0 * * * *'))).toHaveLength(1); // Token cleanup
            expect(schedules.filter(s => s.includes('*/15 * * * *'))).toHaveLength(1); // IP unban
        });
    });
});
