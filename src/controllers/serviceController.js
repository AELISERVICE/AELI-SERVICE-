const { Op } = require('sequelize');
const { Service, Provider, Category } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { successResponse } = require('../utils/helpers');
const cache = require('../config/redis');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
    // Try cache first
    const cacheKey = cache.cacheKeys.categories();
    const cached = await cache.get(cacheKey);
    if (cached) {
        return successResponse(res, 200, 'Liste des catégories', cached);
    }

    const categories = await Category.findAll({
        where: { isActive: true },
        order: [['order', 'ASC'], ['name', 'ASC']]
    });

    const responseData = { categories };

    // Cache for 1 hour (categories rarely change)
    await cache.set(cacheKey, responseData, 3600);

    successResponse(res, 200, 'Liste des catégories', responseData);
});

/**
 * @desc    Create a category (admin only)
 * @route   POST /api/categories
 * @access  Private (admin)
 */
const createCategory = asyncHandler(async (req, res) => {
    const { name, description, icon, order } = req.body;

    const category = await Category.create({
        name,
        description,
        icon,
        order: order || 0
    });

    // Invalidate categories cache
    await cache.del(cache.cacheKeys.categories());

    successResponse(res, 201, 'Catégorie créée', { category });
});

/**
 * @desc    Update a category (admin only)
 * @route   PUT /api/categories/:id
 * @access  Private (admin)
 */
const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, icon, order, isActive } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
        throw new AppError('Catégorie non trouvée', 404);
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    // Invalidate categories cache
    await cache.del(cache.cacheKeys.categories());

    successResponse(res, 200, 'Catégorie mise à jour', { category });
});

/**
 * @desc    Create a service
 * @route   POST /api/services
 * @access  Private (provider)
 */
const createService = asyncHandler(async (req, res) => {
    const { categoryId, name, description, price, priceType, duration, tags } = req.body;

    // Get provider for current user
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider) {
        throw new AppError('Vous devez d\'abord créer un profil prestataire', 400);
    }

    // Verify category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
        throw new AppError('Catégorie non trouvée', 404);
    }

    const service = await Service.create({
        providerId: provider.id,
        categoryId,
        name,
        description,
        price,
        priceType: priceType || 'contact',
        duration,
        tags: tags || []
    });

    // Invalidate provider services cache
    await cache.del(cache.cacheKeys.services(provider.id));

    successResponse(res, 201, 'Service créé', { service });
});

/**
 * @desc    Get services by provider
 * @route   GET /api/services/provider/:providerId
 * @access  Public
 */
const getServicesByProvider = asyncHandler(async (req, res) => {
    const { providerId } = req.params;

    // Try cache first
    const cacheKey = cache.cacheKeys.services(providerId);
    const cached = await cache.get(cacheKey);
    if (cached) {
        return successResponse(res, 200, 'Services du prestataire', cached);
    }

    const services = await Service.findAll({
        where: {
            providerId,
            isActive: true
        },
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'slug']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    const responseData = { services };

    // Cache for 10 minutes
    await cache.set(cacheKey, responseData, 600);

    successResponse(res, 200, 'Services du prestataire', responseData);
});

/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Private (owner only)
 */
const updateService = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { categoryId, name, description, price, priceType, duration, tags, isActive } = req.body;

    const service = await Service.findByPk(id, {
        include: [{ model: Provider, as: 'provider' }]
    });

    if (!service) {
        throw new AppError('Service non trouvé', 404);
    }

    // Check ownership
    if (service.provider.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Non autorisé à modifier ce service', 403);
    }

    // Update fields
    if (categoryId) {
        const category = await Category.findByPk(categoryId);
        if (!category) throw new AppError('Catégorie non trouvée', 404);
        service.categoryId = categoryId;
    }
    if (name) service.name = name;
    if (description) service.description = description;
    if (price !== undefined) service.price = price;
    if (priceType) service.priceType = priceType;
    if (duration !== undefined) service.duration = duration;
    if (tags) service.tags = tags;
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();

    successResponse(res, 200, 'Service mis à jour', { service });
});

/**
 * @desc    Delete a service (soft delete)
 * @route   DELETE /api/services/:id
 * @access  Private (owner only)
 */
const deleteService = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
        include: [{ model: Provider, as: 'provider' }]
    });

    if (!service) {
        throw new AppError('Service non trouvé', 404);
    }

    // Check ownership
    if (service.provider.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Non autorisé à supprimer ce service', 403);
    }

    // Soft delete
    service.isActive = false;
    await service.save({ fields: ['isActive'] });

    successResponse(res, 200, 'Service supprimé');
});

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    createService,
    getServicesByProvider,
    updateService,
    deleteService
};
