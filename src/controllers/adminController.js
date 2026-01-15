const { Op } = require('sequelize');
const { User, Provider, Service, Review, Contact, Category } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { i18nResponse, getPaginationParams, getPaginationData } = require('../utils/helpers');
const { sendEmail } = require('../config/email');
const { accountVerifiedEmail } = require('../utils/emailTemplates');

/**
 * @desc    Get platform statistics
 * @route   GET /api/admin/stats
 * @access  Private (admin)
 */
const getStats = asyncHandler(async (req, res) => {
    // Users stats
    const totalUsers = await User.count();
    const totalClients = await User.count({ where: { role: 'client' } });
    const totalProviderUsers = await User.count({ where: { role: 'provider' } });

    // Providers stats
    const totalProviders = await Provider.count();
    const totalActiveProviders = await Provider.count({ where: { isVerified: true } });
    const totalPendingProviders = await Provider.count({ where: { isVerified: false } });
    const totalFeaturedProviders = await Provider.count({ where: { isFeatured: true } });

    // Services stats
    const totalServices = await Service.count({ where: { isActive: true } });

    // Reviews stats
    const totalReviews = await Review.count({ where: { isVisible: true } });
    const avgRating = await Review.findOne({
        attributes: [
            [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating']
        ],
        where: { isVisible: true },
        raw: true
    });

    // Contacts stats
    const totalContacts = await Contact.count();
    const pendingContacts = await Contact.count({ where: { status: 'pending' } });

    // Recent data
    const recentUsers = await User.findAll({
        attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 5
    });

    const recentProviders = await Provider.findAll({
        include: [
            { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
    });

    i18nResponse(req, res, 200, 'admin.stats', {
        users: {
            total: totalUsers,
            clients: totalClients,
            providers: totalProviderUsers
        },
        providers: {
            total: totalProviders,
            active: totalActiveProviders,
            pending: totalPendingProviders,
            featured: totalFeaturedProviders
        },
        services: {
            total: totalServices
        },
        reviews: {
            total: totalReviews,
            averageRating: parseFloat(avgRating?.avgRating || 0).toFixed(2)
        },
        contacts: {
            total: totalContacts,
            pending: pendingContacts
        },
        recentUsers,
        recentProviders
    });
});

/**
 * @desc    Get pending providers
 * @route   GET /api/admin/providers/pending
 * @access  Private (admin)
 */
const getPendingProviders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { limit: queryLimit, offset } = getPaginationParams(page, limit);

    const { count, rows: providers } = await Provider.findAndCountAll({
        where: { isVerified: false },
        include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }
        ],
        order: [['createdAt', 'ASC']],
        limit: queryLimit,
        offset
    });

    const pagination = getPaginationData(page, queryLimit, count);

    i18nResponse(req, res, 200, 'admin.providersUnderReview', { providers, pagination });
});

/**
 * @desc    Verify/reject a provider
 * @route   PUT /api/admin/providers/:id/verify
 * @access  Private (admin)
 */
const verifyProvider = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isVerified } = req.body;

    const provider = await Provider.findByPk(id, {
        include: [{ model: User, as: 'user' }]
    });

    if (!provider) {
        throw new AppError(req.t('provider.notFound'), 404);
    }

    provider.isVerified = isVerified;
    await provider.save({ fields: ['isVerified'] });

    // Send email notification if verified
    if (isVerified && provider.user) {
        sendEmail({
            to: provider.user.email,
            ...accountVerifiedEmail({
                firstName: provider.user.firstName,
                businessName: provider.businessName
            })
        }).catch(err => console.error('Verification email error:', err.message));
    }

    i18nResponse(req, res, 200, isVerified ? 'provider.verified' : 'provider.rejected', { provider });
});

/**
 * @desc    Toggle featured status
 * @route   PUT /api/admin/providers/:id/feature
 * @access  Private (admin)
 */
const featureProvider = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const provider = await Provider.findByPk(id, {
        include: [{ model: User, as: 'user' }]
    });
    if (!provider) {
        throw new AppError(req.t('provider.notFound'), 404);
    }

    provider.isFeatured = isFeatured;
    await provider.save({ fields: ['isFeatured'] });

    // Send email notification to provider
    if (provider.user && provider.user.email) {
        const { providerFeaturedEmail } = require('../utils/emailTemplates');
        sendEmail({
            to: provider.user.email,
            ...providerFeaturedEmail({
                firstName: provider.user.firstName,
                businessName: provider.businessName,
                featured: isFeatured
            })
        }).catch(err => console.error('Feature email error:', err.message));
    }

    i18nResponse(req, res, 200, isFeatured ? 'provider.featured' : 'provider.unfeatured', { provider });
});

/**
 * @desc    Activate/deactivate user account
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (admin)
 */
const updateUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
        throw new AppError(req.t('user.notFound'), 404);
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id) {
        throw new AppError(req.t('admin.cannotDeactivateSelf'), 400);
    }

    user.isActive = isActive;
    await user.save({ fields: ['isActive'] });

    i18nResponse(req, res, 200, isActive ? 'admin.userActivated' : 'admin.userDeactivated', {
        user: user.toPublicJSON()
    });
});

/**
 * @desc    Get all reviews (moderation)
 * @route   GET /api/admin/reviews
 * @access  Private (admin)
 */
const getAllReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, visible } = req.query;
    const { limit: queryLimit, offset } = getPaginationParams(page, limit);

    const where = {};
    if (visible !== undefined) {
        where.isVisible = visible === 'true';
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
        where,
        include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
            { model: Provider, as: 'provider', attributes: ['id', 'businessName'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: queryLimit,
        offset
    });

    const pagination = getPaginationData(page, queryLimit, count);

    i18nResponse(req, res, 200, 'review.list', { reviews, pagination });
});

/**
 * @desc    Toggle review visibility
 * @route   PUT /api/admin/reviews/:id/visibility
 * @access  Private (admin)
 */
const updateReviewVisibility = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isVisible } = req.body;

    const review = await Review.findByPk(id);
    if (!review) {
        throw new AppError(req.t('review.notFound'), 404);
    }

    review.isVisible = isVisible;
    await review.save({ fields: ['isVisible'] });

    // Recalculate provider rating
    const provider = await Provider.findByPk(review.providerId);
    if (provider) {
        await provider.updateRating(null, false);
    }

    i18nResponse(req, res, 200, isVisible ? 'review.visible' : 'review.hidden', { review });
});

/**
 * @desc    Get all users (admin)
 * @route   GET /api/admin/users
 * @access  Private (admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;
    const { limit: queryLimit, offset } = getPaginationParams(page, limit);

    const where = {};
    if (role) where.role = role;
    if (search) {
        where[Op.or] = [
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows: users } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
        order: [['createdAt', 'DESC']],
        limit: queryLimit,
        offset
    });

    const pagination = getPaginationData(page, queryLimit, count);

    i18nResponse(req, res, 200, 'common.list', { users, pagination });
});

/**
 * @desc    Get providers with documents under review
 * @route   GET /api/admin/providers/under-review
 * @access  Private (admin)
 */
const getProvidersUnderReview = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { limit: queryLimit, offset } = getPaginationParams(page, limit);

    const { count, rows: providers } = await Provider.findAndCountAll({
        where: { verificationStatus: 'under_review' },
        include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }
        ],
        order: [['createdAt', 'ASC']],
        limit: queryLimit,
        offset
    });

    const pagination = getPaginationData(page, queryLimit, count);

    i18nResponse(req, res, 200, 'admin.providersUnderReview', { providers, pagination });
});

/**
 * @desc    Review provider documents (approve/reject)
 * @route   PUT /api/admin/providers/:id/review-documents
 * @access  Private (admin)
 */
const reviewProviderDocuments = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { decision, notes, approvedDocuments, rejectedDocuments } = req.body;
    // decision: 'approved' or 'rejected'
    // approvedDocuments: [indexes of approved docs]
    // rejectedDocuments: [indexes of rejected docs with reasons]

    const provider = await Provider.findByPk(id, {
        include: [{ model: User, as: 'user' }]
    });

    if (!provider) {
        throw new AppError(req.t('provider.notFound'), 404);
    }

    if (!['approved', 'rejected'].includes(decision)) {
        throw new AppError(req.t('common.badRequest'), 400);
    }

    // Update document statuses
    const documents = provider.documents || [];

    if (approvedDocuments && Array.isArray(approvedDocuments)) {
        approvedDocuments.forEach(idx => {
            if (documents[idx]) documents[idx].status = 'approved';
        });
    }

    if (rejectedDocuments && Array.isArray(rejectedDocuments)) {
        rejectedDocuments.forEach(item => {
            if (documents[item.index]) {
                documents[item.index].status = 'rejected';
                documents[item.index].rejectionReason = item.reason;
            }
        });
    }

    // Update provider verification status
    if (decision === 'approved') {
        provider.verificationStatus = 'approved';
        provider.isVerified = true;
        provider.verifiedAt = new Date();
        provider.verifiedBy = req.user.id;

        // Send approval email
        if (provider.user) {
            sendEmail({
                to: provider.user.email,
                ...accountVerifiedEmail({
                    firstName: provider.user.firstName,
                    businessName: provider.businessName
                })
            }).catch(err => console.error('Verification email error:', err.message));
        }
    } else {
        provider.verificationStatus = 'rejected';
        provider.isVerified = false;

        // Send rejection email
        if (provider.user) {
            const { documentsRejectedEmail } = require('../utils/emailTemplates');
            const rejectionReasons = rejectedDocuments
                ? rejectedDocuments.map(d => d.reason).filter(Boolean)
                : [];

            sendEmail({
                to: provider.user.email,
                ...documentsRejectedEmail({
                    firstName: provider.user.firstName,
                    businessName: provider.businessName,
                    reasons: rejectionReasons,
                    notes: notes
                })
            }).catch(err => console.error('Rejection email error:', err.message));
        }
    }

    provider.documents = documents;
    provider.verificationNotes = notes || null;
    await provider.save();

    i18nResponse(req, res, 200, decision === 'approved' ? 'documents.approved' : 'documents.rejected', {
        provider: {
            id: provider.id,
            businessName: provider.businessName,
            verificationStatus: provider.verificationStatus,
            isVerified: provider.isVerified,
            documents: provider.documents,
            verificationNotes: provider.verificationNotes
        }
    });
});

module.exports = {
    getStats,
    getPendingProviders,
    verifyProvider,
    featureProvider,
    updateUserStatus,
    getAllReviews,
    updateReviewVisibility,
    getAllUsers,
    getProvidersUnderReview,
    reviewProviderDocuments
};
