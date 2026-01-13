const { Favorite, Provider, User } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { successResponse } = require('../utils/helpers');

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
        throw new AppError('Prestataire non trouvé', 404);
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
        where: { userId: req.user.id, providerId }
    });

    if (existingFavorite) {
        throw new AppError('Ce prestataire est déjà dans vos favoris', 400);
    }

    // Create favorite
    const favorite = await Favorite.create({
        userId: req.user.id,
        providerId
    });

    successResponse(res, 201, 'Ajouté aux favoris', { favorite });
});

/**
 * @desc    Get user's favorites
 * @route   GET /api/favorites
 * @access  Private
 */
const getFavorites = asyncHandler(async (req, res) => {
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

    successResponse(res, 200, 'Liste des favoris', { favorites });
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
        throw new AppError('Ce prestataire n\'est pas dans vos favoris', 404);
    }

    await favorite.destroy();

    successResponse(res, 200, 'Retiré des favoris');
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

    successResponse(res, 200, 'Statut favori', {
        isFavorite: !!favorite
    });
});

module.exports = {
    addFavorite,
    getFavorites,
    removeFavorite,
    checkFavorite
};
