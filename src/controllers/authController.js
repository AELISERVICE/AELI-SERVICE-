const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Provider, RefreshToken } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { sendEmail } = require('../config/email');
const { welcomeEmail, passwordResetEmail } = require('../utils/emailTemplates');
const { generateResetToken, hashToken, successResponse } = require('../utils/helpers');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired, otpEmailTemplate } = require('../utils/otp');
const {
    handleFailedLogin,
    handleSuccessfulLogin,
    handleFailedOTP,
    handleSuccessfulOTP,
    logSecurityEvent
} = require('../middlewares/security');

/**
 * Generate access token (short-lived)
 */
const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId, type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
    );
};

/**
 * Generate refresh token (long-lived)
 */
const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString('hex');
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new AppError('Un compte avec cet email existe déjà', 400);
    }

    // Create user (email not verified)
    const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: role || 'client',
        isEmailVerified: false
    });

    // Generate and send OTP
    const otp = generateOTP();
    user.otpCode = await hashOTP(otp);
    user.otpExpires = getOTPExpiry();
    user.otpAttempts = 0;
    await user.save({ fields: ['otpCode', 'otpExpires', 'otpAttempts'] });

    // Send OTP email
    await sendEmail({
        to: user.email,
        ...otpEmailTemplate({ firstName: user.firstName, otp })
    });

    await logSecurityEvent('otp_sent', req, user.id, { action: 'registration' }, true);

    successResponse(res, 201, 'Inscription réussie. Vérifiez votre email pour le code OTP.', {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            role: user.role,
            isEmailVerified: false
        },
        requiresOTP: true
    });
});

/**
 * @desc    Verify OTP code
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTPCode = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new AppError('Utilisateur non trouvé', 404);
    }

    if (user.isEmailVerified) {
        throw new AppError('Email déjà vérifié', 400);
    }

    if (!user.otpCode || !user.otpExpires) {
        throw new AppError('Aucun code OTP en attente. Demandez un nouveau code.', 400);
    }

    if (isOTPExpired(user.otpExpires)) {
        throw new AppError('Code OTP expiré. Demandez un nouveau code.', 400);
    }

    const isValid = await verifyOTP(otp, user.otpCode);
    if (!isValid) {
        const canRetry = await handleFailedOTP(user, req);
        if (!canRetry) {
            throw new AppError('Trop de tentatives. Demandez un nouveau code.', 400);
        }
        throw new AppError(`Code OTP invalide. ${3 - user.otpAttempts} tentative(s) restante(s).`, 400);
    }

    // OTP is valid
    await handleSuccessfulOTP(user, req);

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();

    // Save refresh token
    await RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: req.get('user-agent'),
        ipAddress: req.ip
    });

    // Send welcome email
    sendEmail({
        to: user.email,
        ...welcomeEmail({ firstName: user.firstName, role: user.role })
    }).catch(err => console.error('Welcome email error:', err.message));

    successResponse(res, 200, 'Email vérifié avec succès', {
        user: user.toPublicJSON(),
        accessToken,
        refreshToken
    });
});

/**
 * @desc    Resend OTP code
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        // Don't reveal if user exists
        return successResponse(res, 200, 'Si un compte existe, un nouveau code a été envoyé.');
    }

    if (user.isEmailVerified) {
        throw new AppError('Email déjà vérifié', 400);
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otpCode = await hashOTP(otp);
    user.otpExpires = getOTPExpiry();
    user.otpAttempts = 0;
    await user.save({ fields: ['otpCode', 'otpExpires', 'otpAttempts'] });

    // Send OTP email
    await sendEmail({
        to: user.email,
        ...otpEmailTemplate({ firstName: user.firstName, otp })
    });

    await logSecurityEvent('otp_sent', req, user.id, { action: 'resend' }, true);

    successResponse(res, 200, 'Nouveau code OTP envoyé.');
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Check if account is active
    if (!user.isActive) {
        throw new AppError('Ce compte a été désactivé', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        await handleFailedLogin(user, req);
        throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
        // Generate new OTP for unverified users
        const otp = generateOTP();
        user.otpCode = await hashOTP(otp);
        user.otpExpires = getOTPExpiry();
        user.otpAttempts = 0;
        await user.save({ fields: ['otpCode', 'otpExpires', 'otpAttempts'] });

        await sendEmail({
            to: user.email,
            ...otpEmailTemplate({ firstName: user.firstName, otp })
        });

        return successResponse(res, 200, 'Veuillez vérifier votre email avec le code OTP envoyé.', {
            requiresOTP: true,
            email: user.email
        });
    }

    // Login successful
    await handleSuccessfulLogin(user, req);

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();

    // Save refresh token
    await RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: req.get('user-agent'),
        ipAddress: req.ip
    });

    // Get provider profile if exists
    let provider = null;
    if (user.role === 'provider') {
        provider = await Provider.findOne({ where: { userId: user.id } });
    }

    successResponse(res, 200, 'Connexion réussie', {
        user: user.toPublicJSON(),
        provider: provider ? {
            id: provider.id,
            businessName: provider.businessName,
            isVerified: provider.isVerified
        } : null,
        accessToken,
        refreshToken
    });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AppError('Refresh token requis', 400);
    }

    // Find refresh token
    const tokenRecord = await RefreshToken.findOne({
        where: { token: refreshToken, isRevoked: false }
    });

    if (!tokenRecord) {
        throw new AppError('Refresh token invalide', 401);
    }

    // Check if expired
    if (new Date() > tokenRecord.expiresAt) {
        tokenRecord.isRevoked = true;
        tokenRecord.revokedAt = new Date();
        await tokenRecord.save();
        throw new AppError('Refresh token expiré', 401);
    }

    // Update last used
    tokenRecord.lastUsedAt = new Date();
    await tokenRecord.save({ fields: ['lastUsedAt'] });

    // Generate new access token
    const accessToken = generateAccessToken(tokenRecord.userId);

    await logSecurityEvent('token_refresh', req, tokenRecord.userId, {}, true);

    successResponse(res, 200, 'Token rafraîchi', { accessToken });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        // Revoke specific refresh token
        await RefreshToken.update(
            { isRevoked: true, revokedAt: new Date() },
            { where: { token: refreshToken, userId: req.user.id } }
        );
    }

    await logSecurityEvent('logout', req, req.user.id, {}, true);

    successResponse(res, 200, 'Déconnexion réussie');
});

/**
 * @desc    Logout from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
const logoutAll = asyncHandler(async (req, res) => {
    await RefreshToken.revokeAllForUser(req.user.id);

    await logSecurityEvent('logout', req, req.user.id, { allDevices: true }, true);

    successResponse(res, 200, 'Déconnexion de tous les appareils réussie');
});

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
        // Don't reveal if email exists
        return successResponse(res, 200, 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé');
    }

    // Generate reset token
    const { resetToken, hashedToken } = generateResetToken();

    // Save hashed token to database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ fields: ['resetPasswordToken', 'resetPasswordExpires'] });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await logSecurityEvent('password_reset_request', req, user.id, {}, true);

    // Send email
    try {
        await sendEmail({
            to: user.email,
            ...passwordResetEmail({ firstName: user.firstName, resetUrl })
        });

        successResponse(res, 200, 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé');
    } catch (error) {
        // Clear reset token if email fails
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save({ fields: ['resetPasswordToken', 'resetPasswordExpires'] });
        throw new AppError('Erreur lors de l\'envoi de l\'email. Réessayez plus tard.', 500);
    }
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token from URL
    const hashedToken = hashToken(token);

    // Find user with valid token
    const { Op } = require('sequelize');
    const user = await User.findOne({
        where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { [Op.gt]: new Date() }
        }
    });

    if (!user) {
        throw new AppError('Token invalide ou expiré', 400);
    }

    // Update password and clear token
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Revoke all refresh tokens for security
    await RefreshToken.revokeAllForUser(user.id);

    await logSecurityEvent('password_reset_success', req, user.id, {}, true);

    // Generate new tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();

    await RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.get('user-agent'),
        ipAddress: req.ip
    });

    successResponse(res, 200, 'Mot de passe réinitialisé avec succès', {
        accessToken,
        refreshToken
    });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'otpCode', 'otpExpires'] },
        include: [
            {
                model: Provider,
                as: 'provider',
                required: false
            }
        ]
    });

    if (!user) {
        throw new AppError('Utilisateur non trouvé', 404);
    }

    successResponse(res, 200, 'Profil récupéré', {
        user: user.toPublicJSON(),
        provider: user.provider || null
    });
});

module.exports = {
    register,
    verifyOTPCode,
    resendOTP,
    login,
    refreshAccessToken,
    logout,
    logoutAll,
    forgotPassword,
    resetPassword,
    getMe
};
