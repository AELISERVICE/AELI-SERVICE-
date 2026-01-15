const { User, Provider } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { i18nResponse } = require('../utils/helpers');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');
const { sendEmail } = require('../config/email');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [
            {
                model: Provider,
                as: 'provider',
                required: false
            }
        ]
    });

    if (!user) {
        throw new AppError(req.t('user.notFound'), 404);
    }

    i18nResponse(req, res, 200, 'user.profile', {
        user: user.toPublicJSON(),
        provider: user.provider || null
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
        throw new AppError(req.t('user.notFound'), 404);
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    // Handle profile photo upload
    if (req.file) {
        // Delete old photo if exists
        if (user.profilePhoto) {
            const oldPublicId = getPublicIdFromUrl(user.profilePhoto);
            if (oldPublicId) {
                await deleteImage(oldPublicId).catch(err =>
                    console.error('Error deleting old photo:', err.message)
                );
            }
        }
        user.profilePhoto = req.file.path;
    }

    await user.save();

    i18nResponse(req, res, 200, 'user.profileUpdated', {
        user: user.toPublicJSON()
    });
});

/**
 * @desc    Change password
 * @route   PUT /api/users/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
        throw new AppError(req.t('user.notFound'), 404);
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw new AppError(req.t('user.incorrectPassword'), 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    const { passwordChangedConfirmationEmail } = require('../utils/emailTemplates');
    sendEmail({
        to: user.email,
        ...passwordChangedConfirmationEmail({ firstName: user.firstName })
    }).catch(err => console.error('Password change email error:', err.message));

    i18nResponse(req, res, 200, 'user.passwordChanged');
});

/**
 * @desc    Deactivate account (soft delete)
 * @route   DELETE /api/users/account
 * @access  Private
 */
const deactivateAccount = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    if (!user) {
        throw new AppError(req.t('user.notFound'), 404);
    }

    // Soft delete - just deactivate
    user.isActive = false;
    await user.save({ fields: ['isActive'] });

    i18nResponse(req, res, 200, 'user.accountDeactivated');
});

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    deactivateAccount
};
