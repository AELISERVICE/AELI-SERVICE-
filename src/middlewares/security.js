const { User, SecurityLog } = require('../models');
const { AppError } = require('./errorHandler');

/**
 * Session inactivity timeout in hours
 */
const SESSION_TIMEOUT_HOURS = parseInt(process.env.SESSION_TIMEOUT_HOURS) || 24;

/**
 * Account lockout duration in minutes
 */
const LOCKOUT_DURATION_MINUTES = 30;

/**
 * Maximum failed login attempts before lockout
 */
const MAX_FAILED_ATTEMPTS = 5;

/**
 * Maximum failed OTP attempts before lockout
 */
const MAX_OTP_ATTEMPTS = 3;

/**
 * Middleware to check if account is locked
 */
const checkAccountLock = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return next();

        const user = await User.findOne({ where: { email } });
        if (!user) return next();

        // Check if account is locked
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            const remainingMinutes = Math.ceil((new Date(user.lockedUntil) - new Date()) / (1000 * 60));

            await SecurityLog.logEvent({
                userId: user.id,
                eventType: 'unauthorized_access',
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                email: email,
                details: { reason: 'Account locked' },
                success: false,
                riskLevel: 'medium'
            });

            throw new AppError(
                `Compte temporairement verrouillé. Réessayez dans ${remainingMinutes} minutes.`,
                423
            );
        }

        // Unlock account if lockout period has passed
        if (user.lockedUntil && new Date(user.lockedUntil) <= new Date()) {
            user.lockedUntil = null;
            user.failedLoginAttempts = 0;
            await user.save({ fields: ['lockedUntil', 'failedLoginAttempts'] });
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Increment failed login attempts and lock account if needed
 */
const handleFailedLogin = async (user, req) => {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);

        await SecurityLog.logEvent({
            userId: user.id,
            eventType: 'account_locked',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            email: user.email,
            details: {
                failedAttempts: user.failedLoginAttempts,
                lockoutMinutes: LOCKOUT_DURATION_MINUTES
            },
            success: false,
            riskLevel: 'high'
        });
    }

    await user.save({ fields: ['failedLoginAttempts', 'lockedUntil'] });

    await SecurityLog.logEvent({
        userId: user.id,
        eventType: 'login_failed',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        email: user.email,
        success: false,
        riskLevel: user.failedLoginAttempts >= 3 ? 'medium' : 'low'
    });
};

/**
 * Reset failed login attempts on successful login
 */
const handleSuccessfulLogin = async (user, req) => {
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLogin = new Date();
    user.lastActivity = new Date();
    await user.save({ fields: ['failedLoginAttempts', 'lockedUntil', 'lastLogin', 'lastActivity'] });

    await SecurityLog.logEvent({
        userId: user.id,
        eventType: 'login_success',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        email: user.email,
        success: true,
        riskLevel: 'low'
    });
};

/**
 * Middleware to check session inactivity
 */
const checkSessionActivity = async (req, res, next) => {
    try {
        if (!req.user) return next();

        const lastActivity = req.user.lastActivity;
        const now = new Date();

        if (lastActivity) {
            const hoursSinceActivity = (now - new Date(lastActivity)) / (1000 * 60 * 60);

            if (hoursSinceActivity > SESSION_TIMEOUT_HOURS) {
                await SecurityLog.logEvent({
                    userId: req.user.id,
                    eventType: 'session_expired',
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                    email: req.user.email,
                    details: { hoursSinceActivity: hoursSinceActivity.toFixed(2) },
                    success: false,
                    riskLevel: 'low'
                });

                return res.status(401).json({
                    success: false,
                    message: 'Session expirée. Veuillez vous reconnecter.',
                    code: 'SESSION_EXPIRED'
                });
            }
        }

        // Update last activity
        await User.update(
            { lastActivity: now },
            { where: { id: req.user.id } }
        );

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to require email verification for certain routes
 */
const requireEmailVerification = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            success: false,
            message: 'Veuillez vérifier votre email pour accéder à cette fonctionnalité.',
            code: 'EMAIL_NOT_VERIFIED'
        });
    }
    next();
};

/**
 * Handle failed OTP verification
 */
const handleFailedOTP = async (user, req) => {
    user.otpAttempts = (user.otpAttempts || 0) + 1;

    await SecurityLog.logEvent({
        userId: user.id,
        eventType: 'otp_failed',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        email: user.email,
        details: { attempts: user.otpAttempts },
        success: false,
        riskLevel: user.otpAttempts >= 2 ? 'medium' : 'low'
    });

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
        // Invalidate OTP after too many attempts
        user.otpCode = null;
        user.otpExpires = null;
        await user.save({ fields: ['otpCode', 'otpExpires', 'otpAttempts'] });
        return false; // Needs new OTP
    }

    await user.save({ fields: ['otpAttempts'] });
    return true; // Can still retry
};

/**
 * Handle successful OTP verification
 */
const handleSuccessfulOTP = async (user, req) => {
    user.isEmailVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save({ fields: ['isEmailVerified', 'otpCode', 'otpExpires', 'otpAttempts'] });

    await SecurityLog.logEvent({
        userId: user.id,
        eventType: 'otp_verified',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        email: user.email,
        success: true,
        riskLevel: 'low'
    });
};

/**
 * Log security event helper
 */
const logSecurityEvent = async (eventType, req, userId = null, details = {}, success = true, riskLevel = 'low') => {
    await SecurityLog.logEvent({
        userId,
        eventType,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        email: req.body?.email || req.user?.email,
        details,
        success,
        riskLevel
    });
};

module.exports = {
    checkAccountLock,
    handleFailedLogin,
    handleSuccessfulLogin,
    checkSessionActivity,
    requireEmailVerification,
    handleFailedOTP,
    handleSuccessfulOTP,
    logSecurityEvent,
    MAX_FAILED_ATTEMPTS,
    MAX_OTP_ATTEMPTS,
    LOCKOUT_DURATION_MINUTES,
    SESSION_TIMEOUT_HOURS
};
