/**
 * Processors Unit Tests
 * Tests for job processors and cron tasks
 */

const { 
    emailProcessor, 
    cleanupProcessor, 
    webhookProcessor, 
    analyticsProcessor 
} = require('../../src/jobs/processors');
const { sendEmail } = require('../../src/config/email');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('../../src/config/email');
jest.mock('../../src/utils/logger');

describe('Job Processors', () => {
    let sendEmail, logger, RefreshToken, AuditLog, SecurityLog, axios;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock dependencies
        sendEmail = require('../../src/config/email').sendEmail;
        logger = require('../../src/utils/logger');
        RefreshToken = require('../../src/models').RefreshToken;
        AuditLog = require('../../src/models').AuditLog;
        SecurityLog = require('../../src/models').SecurityLog;
        axios = require('axios');
        
        // Mock email sending
        sendEmail.mockResolvedValue();
        
        // Mock logger
        logger.info = jest.fn();
        logger.error = jest.fn();
        logger.debug = jest.fn();
        logger.warn = jest.fn();
        
        // Mock models
        RefreshToken.destroy = jest.fn();
        AuditLog.destroy = jest.fn();
        SecurityLog.destroy = jest.fn();
        
        // Mock axios
        axios.post = jest.fn();
    });

    describe('emailProcessor', () => {
        it('should process email job successfully', async () => {
            const job = {
                id: 'job-123',
                data: {
                    to: 'test@example.com',
                    subject: 'Test Subject',
                    html: '<p>Test HTML</p>',
                    text: 'Test text'
                }
            };

            const result = await emailProcessor(job);

            expect(sendEmail).toHaveBeenCalledWith({
                to: 'test@example.com',
                subject: 'Test Subject',
                html: '<p>Test HTML</p>',
                text: 'Test text'
            });
            expect(result).toEqual({
                success: true,
                to: 'test@example.com',
                subject: 'Test Subject'
            });
            expect(logger.debug).toHaveBeenCalledWith('Processing email job job-123 to test@example.com');
        });

        it('should handle email sending failure', async () => {
            const job = {
                id: 'job-123',
                data: {
                    to: 'test@example.com',
                    subject: 'Test Subject',
                    html: '<p>Test HTML</p>',
                    text: 'Test text'
                }
            };

            const error = new Error('SMTP failed');
            sendEmail.mockRejectedValue(error);

            await expect(emailProcessor(job)).rejects.toThrow('SMTP failed');
            expect(logger.error).toHaveBeenCalledWith('Email job job-123 failed:', 'SMTP failed');
        });

        it('should handle missing required fields', async () => {
            const job = {
                id: 'job-123',
                data: {
                    to: 'test@example.com',
                    // Missing subject
                }
            };

            const result = await emailProcessor(job);
            
            // The processor should still work but with undefined subject
            expect(result).toEqual({
                success: true,
                to: 'test@example.com',
                subject: undefined
            });
        });
    });

    describe('cleanupProcessor', () => {
        it('should cleanup expired tokens', async () => {
            const job = {
                id: 'job-456',
                name: 'expired-tokens',
                data: {}
            };

            const mockDestroyed = 5;
            RefreshToken.destroy.mockResolvedValue(mockDestroyed);

            const result = await cleanupProcessor(job);

            expect(RefreshToken.destroy).toHaveBeenCalledWith({
                where: expect.any(Object)
            });
            expect(result).toEqual({
                cleaned: mockDestroyed,
                type: 'tokens'
            });
        });

        it('should cleanup old audit logs', async () => {
            const job = {
                id: 'job-456',
                name: 'old-audit-logs',
                data: { daysToKeep: 30 }
            };

            const mockDestroyed = 10;
            AuditLog.destroy.mockResolvedValue(mockDestroyed);

            const result = await cleanupProcessor(job);

            expect(AuditLog.destroy).toHaveBeenCalledWith({
                where: expect.any(Object)
            });
            expect(result).toEqual({
                cleaned: mockDestroyed,
                type: 'audit-logs'
            });
        });

        it('should cleanup old security logs', async () => {
            const job = {
                id: 'job-456',
                name: 'old-security-logs',
                data: { daysToKeep: 7 }
            };

            const mockDestroyed = 3;
            SecurityLog.destroy.mockResolvedValue(mockDestroyed);

            const result = await cleanupProcessor(job);

            expect(SecurityLog.destroy).toHaveBeenCalledWith({
                where: expect.any(Object)
            });
            expect(result).toEqual({
                cleaned: mockDestroyed,
                type: 'security-logs'
            });
        });

        it('should handle unknown cleanup job type', async () => {
            const job = {
                id: 'job-456',
                name: 'unknown-job',
                data: {}
            };

            const result = await cleanupProcessor(job);

            expect(result).toEqual({
                skipped: true
            });
            expect(logger.warn).toHaveBeenCalledWith('Unknown cleanup job type: unknown-job');
        });

        it('should handle cleanup errors', async () => {
            const job = {
                id: 'job-456',
                name: 'expired-tokens',
                data: {}
            };

            const error = new Error('Database error');
            RefreshToken.destroy.mockRejectedValue(error);

            await expect(cleanupProcessor(job)).rejects.toThrow('Database error');
            expect(logger.error).toHaveBeenCalledWith('Cleanup job expired-tokens failed:', 'Database error');
        });
    });

    describe('webhookProcessor', () => {
        it('should process webhook successfully', async () => {
            const job = {
                id: 'job-789',
                data: {
                    url: 'https://example.com/webhook',
                    event: 'payment.completed',
                    payload: { paymentId: 'pay-123' },
                    secret: 'webhook-secret'
                }
            };

            const mockResponse = { status: 200 };
            axios.post.mockResolvedValue(mockResponse);

            const result = await webhookProcessor(job);

            expect(axios.post).toHaveBeenCalledWith(
                'https://example.com/webhook',
                {
                    event: 'payment.completed',
                    timestamp: expect.any(Number),
                    payload: { paymentId: 'pay-123' }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Webhook-Signature': expect.any(String),
                        'X-Webhook-Timestamp': expect.any(String)
                    },
                    timeout: 30000
                }
            );
            expect(result).toEqual({
                success: true,
                status: 200,
                url: 'https://example.com/webhook',
                event: 'payment.completed'
            });
        });

        it('should handle webhook failure', async () => {
            const job = {
                id: 'job-789',
                data: {
                    url: 'https://example.com/webhook',
                    event: 'payment.failed',
                    payload: { paymentId: 'pay-123' }
                }
            };

            const error = new Error('Network error');
            axios.post.mockRejectedValue(error);

            await expect(webhookProcessor(job)).rejects.toThrow('Network error');
            expect(logger.error).toHaveBeenCalledWith('Webhook to https://example.com/webhook failed:', 'Network error');
        });

        it('should use default secret when none provided', async () => {
            const job = {
                id: 'job-789',
                data: {
                    url: 'https://example.com/webhook',
                    event: 'payment.completed',
                    payload: { paymentId: 'pay-123' }
                    // No secret provided
                }
            };

            const mockResponse = { status: 200 };
            axios.post.mockResolvedValue(mockResponse);

            await webhookProcessor(job);

            expect(axios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(Object),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-Webhook-Signature': expect.any(String)
                    })
                })
            );
        });
    });

    describe('analyticsProcessor', () => {
        it('should record analytics event', async () => {
            const job = {
                id: 'job-999',
                name: 'user.login',
                data: {
                    userId: 'user-123',
                    timestamp: new Date().toISOString()
                }
            };

            const result = await analyticsProcessor(job);

            expect(result).toEqual({
                recorded: true,
                event: 'user.login'
            });
            expect(logger.info).toHaveBeenCalledWith('Analytics event: user.login', job.data);
        });

        it('should handle different event types', async () => {
            const events = [
                { name: 'user.register', data: { userId: 'user-456' } },
                { name: 'payment.completed', data: { paymentId: 'pay-789' } },
                { name: 'contact.created', data: { contactId: 'contact-123' } }
            ];

            for (const event of events) {
                const job = { id: 'job-999', ...event };
                const result = await analyticsProcessor(job);
                expect(result).toEqual({
                    recorded: true,
                    event: event.name
                });
                expect(logger.info).toHaveBeenCalledWith(`Analytics event: ${event.name}`, event.data);
            }
        });
    });
});
