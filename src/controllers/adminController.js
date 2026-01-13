const { Op } = require('sequelize');
const { User, Provider, Service, Review, Contact, Category } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { successResponse, getPaginationParams, getPaginationData } = require('../utils/helpers');
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

    successResponse(res, 200, 'Statistiques de la plateforme', {
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

    successResponse(res, 200, 'Prestataires en attente', { providers, pagination });
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
        throw new AppError('Prestataire non trouvé', 404);
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

    successResponse(res, 200, isVerified ? 'Prestataire validé' : 'Prestataire rejeté', { provider });
});

/**
 * @desc    Toggle featured status
 * @route   PUT /api/admin/providers/:id/feature
 * @access  Private (admin)
 */
const featureProvider = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const provider = await Provider.findByPk(id);
    if (!provider) {
        throw new AppError('Prestataire non trouvé', 404);
    }

    provider.isFeatured = isFeatured;
    await provider.save({ fields: ['isFeatured'] });

    successResponse(res, 200, isFeatured ? 'Prestataire mis en avant' : 'Mise en avant retirée', { provider });
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
        throw new AppError('Utilisateur non trouvé', 404);
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id) {
        throw new AppError('Vous ne pouvez pas désactiver votre propre compte', 400);
    }

    user.isActive = isActive;
    await user.save({ fields: ['isActive'] });

    successResponse(res, 200, isActive ? 'Compte activé' : 'Compte désactivé', {
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

    successResponse(res, 200, 'Liste des avis', { reviews, pagination });
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
        throw new AppError('Avis non trouvé', 404);
    }

    review.isVisible = isVisible;
    await review.save({ fields: ['isVisible'] });

    // Recalculate provider rating
    const provider = await Provider.findByPk(review.providerId);
    if (provider) {
        await provider.updateRating(null, false);
    }

    successResponse(res, 200, isVisible ? 'Avis visible' : 'Avis masqué', { review });
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

    successResponse(res, 200, 'Liste des utilisateurs', { users, pagination });
});

module.exports = {
    getStats,
    getPendingProviders,
    verifyProvider,
    featureProvider,
    updateUserStatus,
    getAllReviews,
    updateReviewVisibility,
    getAllUsers
};
