const { Review, Provider, User } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { successResponse, getPaginationParams, getPaginationData } = require('../utils/helpers');
const { sendEmail } = require('../config/email');
const { newReviewEmail } = require('../utils/emailTemplates');
const cache = require('../config/redis');
const { emitNewReview } = require('../config/socket');

/**
 * @desc    Create a review
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = asyncHandler(async (req, res) => {
    const { providerId, rating, comment } = req.body;

    // Check if provider exists
    const provider = await Provider.findByPk(providerId, {
        include: [{ model: User, as: 'user' }]
    });
    if (!provider) {
        throw new AppError('Prestataire non trouvé', 404);
    }

    // Check if user is not reviewing themselves
    if (provider.userId === req.user.id) {
        throw new AppError('Vous ne pouvez pas vous auto-évaluer', 400);
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
        where: { userId: req.user.id, providerId }
    });
    if (existingReview) {
        throw new AppError('Vous avez déjà laissé un avis pour ce prestataire', 400);
    }

    // Create review
    const review = await Review.create({
        userId: req.user.id,
        providerId,
        rating,
        comment
    });

    // Update provider rating
    await provider.updateRating(rating, true);

    // Invalidate reviews cache
    await cache.delByPattern(`reviews:provider:${providerId}:*`);
    await cache.del(cache.cacheKeys.provider(providerId));

    // Send WebSocket notification
    emitNewReview(providerId, {
        id: review.id,
        rating,
        comment,
        reviewer: `${req.user.firstName} ${req.user.lastName}`
    });

    // Send email notification to provider (async)
    if (provider.user && provider.user.email) {
        sendEmail({
            to: provider.user.email,
            ...newReviewEmail({
                providerName: provider.businessName,
                reviewerName: `${req.user.firstName} ${req.user.lastName}`,
                rating,
                comment
            })
        }).catch(err => console.error('Review notification email error:', err.message));
    }

    successResponse(res, 201, 'Avis créé avec succès', { review });
});

/**
 * @desc    Get reviews for a provider
 * @route   GET /api/reviews/provider/:providerId
 * @access  Public
 */
const getProviderReviews = asyncHandler(async (req, res) => {
    const { providerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Try cache first
    const cacheKey = cache.cacheKeys.reviews(providerId, page);
    const cached = await cache.get(cacheKey);
    if (cached) {
        return successResponse(res, 200, 'Avis du prestataire', cached);
    }

    const { limit: queryLimit, offset } = getPaginationParams(page, limit);

    const { count, rows: reviews } = await Review.findAndCountAll({
        where: {
            providerId,
            isVisible: true
        },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'profilePhoto']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: queryLimit,
        offset
    });

    const pagination = getPaginationData(page, queryLimit, count);

    const responseData = { reviews, pagination };

    // Cache for 5 minutes
    await cache.set(cacheKey, responseData, 300);

    successResponse(res, 200, 'Avis du prestataire', responseData);
});

/**
 * @desc    Update own review
 * @route   PUT /api/reviews/:id
 * @access  Private (owner only)
 */
const updateReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(id);
    if (!review) {
        throw new AppError('Avis non trouvé', 404);
    }

    // Check ownership
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Non autorisé à modifier cet avis', 403);
    }

    const oldRating = review.rating;

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    // Recalculate provider rating if rating changed
    if (rating && rating !== oldRating) {
        const provider = await Provider.findByPk(review.providerId);
        if (provider) {
            await provider.updateRating(null, false); // Recalculate from all reviews
        }
    }

    successResponse(res, 200, 'Avis mis à jour', { review });
});

/**
 * @desc    Delete own review
 * @route   DELETE /api/reviews/:id
 * @access  Private (owner or admin)
 */
const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
        throw new AppError('Avis non trouvé', 404);
    }

    // Check ownership
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Non autorisé à supprimer cet avis', 403);
    }

    const providerId = review.providerId;
    await review.destroy();

    // Recalculate provider rating
    const provider = await Provider.findByPk(providerId);
    if (provider) {
        await provider.updateRating(null, false);
    }

    successResponse(res, 200, 'Avis supprimé');
});

module.exports = {
    createReview,
    getProviderReviews,
    updateReview,
    deleteReview
};
