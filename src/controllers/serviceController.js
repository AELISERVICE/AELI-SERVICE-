const { Op } = require('sequelize');
const { Service, Provider, Category } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { i18nResponse, successResponse } = require('../utils/helpers');
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
        return successResponse(res, 200, req.t('category.list'), cached);
    }

    const categories = await Category.findAll({
        where: { isActive: true },
        order: [['order', 'ASC'], ['name', 'ASC']]
    });

    const responseData = { categories };

    // Cache for 1 hour (categories rarely change)
    await cache.set(cacheKey, responseData, 3600);

    i18nResponse(req, res, 200, 'category.list', responseData);
});

/**
 * @desc    Create a category (admin only)
 * @route   POST /api/categories
 * @access  Private (admin)
 */
const createCategory = asyncHandler(async (req, res) => {
    const { name, description, icon, order } = req.body;

    try {
        const category = await Category.create({
            name,
            description,
            icon,
            order: order || 0
        });

        // Invalidate categories cache
        await cache.del(cache.cacheKeys.categories());

        i18nResponse(req, res, 201, 'category.created', { category });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new AppError(req.t('category.alreadyExists') || 'Cette catégorie existe déjà', 400);
        }
        throw error;
    }
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
        throw new AppError(req.t('category.notFound'), 404);
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    // Invalidate categories cache
    await cache.del(cache.cacheKeys.categories());

    i18nResponse(req, res, 200, 'category.updated', { category });
});

/**
 * @desc    Create a service
 * @route   POST /api/services
 * @access  Private (provider)
 */
const createService = asyncHandler(async (req, res) => {
    const { categoryId, name, description, price, priceType, duration, tags, photo } = req.body;

    // Get provider for current user
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider) {
        throw new AppError(req.t('provider.notFound'), 400);
    }

    // Verify category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
        throw new AppError(req.t('category.notFound'), 404);
    }

    const service = await Service.create({
        providerId: provider.id,
        categoryId,
        name,
        description,
        price,
        priceType: priceType || 'contact',
        duration,
        tags: tags || [],
        photo: photo || null
    });

    // Invalidate provider services cache
    await cache.del(cache.cacheKeys.services(provider.id));
    await cache.del('services:all:grouped');

    i18nResponse(req, res, 201, 'service.created', { service });
});

/**
 * @desc    Get all services globally grouped by category
 * @route   GET /api/services
 * @access  Public
 */
const getAllServicesGrouped = asyncHandler(async (req, res) => {
    // Try cache first
    const cacheKey = 'services:all:grouped';
    const cached = await cache.get(cacheKey);
    if (cached) {
        return successResponse(res, 200, req.t('service.list'), cached);
    }

    const services = await Service.findAll({
        where: {
            isActive: true
        },
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'slug', 'icon']
            },
            {
                model: Provider,
                as: 'provider',
                attributes: ['id', 'businessName', 'location']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    // Group services by category
    const categoriesMap = new Map();

    services.forEach(service => {
        const cat = service.category;
        if (!cat) return; // Safety check

        if (!categoriesMap.has(cat.id)) {
            categoriesMap.set(cat.id, {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon,
                services: []
            });
        }

        // Add formatted service without nested category object
        const serviceData = service.toJSON();
        delete serviceData.category; // Remove since it's already in the parent

        categoriesMap.get(cat.id).services.push(serviceData);
    });

    const groupedCategories = Array.from(categoriesMap.values());

    const responseData = { categories: groupedCategories };

    // Cache for 10 minutes (it changes often as people add services)
    await cache.set(cacheKey, responseData, 600);

    i18nResponse(req, res, 200, 'service.list', responseData);
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
        return successResponse(res, 200, req.t('service.list'), cached);
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
                attributes: ['id', 'name', 'slug', 'icon']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    // Group services by category
    const categoriesMap = new Map();

    services.forEach(service => {
        const cat = service.category;
        if (!cat) return; // Safety check

        if (!categoriesMap.has(cat.id)) {
            categoriesMap.set(cat.id, {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon,
                services: []
            });
        }

        // Add formatted service without nested category object
        const serviceData = service.toJSON();
        delete serviceData.category; // Remove since it's already in the parent

        categoriesMap.get(cat.id).services.push(serviceData);
    });

    const groupedCategories = Array.from(categoriesMap.values());

    const responseData = { categories: groupedCategories };

    // Cache for 10 minutes
    await cache.set(cacheKey, responseData, 600);

    i18nResponse(req, res, 200, 'service.list', responseData);
});

/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Private (owner only)
 */
const updateService = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { categoryId, name, description, price, priceType, duration, tags, isActive, photo } = req.body;

    const service = await Service.findByPk(id, {
        include: [{ model: Provider, as: 'provider' }]
    });

    if (!service) {
        throw new AppError(req.t('service.notFound'), 404);
    }

    // Check ownership
    if (service.provider.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError(req.t('service.unauthorized'), 403);
    }

    // Update fields
    if (categoryId) {
        const category = await Category.findByPk(categoryId);
        if (!category) throw new AppError(req.t('category.notFound'), 404);
        service.categoryId = categoryId;
    }
    if (name) service.name = name;
    if (description) service.description = description;
    if (price !== undefined) service.price = price;
    if (priceType) service.priceType = priceType;
    if (duration !== undefined) service.duration = duration;
    if (tags) service.tags = tags;
    if (isActive !== undefined) service.isActive = isActive;
    if (photo !== undefined) service.photo = photo;

    await service.save();

    // Invalidate cache
    await cache.del(cache.cacheKeys.services(service.providerId));
    await cache.del('services:all:grouped');

    i18nResponse(req, res, 200, 'service.updated', { service });
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
        throw new AppError(req.t('service.notFound'), 404);
    }

    // Check ownership
    if (service.provider.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError(req.t('service.unauthorized'), 403);
    }

    // Soft delete
    service.isActive = false;
    await service.save({ fields: ['isActive'] });

    // Invalidate cache
    await cache.del(cache.cacheKeys.services(service.providerId));
    await cache.del('services:all:grouped');

    i18nResponse(req, res, 200, 'service.deleted');
});

/**
 * @desc    Get unique categories for a provider
 * @route   GET /api/services/provider/:providerId/categories
 * @access  Public
 */
const getCategoriesByProvider = asyncHandler(async (req, res) => {
    const { providerId } = req.params;

    const services = await Service.findAll({
        where: {
            providerId,
            isActive: true
        },
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'slug', 'icon']
            }
        ],
        attributes: ['id'] // We only need the categories
    });

    // Extract unique categories
    const uniqueCategoriesMap = new Map();
    services.forEach(service => {
        if (service.category && !uniqueCategoriesMap.has(service.category.id)) {
            uniqueCategoriesMap.set(service.category.id, service.category);
        }
    });

    const categories = Array.from(uniqueCategoriesMap.values());

    i18nResponse(req, res, 200, 'category.list', { categories });
});

/**
 * @desc    Remove a category from a provider (Soft deletes all services in that category)
 * @route   DELETE /api/services/provider/category/:categoryId
 * @access  Private (provider only)
 */
const deleteProviderCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    // Get provider for current user
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider) {
        throw new AppError(req.t('provider.notFound'), 400);
    }

    // Soft delete all active services for this provider in this category
    const updatedCount = await Service.update(
        { isActive: false },
        {
            where: {
                providerId: provider.id,
                categoryId,
                isActive: true
            }
        }
    );

    // Invalidate provider services cache
    await cache.del(cache.cacheKeys.services(provider.id));
    await cache.del('services:all:grouped');

    i18nResponse(req, res, 200, 'service.deleted', {
        message: `Catégorie retirée avec succès (${updatedCount} services désactivés)`
    });
});

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    createService,
    getAllServicesGrouped,
    getServicesByProvider,
    updateService,
    deleteService,
    getCategoriesByProvider,
    deleteProviderCategory
};
