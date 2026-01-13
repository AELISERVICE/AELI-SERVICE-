const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login attempts
 * 5 attempts per 15 minutes
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: {
        success: false,
        message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip + '-' + (req.body.email || 'unknown');
    }
});

/**
 * Rate limiter for password reset requests
 * 3 attempts per hour
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts
    message: {
        success: false,
        message: 'Trop de demandes de réinitialisation. Veuillez réessayer dans 1 heure.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * General rate limiter for API requests
 * 100 requests per minute
 */
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests
    message: {
        success: false,
        message: 'Trop de requêtes. Veuillez ralentir.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for contact form submissions
 * 10 contacts per hour per IP
 */
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 contacts
    message: {
        success: false,
        message: 'Vous avez envoyé trop de messages. Veuillez réessayer plus tard.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for registration
 * 5 registrations per hour per IP
 */
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 registrations
    message: {
        success: false,
        message: 'Trop de tentatives d\'inscription. Veuillez réessayer plus tard.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for OTP verification
 * 3 attempts per 10 minutes
 */
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // 3 attempts
    message: {
        success: false,
        message: 'Trop de tentatives de vérification OTP. Veuillez réessayer dans 10 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip + '-otp-' + (req.body.email || 'unknown');
    }
});

/**
 * Rate limiter for resending OTP
 * 3 resends per hour
 */
const otpResendLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 resends
    message: {
        success: false,
        message: 'Trop de demandes de renvoi OTP. Veuillez réessayer dans 1 heure.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Strict rate limiter for sensitive operations
 * 10 requests per hour
 */
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        message: 'Trop de requêtes. Veuillez réessayer plus tard.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    passwordResetLimiter,
    generalLimiter,
    contactLimiter,
    registrationLimiter,
    otpLimiter,
    otpResendLimiter,
    strictLimiter
};
