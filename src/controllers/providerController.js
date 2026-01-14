const { Op } = require('sequelize');
const { Provider, User, Service, Review, Category, Contact } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { successResponse, getPaginationParams, getPaginationData, buildSortOrder, extractPhotoUrls } = require('../utils/helpers');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');
const cache = require('../config/redis');

/**
 * @desc    Create provider profile
 * @route   POST /api/providers/create
 * @access  Private (provider role)
 */
const createProvider = asyncHandler(async (req, res) => {
    const { businessName, description, location, address, whatsapp, facebook, instagram } = req.body;

    // Check if user already has a provider profile
    const existingProvider = await Provider.findOne({ where: { userId: req.user.id } });
    if (existingProvider) {
        throw new AppError('Vous avez déjà un profil prestataire', 400);
    }

    // Extract photo URLs from uploaded files
    const photos = extractPhotoUrls(req.files);

    // Create provider
    const provider = await Provider.create({
        userId: req.user.id,
        businessName,
        description,
        location,
        address,
        whatsapp,
        facebook,
        instagram,
        photos
    });

    // Invalidate providers list cache
    await cache.delByPattern('providers:list:*');

    successResponse(res, 201, 'Profil prestataire créé avec succès', { provider });
});

/**
 * @desc    Get all providers (with filters, pagination)
 * @route   GET /api/providers
 * @access  Public
 */
const getProviders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, category, location, minRating, search, sort = 'recent' } = req.query;

    // Generate cache key
    const cacheKey = cache.cacheKeys.providers(page, { category, location, minRating, search, sort });

    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
        return successResponse(res, 200, 'Liste des prestataires', cached);
    }

    const { limit: queryLimit, offset } = getPaginationParams(page, limit);

    // Build where clause
    const where = {
        isVerified: true
    };

    if (location) {
        where.location = { [Op.iLike]: `%${location}%` };
    }

    if (minRating) {
        where.averageRating = { [Op.gte]: parseFloat(minRating) };
    }

    if (search) {
        where[Op.or] = [
            { businessName: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ];
    }

    // Build include for category filter
    const include = [
        {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'profilePhoto']
        }
    ];

    // If category filter, add services include with category condition
    if (category) {
        include.push({
            model: Service,
            as: 'services',
            required: true,
            include: [
                {
                    model: Category,
                    as: 'category',
                    where: { slug: category },
                    attributes: ['id', 'name', 'slug']
                }
            ]
        });
    }

    const { count, rows: providers } = await Provider.findAndCountAll({
        where,
        include,
        order: buildSortOrder(sort),
        limit: queryLimit,
        offset,
        distinct: true
    });

    const pagination = getPaginationData(page, queryLimit, count);

    const responseData = { providers, pagination };

    // Cache for 5 minutes
    await cache.set(cacheKey, responseData, 300);

    successResponse(res, 200, 'Liste des prestataires', responseData);
});

/**
 * @desc    Get single provider details
 * @route   GET /api/providers/:id
 * @access  Public
 */
const getProviderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Try cache first
    const cacheKey = cache.cacheKeys.provider(id);
    const cached = await cache.get(cacheKey);
    if (cached) {
        return successResponse(res, 200, 'Détails du prestataire', cached);
    }

    // Fetch provider with user info only (avoid deep nesting)
    const provider = await Provider.findByPk(id, {
        attributes: [
            'id', 'businessName', 'description', 'location', 'address',
            'whatsapp', 'facebook', 'instagram', 'photos',
            'averageRating', 'totalReviews', 'viewsCount', 'contactsCount',
            'isVerified', 'isFeatured', 'createdAt'
        ],
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'profilePhoto', 'phone']
            }
        ]
    });

    if (!provider) {
        throw new AppError('Prestataire non trouvé', 404);
    }

    // Fetch services separately (optimized query)
    const services = await Service.findAll({
        where: { providerId: id, isActive: true },
        attributes: ['id', 'name', 'description', 'price', 'priceType', 'duration'],
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'slug']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    // Fetch reviews separately (optimized query with limit)
    const reviews = await Review.findAll({
        where: { providerId: id, isVisible: true },
        attributes: ['id', 'rating', 'comment', 'createdAt'],
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'profilePhoto']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
    });

    // Combine results
    const providerData = provider.toJSON();
    providerData.services = services;
    providerData.reviews = reviews;

    // Increment view count (don't wait)
    provider.incrementViews().catch(err => console.error('View increment error:', err.message));

    // Cache for 5 minutes
    await cache.set(cacheKey, { provider: providerData }, 300);

    successResponse(res, 200, 'Détails du prestataire', { provider: providerData });
});

/**
 * @desc    Update provider profile
 * @route   PUT /api/providers/:id
 * @access  Private (owner only)
 */
const updateProvider = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { businessName, description, location, address, whatsapp, facebook, instagram } = req.body;

    const provider = await Provider.findByPk(id);
    if (!provider) {
        throw new AppError('Prestataire non trouvé', 404);
    }

    // Check ownership
    if (provider.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Non autorisé à modifier ce profil', 403);
    }

    // Update fields
    if (businessName) provider.businessName = businessName;
    if (description) provider.description = description;
    if (location) provider.location = location;
    if (address !== undefined) provider.address = address;
    if (whatsapp !== undefined) provider.whatsapp = whatsapp;
    if (facebook !== undefined) provider.facebook = facebook;
    if (instagram !== undefined) provider.instagram = instagram;

    // Handle new photos
    if (req.files && req.files.length > 0) {
        const newPhotos = extractPhotoUrls(req.files);
        const currentPhotos = provider.photos || [];

        // Check max photos limit
        if (currentPhotos.length + newPhotos.length > 5) {
            throw new AppError('Maximum 5 photos autorisées', 400);
        }

        provider.photos = [...currentPhotos, ...newPhotos];
    }

    await provider.save();

    successResponse(res, 200, 'Profil mis à jour', { provider });
});

/**
 * @desc    Delete a specific photo from provider gallery
 * @route   DELETE /api/providers/:id/photos/:photoIndex
 * @access  Private (owner only)
 */
const deleteProviderPhoto = asyncHandler(async (req, res) => {
    const { id, photoIndex } = req.params;

    const provider = await Provider.findByPk(id);
    if (!provider) {
        throw new AppError('Prestataire non trouvé', 404);
    }

    // Check ownership
    if (provider.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Non autorisé', 403);
    }

    const photos = provider.photos || [];
    const index = parseInt(photoIndex);

    if (index < 0 || index >= photos.length) {
        throw new AppError('Photo non trouvée', 404);
    }

    // Delete from Cloudinary
    const photoUrl = photos[index];
    const publicId = getPublicIdFromUrl(photoUrl);
    if (publicId) {
        await deleteImage(publicId).catch(err =>
            console.error('Cloudinary delete error:', err.message)
        );
    }

    // Remove from array
    photos.splice(index, 1);
    provider.photos = photos;
    await provider.save({ fields: ['photos'] });

    successResponse(res, 200, 'Photo supprimée', { provider });
});

/**
 * @desc    Get own provider profile
 * @route   GET /api/providers/my-profile
 * @access  Private (provider)
 */
const getMyProfile = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({
        where: { userId: req.user.id },
        include: [
            {
                model: Service,
                as: 'services',
                include: [{ model: Category, as: 'category' }]
            }
        ]
    });

    if (!provider) {
        throw new AppError('Profil prestataire non trouvé', 404);
    }

    successResponse(res, 200, 'Mon profil', { provider });
});

/**
 * @desc    Get provider dashboard with stats
 * @route   GET /api/providers/my-dashboard
 * @access  Private (provider)
 */
const getMyDashboard = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({
        where: { userId: req.user.id }
    });

    if (!provider) {
        throw new AppError('Profil prestataire non trouvé', 404);
    }

    // Get recent contacts
    const recentContacts = await Contact.findAll({
        where: { providerId: provider.id },
        order: [['createdAt', 'DESC']],
        limit: 5
    });

    // Get recent reviews
    const recentReviews = await Review.findAll({
        where: { providerId: provider.id, isVisible: true },
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'profilePhoto']
            }
        ]
    });

    // Get pending contacts count
    const pendingContactsCount = await Contact.count({
        where: { providerId: provider.id, status: 'pending' }
    });

    successResponse(res, 200, 'Tableau de bord', {
        stats: {
            totalViews: provider.viewsCount,
            totalContacts: provider.contactsCount,
            totalReviews: provider.totalReviews,
            averageRating: parseFloat(provider.averageRating),
            pendingContacts: pendingContactsCount,
            isVerified: provider.isVerified,
            isFeatured: provider.isFeatured
        },
        recentContacts,
        recentReviews
    });
});

module.exports = {
    createProvider,
    getProviders,
    getProviderById,
    updateProvider,
    deleteProviderPhoto,
    getMyProfile,
    getMyDashboard
};
