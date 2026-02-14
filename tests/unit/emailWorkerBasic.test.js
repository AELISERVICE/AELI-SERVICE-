/**
 * Email Worker Basic Unit Tests
 * Tests for email worker functionality
 */

const { initEmailWorker, queueEmailAsync, getEmailQueueStats, clearFailedJobs, pauseEmailQueue, resumeEmailQueue } = require('../../src/workers/emailWorker');

// Mock dependencies
jest.mock('../../src/config/queue');
jest.mock('../../src/config/email');
jest.mock('../../src/utils/logger');

describe('Email Worker Basic', () => {
    let emailQueue, sendEmail, logger;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock dependencies
        emailQueue = require('../../src/config/queue').emailQueue;
        sendEmail = require('../../src/config/email').sendEmail;
        logger = require('../../src/utils/logger');
        
        // Mock queue methods
        emailQueue.process = jest.fn();
        emailQueue.on = jest.fn();
        emailQueue.add = jest.fn();
        emailQueue.getJobCounts = jest.fn();
        emailQueue.clean = jest.fn();
        emailQueue.pause = jest.fn();
        emailQueue.resume = jest.fn();
        
        // Mock email sending
        sendEmail.mockResolvedValue();
        
        // Mock logger
        logger.info = jest.fn();
        logger.error = jest.fn();
        logger.debug = jest.fn();
    });

    describe('initEmailWorker', () => {
        it('should initialize email worker', () => {
            initEmailWorker();

            expect(logger.info).toHaveBeenCalledWith('📧 Initializing email worker...');
            expect(logger.info).toHaveBeenCalledWith('✅ Email worker initialized');
            expect(emailQueue.process).toHaveBeenCalledWith('send', expect.any(Function));
            expect(emailQueue.on).toHaveBeenCalledWith('completed', expect.any(Function));
            expect(emailQueue.on).toHaveBeenCalledWith('failed', expect.any(Function));
        });
    });

    describe('queueEmailAsync', () => {
        it('should queue email with default options', async () => {
            const emailData = {
                to: 'test@example.com',
                subject: 'Test',
                html: '<p>Test</p>',
                text: 'Test'
            };
            
            const mockJob = { id: 'job-123' };
            emailQueue.add.mockResolvedValue(mockJob);

            const result = await queueEmailAsync(emailData);

            expect(emailQueue.add).toHaveBeenCalledWith('send', emailData, expect.objectContaining({
                attempts: 3,
                backoff: expect.objectContaining({
                    type: 'exponential',
                    delay: 2000
                })
            }));
            expect(logger.debug).toHaveBeenCalledWith('[EMAIL] Queued job job-123 to test@example.com');
            expect(result).toBe(mockJob);
        });

        it('should queue email with custom options', async () => {
            const emailData = {
                to: 'test@example.com',
                subject: 'Test',
                html: '<p>Test</p>',
                text: 'Test'
            };
            
            const options = {
                priority: 'high',
                delay: 5000
            };
            
            const mockJob = { id: 'job-456' };
            emailQueue.add.mockResolvedValue(mockJob);

            const result = await queueEmailAsync(emailData, options);

            expect(emailQueue.add).toHaveBeenCalledWith('send', emailData, expect.objectContaining({
                priority: 'high',
                delay: 5000
            }));
            expect(result).toBe(mockJob);
        });
    });

    describe('getEmailQueueStats', () => {
        it('should return queue statistics', async () => {
            const mockCounts = {
                waiting: 5,
                active: 2,
                completed: 100,
                failed: 3,
                delayed: 1
            };
            
            emailQueue.getJobCounts.mockResolvedValue(mockCounts);

            const stats = await getEmailQueueStats();

            expect(emailQueue.getJobCounts).toHaveBeenCalled();
            expect(stats).toEqual(mockCounts);
        });
    });

    describe('clearFailedJobs', () => {
        it('should clear failed jobs', async () => {
            emailQueue.clean.mockResolvedValue();

            await clearFailedJobs();

            expect(emailQueue.clean).toHaveBeenCalledWith(0, 'failed');
            expect(logger.info).toHaveBeenCalledWith('[EMAIL] Cleared failed jobs');
        });
    });

    describe('pauseEmailQueue', () => {
        it('should pause email queue', async () => {
            emailQueue.pause.mockResolvedValue();

            await pauseEmailQueue();

            expect(emailQueue.pause).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith('[EMAIL] Queue paused');
        });
    });

    describe('resumeEmailQueue', () => {
        it('should resume email queue', async () => {
            emailQueue.resume.mockResolvedValue();

            await resumeEmailQueue();

            expect(emailQueue.resume).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith('[EMAIL] Queue resumed');
        });
    });

    describe('Error Handling', () => {
        it('should handle queue initialization errors', () => {
            emailQueue.process.mockImplementation(() => {
                throw new Error('Queue initialization failed');
            });

            expect(() => initEmailWorker()).toThrow('Queue initialization failed');
        });

        it('should handle email sending errors in queue', async () => {
            const emailData = {
                to: 'test@example.com',
                subject: 'Test',
                html: '<p>Test</p>',
                text: 'Test'
            };
            
            const error = new Error('Queue full');
            emailQueue.add.mockRejectedValue(error);

            await expect(queueEmailAsync(emailData)).rejects.toThrow('Queue full');
        });

        it('should handle stats retrieval errors', async () => {
            emailQueue.getJobCounts.mockRejectedValue(new Error('Database error'));

            await expect(getEmailQueueStats()).rejects.toThrow('Database error');
        });
    });
});
