const { Favorite, Provider, User } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { i18nResponse, successResponse } = require('../utils/helpers');
const cache = require('../config/redis');

/**
 * @desc    Add provider to favorites
 * @route   POST /api/favorites
 * @access  Private
 */
const addFavorite = asyncHandler(async (req, res) => {
    const { providerId } = req.body;

    // Check if provider exists
    const provider = await Provider.findByPk(providerId);
    if (!provider) {
        throw new AppError(req.t('provider.notFound'), 404);
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
        where: { userId: req.user.id, providerId }
    });

    if (existingFavorite) {
        throw new AppError(req.t('favorite.alreadyFavorite'), 400);
    }

    // Create favorite
    const favorite = await Favorite.create({
        userId: req.user.id,
        providerId
    });

    // Invalidate user favorites cache
    await cache.del(cache.cacheKeys.userFavorites(req.user.id));

    i18nResponse(req, res, 201, 'favorite.added', { favorite });
});

/**
 * @desc    Get user's favorites
 * @route   GET /api/favorites
 * @access  Private
 */
const getFavorites = asyncHandler(async (req, res) => {
    // Try cache first
    const cacheKey = cache.cacheKeys.userFavorites(req.user.id);
    const cached = await cache.get(cacheKey);
    if (cached) {
        return successResponse(res, 200, req.t('favorite.list'), cached);
    }

    const favorites = await Favorite.findAll({
        where: { userId: req.user.id },
        include: [
            {
                model: Provider,
                as: 'provider',
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'profilePhoto']
                    }
                ]
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    const responseData = { favorites };

    // Cache for 5 minutes
    await cache.set(cacheKey, responseData, 300);

    i18nResponse(req, res, 200, 'favorite.list', responseData);
});

/**
 * @desc    Remove provider from favorites
 * @route   DELETE /api/favorites/:providerId
 * @access  Private
 */
const removeFavorite = asyncHandler(async (req, res) => {
    const { providerId } = req.params;

    const favorite = await Favorite.findOne({
        where: { userId: req.user.id, providerId }
    });

    if (!favorite) {
        throw new AppError(req.t('common.notFound'), 404);
    }

    await favorite.destroy();

    // Invalidate user favorites cache
    await cache.del(cache.cacheKeys.userFavorites(req.user.id));

    i18nResponse(req, res, 200, 'favorite.removed');
});

/**
 * @desc    Check if provider is in favorites
 * @route   GET /api/favorites/check/:providerId
 * @access  Private
 */
const checkFavorite = asyncHandler(async (req, res) => {
    const { providerId } = req.params;

    const favorite = await Favorite.findOne({
        where: { userId: req.user.id, providerId }
    });

    i18nResponse(req, res, 200, 'favorite.check', {
        isFavorite: !!favorite
    });
});

module.exports = {
    addFavorite,
    getFavorites,
    removeFavorite,
    checkFavorite
};
