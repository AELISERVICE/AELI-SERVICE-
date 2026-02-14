/**
 * Email Worker Unit Tests
 * Tests for email queue processing and job management
 */

const { initEmailWorker, queueEmailAsync, getEmailQueueStats, clearFailedJobs, pauseEmailQueue, resumeEmailQueue } = require('../../src/workers/emailWorker');

// Mock dependencies
jest.mock('../../src/config/queue');
jest.mock('../../src/config/email');
jest.mock('../../src/utils/logger');

const { emailQueue } = require('../../src/config/queue');
const { sendEmail } = require('../../src/config/email');
const logger = require('../../src/utils/logger');

describe('Email Worker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
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
        logger.debug = jest.fn();
        logger.error = jest.fn();
    });

    describe('initEmailWorker', () => {
        it('should initialize email worker with job processor', () => {
            const mockJob = {
                id: 'job-123',
                data: { to: 'test@example.com', subject: 'Test', html: '<p>Test</p>', text: 'Test' }
            };
            
            // Mock the process method to call the callback
            emailQueue.process.mockImplementation((type, callback) => {
                expect(type).toBe('send');
                callback(mockJob);
            });

            initEmailWorker();

            expect(emailQueue.process).toHaveBeenCalledWith('send', expect.any(Function));
            expect(emailQueue.on).toHaveBeenCalledWith('completed', expect.any(Function));
            expect(emailQueue.on).toHaveBeenCalledWith('failed', expect.any(Function));
            expect(logger.info).toHaveBeenCalledWith('📧 Initializing email worker...');
            expect(logger.info).toHaveBeenCalledWith('✅ Email worker initialized');
        });

        it('should process email job successfully', async () => {
            const mockJob = {
                id: 'job-123',
                data: { to: 'test@example.com', subject: 'Test', html: '<p>Test</p>', text: 'Test' }
            };
            
            // Mock the process method to call the callback
            emailQueue.process.mockImplementation((type, callback) => {
                expect(type).toBe('send');
                // Simulate the callback being called with the job
                setTimeout(() => callback(mockJob), 0);
            });

            // Mock the on method for completed event
            emailQueue.on.mockImplementation((event, callback) => {
                if (event === 'completed') {
                    setTimeout(() => callback(mockJob, { success: true }), 0);
                }
            });

            initEmailWorker();

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(sendEmail).toHaveBeenCalledWith({
                to: 'test@example.com',
                subject: 'Test',
                html: '<p>Test</p>',
                text: 'Test'
            });
            expect(logger.debug).toHaveBeenCalledWith('[EMAIL] Processing job job-123 to test@example.com');
            expect(logger.info).toHaveBeenCalledWith('[EMAIL] Sent to test@example.com: Test');
        });

        it('should handle email job failure', async () => {
            const mockJob = {
                id: 'job-123',
                data: { to: 'test@example.com', subject: 'Test', html: '<p>Test</p>', text: 'Test' },
                attemptsMade: 2
            };
            
            const error = new Error('SMTP failed');
            sendEmail.mockRejectedValue(error);
            
            emailQueue.process.mockImplementation((type, callback) => {
                setTimeout(() => callback(mockJob), 0);
            });

            // Mock the on method for failed event
            emailQueue.on.mockImplementation((event, callback) => {
                if (event === 'failed') {
                    setTimeout(() => callback(mockJob, error), 0);
                }
            });

            initEmailWorker();

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(logger.error).toHaveBeenCalledWith('[EMAIL] Failed to send to test@example.com:', 'SMTP failed');
        });

        it('should handle job completion', async () => {
            const mockJob = { 
                id: 'job-123',
                data: { to: 'test@example.com', subject: 'Test', html: '<p>Test</p>', text: 'Test' }
            };
            const result = { success: true };

            emailQueue.process.mockImplementation((type, callback) => {
                setTimeout(() => callback(mockJob), 0);
            });

            // Mock the on method for completed event
            emailQueue.on.mockImplementation((event, callback) => {
                if (event === 'completed') {
                    setTimeout(() => callback(mockJob, result), 0);
                }
            });

            initEmailWorker();

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(logger.debug).toHaveBeenCalledWith('[EMAIL] Job job-123 completed');
        });

        it('should handle job failure', async () => {
            const mockJob = { 
                id: 'job-123',
                data: { to: 'test@example.com', subject: 'Test', html: '<p>Test</p>', text: 'Test' },
                attemptsMade: 3
            };
            const error = new Error('Job failed');

            emailQueue.process.mockImplementation((type, callback) => {
                setTimeout(() => callback(mockJob), 0);
            });

            // Mock the on method for failed event
            emailQueue.on.mockImplementation((event, callback) => {
                if (event === 'failed') {
                    setTimeout(() => callback(mockJob, error), 0);
                }
            });

            initEmailWorker();

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(logger.error).toHaveBeenCalledWith('[EMAIL] Job job-123 failed after 3 attempts:', 'Job failed');
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

            expect(emailQueue.add).toHaveBeenCalledWith('send', emailData, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000
                },
                removeOnComplete: 100,
                removeOnFail: 500
            });
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
            
            const mockJob = { id: 'job-123' };
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
            await clearFailedJobs();

            expect(emailQueue.clean).toHaveBeenCalledWith(0, 'failed');
            expect(logger.info).toHaveBeenCalledWith('[EMAIL] Cleared failed jobs');
        });
    });

    describe('pauseEmailQueue', () => {
        it('should pause email queue', async () => {
            await pauseEmailQueue();

            expect(emailQueue.pause).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith('[EMAIL] Queue paused');
        });
    });

    describe('resumeEmailQueue', () => {
        it('should resume email queue', async () => {
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
            
            emailQueue.add.mockRejectedValue(new Error('Queue full'));
            
            await expect(queueEmailAsync(emailData)).rejects.toThrow('Queue full');
        });
    });
});
