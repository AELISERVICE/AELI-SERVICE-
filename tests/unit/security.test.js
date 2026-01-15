/**
 * Unit Tests for Security Middleware
 * Tests account lockout, OTP handling, and session management
 */

// Mock dependencies
jest.mock('../../src/models', () => ({
    User: {
        findOne: jest.fn(),
        update: jest.fn()
    },
    SecurityLog: {
        logEvent: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockResolvedValue({})
    }
}));

const { User, SecurityLog } = require('../../src/models');
const {
    handleFailedLogin,
    handleSuccessfulLogin,
    handleFailedOTP,
    handleSuccessfulOTP,
    logSecurityEvent,
    MAX_FAILED_ATTEMPTS,
    MAX_OTP_ATTEMPTS,
    LOCKOUT_DURATION_MINUTES
} = require('../../src/middlewares/security');

describe('Security Middleware', () => {
    let mockUser;
    let mockReq;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock user object
        mockUser = {
            id: 'user-uuid-123',
            email: 'test@example.com',
            failedLoginAttempts: 0,
            lockedUntil: null,
            otpAttempts: 0,
            otpCode: 'hashed-otp',
            otpExpires: new Date(Date.now() + 600000),
            isEmailVerified: false,
            lastLogin: null,
            lastActivity: null,
            save: jest.fn().mockResolvedValue(true)
        };

        // Mock request object
        mockReq = {
            ip: '127.0.0.1',
            body: { email: 'test@example.com' },
            user: { id: 'user-uuid-123', email: 'test@example.com' },
            get: jest.fn().mockReturnValue('Mozilla/5.0 Test Browser')
        };
    });

    describe('Constants', () => {
        test('MAX_FAILED_ATTEMPTS should be 5', () => {
            expect(MAX_FAILED_ATTEMPTS).toBe(5);
        });

        test('MAX_OTP_ATTEMPTS should be 3', () => {
            expect(MAX_OTP_ATTEMPTS).toBe(3);
        });

        test('LOCKOUT_DURATION_MINUTES should be 30', () => {
            expect(LOCKOUT_DURATION_MINUTES).toBe(30);
        });
    });

    describe('handleFailedLogin()', () => {
        test('should increment failed login attempts', async () => {
            mockUser.failedLoginAttempts = 0;

            await handleFailedLogin(mockUser, mockReq);

            expect(mockUser.failedLoginAttempts).toBe(1);
            expect(mockUser.save).toHaveBeenCalled();
        });

        test('should lock account after MAX_FAILED_ATTEMPTS', async () => {
            mockUser.failedLoginAttempts = MAX_FAILED_ATTEMPTS - 1;

            await handleFailedLogin(mockUser, mockReq);

            expect(mockUser.failedLoginAttempts).toBe(MAX_FAILED_ATTEMPTS);
            expect(mockUser.lockedUntil).toBeDefined();
            expect(mockUser.lockedUntil).toBeInstanceOf(Date);
        });

        test('should log security event for failed login', async () => {
            await handleFailedLogin(mockUser, mockReq);

            expect(SecurityLog.logEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: mockUser.id,
                    eventType: 'login_failed',
                    success: false
                })
            );
        });

        test('should log high risk event when account is locked', async () => {
            mockUser.failedLoginAttempts = MAX_FAILED_ATTEMPTS - 1;

            await handleFailedLogin(mockUser, mockReq);

            expect(SecurityLog.logEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'account_locked',
                    riskLevel: 'high'
                })
            );
        });

        test('should set correct lockout duration', async () => {
            mockUser.failedLoginAttempts = MAX_FAILED_ATTEMPTS - 1;
            const beforeLockout = Date.now();

            await handleFailedLogin(mockUser, mockReq);

            const expectedLockoutEnd = beforeLockout + (LOCKOUT_DURATION_MINUTES * 60 * 1000);
            expect(mockUser.lockedUntil.getTime()).toBeGreaterThanOrEqual(beforeLockout);
            expect(mockUser.lockedUntil.getTime()).toBeLessThanOrEqual(expectedLockoutEnd + 1000);
        });
    });

    describe('handleSuccessfulLogin()', () => {
        test('should reset failed login attempts to 0', async () => {
            mockUser.failedLoginAttempts = 3;

            await handleSuccessfulLogin(mockUser, mockReq);

            expect(mockUser.failedLoginAttempts).toBe(0);
        });

        test('should clear lockedUntil', async () => {
            mockUser.lockedUntil = new Date();

            await handleSuccessfulLogin(mockUser, mockReq);

            expect(mockUser.lockedUntil).toBeNull();
        });

        test('should update lastLogin timestamp', async () => {
            const beforeLogin = new Date();

            await handleSuccessfulLogin(mockUser, mockReq);

            expect(mockUser.lastLogin).toBeDefined();
            expect(mockUser.lastLogin.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
        });

        test('should update lastActivity timestamp', async () => {
            await handleSuccessfulLogin(mockUser, mockReq);

            expect(mockUser.lastActivity).toBeDefined();
        });

        test('should log successful login event', async () => {
            await handleSuccessfulLogin(mockUser, mockReq);

            expect(SecurityLog.logEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: mockUser.id,
                    eventType: 'login_success',
                    success: true,
                    riskLevel: 'low'
                })
            );
        });
    });

    describe('handleFailedOTP()', () => {
        test('should increment OTP attempts', async () => {
            mockUser.otpAttempts = 0;

            await handleFailedOTP(mockUser, mockReq);

            expect(mockUser.otpAttempts).toBe(1);
        });

        test('should return true if retries allowed', async () => {
            mockUser.otpAttempts = 0;

            const canRetry = await handleFailedOTP(mockUser, mockReq);

            expect(canRetry).toBe(true);
        });

        test('should return false and invalidate OTP after MAX_OTP_ATTEMPTS', async () => {
            mockUser.otpAttempts = MAX_OTP_ATTEMPTS - 1;

            const canRetry = await handleFailedOTP(mockUser, mockReq);

            expect(canRetry).toBe(false);
            expect(mockUser.otpCode).toBeNull();
            expect(mockUser.otpExpires).toBeNull();
        });

        test('should log failed OTP event', async () => {
            await handleFailedOTP(mockUser, mockReq);

            expect(SecurityLog.logEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'otp_failed',
                    success: false
                })
            );
        });

        test('should increase risk level as attempts increase', async () => {
            mockUser.otpAttempts = 1;

            await handleFailedOTP(mockUser, mockReq);

            expect(SecurityLog.logEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    riskLevel: 'medium'
                })
            );
        });
    });

    describe('handleSuccessfulOTP()', () => {
        test('should set isEmailVerified to true', async () => {
            await handleSuccessfulOTP(mockUser, mockReq);

            expect(mockUser.isEmailVerified).toBe(true);
        });

        test('should clear OTP fields', async () => {
            await handleSuccessfulOTP(mockUser, mockReq);

            expect(mockUser.otpCode).toBeNull();
            expect(mockUser.otpExpires).toBeNull();
            expect(mockUser.otpAttempts).toBe(0);
        });

        test('should log successful OTP verification', async () => {
            await handleSuccessfulOTP(mockUser, mockReq);

            expect(SecurityLog.logEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'otp_verified',
                    success: true
                })
            );
        });
    });

    describe('logSecurityEvent()', () => {
        test('should log event with correct parameters', async () => {
            await logSecurityEvent('custom_event', mockReq, 'user-123', { custom: 'data' }, true, 'medium');

            expect(SecurityLog.logEvent).toHaveBeenCalledWith({
                userId: 'user-123',
                eventType: 'custom_event',
                ipAddress: '127.0.0.1',
                userAgent: 'Mozilla/5.0 Test Browser',
                email: 'test@example.com',
                details: { custom: 'data' },
                success: true,
                riskLevel: 'medium'
            });
        });

        test('should use default values when not provided', async () => {
            await logSecurityEvent('simple_event', mockReq);

            expect(SecurityLog.logEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: null,
                    details: {},
                    success: true,
                    riskLevel: 'low'
                })
            );
        });
    });
});
