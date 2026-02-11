/**
 * Provider Application Controller
 * Handles applications from clients wanting to become providers
 */

const { Op } = require('sequelize');
const { User, Provider, ProviderApplication, Subscription } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { i18nResponse, extractPhotoUrls } = require('../utils/helpers');
const { withTransaction } = require('../utils/dbHelpers');
const { uploadImage, uploadDocument } = require('../config/cloudinary');
const { sendEmail } = require('../config/email');
const cache = require('../config/redis');

/**
 * @desc    Apply to become a provider
 * @route   POST /api/providers/apply
 * @access  Private (client only)
 */
const applyToBeProvider = asyncHandler(async (req, res) => {
    const { businessName, description, location, address, whatsapp, facebook, instagram } = req.body;

    // Check if user is already a provider
    if (req.user.role === 'provider') {
        throw new AppError(req.t('provider.alreadyProvider'), 400);
    }

    // Check for existing pending application
    const existingApplication = await ProviderApplication.findOne({
        where: { userId: req.user.id, status: 'pending' }
    });
    if (existingApplication) {
        throw new AppError(req.t('provider.applicationPending'), 400);
    }

    // Check for recent rejected application (can reapply after 7 days)
    const recentRejection = await ProviderApplication.findOne({
        where: {
            userId: req.user.id,
            status: 'rejected',
            reviewedAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
    });
    if (recentRejection) {
        throw new AppError(req.t('provider.reapplyWait'), 400);
    }

    // Extract photos from uploaded files
    const photos = extractPhotoUrls(req.files?.photos || req.files);

    // Process documents (CNI required)
    const documents = [];
    if (req.files?.documents) {
        for (const file of req.files.documents) {
            const result = await uploadDocument(file.path, 'aeli-services/applications');
            documents.push({
                type: file.fieldname === 'cni' ? 'cni' : (req.body.documentType || 'cni'),
                url: result.url,
                publicId: result.publicId,
                originalFilename: file.originalname,
                uploadedAt: new Date()
            });
        }
    }

    // Check CNI is present
    const hasCNI = documents.some(doc => doc.type === 'cni');
    if (!hasCNI) {
        throw new AppError(req.t('documents.cniRequired'), 400);
    }

    // Create application
    const application = await ProviderApplication.create({
        userId: req.user.id,
        businessName,
        description,
        location,
        address,
        whatsapp,
        facebook,
        instagram,
        photos,
        documents,
        status: 'pending'
    });

    // Send confirmation email to applicant
    try {
        const { applicationReceivedEmail } = require('../utils/emailTemplates');
        await sendEmail({
            to: req.user.email,
            ...applicationReceivedEmail(req.user.firstName, businessName)
        });
    } catch (err) {
        console.error('Email error:', err.message);
    }

    i18nResponse(req, res, 201, 'provider.applicationSubmitted', {
        application: {
            id: application.id,
            businessName: application.businessName,
            status: application.status,
            createdAt: application.createdAt
        }
    });
});

/**
 * @desc    Get my application status
 * @route   GET /api/providers/my-application
 * @access  Private
 */
const getMyApplication = asyncHandler(async (req, res) => {
    const application = await ProviderApplication.findOne({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
    });

    if (!application) {
        throw new AppError(req.t('provider.noApplication'), 404);
    }

    i18nResponse(req, res, 200, 'provider.applicationStatus', { application });
});

/**
 * @desc    Get all provider applications (Admin)
 * @route   GET /api/admin/provider-applications
 * @access  Private (admin only)
 */
const getApplications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows: applications } = await ProviderApplication.findAndCountAll({
        where,
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profilePhoto']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
    });

    i18nResponse(req, res, 200, 'admin.applicationsList', {
        applications,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count
        }
    });
});

/**
 * @desc    Review provider application (approve/reject)
 * @route   PUT /api/admin/provider-applications/:id/review
 * @access  Private (admin only)
 */
const reviewApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { decision, rejectionReason, adminNotes } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
        throw new AppError(req.t('common.invalidDecision'), 400);
    }

    const application = await ProviderApplication.findByPk(id, {
        include: [{ model: User, as: 'user' }]
    });

    if (!application) {
        throw new AppError(req.t('provider.applicationNotFound'), 404);
    }

    if (application.status !== 'pending') {
        throw new AppError(req.t('provider.applicationAlreadyReviewed'), 400);
    }

    const user = application.user;

    if (decision === 'approved') {
        // Use transaction to ensure atomicity
        const { provider } = await withTransaction(async (transaction) => {
            // 1. Change user role to provider
            await User.update(
                { role: 'provider' },
                { where: { id: user.id }, transaction }
            );

            // 2. Create provider profile from application data
            const newProvider = await Provider.create({
                userId: user.id,
                businessName: application.businessName,
                description: application.description,
                location: application.location,
                address: application.address,
                whatsapp: application.whatsapp,
                facebook: application.facebook,
                instagram: application.instagram,
                photos: application.photos,
                documents: application.documents,
                isVerified: true, // Auto-verified since admin approved
                verifiedAt: new Date(),
                verifiedBy: req.user.id,
                verificationStatus: 'approved'
            }, { transaction });

            // 3. Create 30-day trial subscription
            await Subscription.create({
                providerId: newProvider.id,
                status: 'trial',
                plan: 'trial',
                price: 0,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }, { transaction });

            // 4. Update application status
            application.status = 'approved';
            application.reviewedBy = req.user.id;
            application.reviewedAt = new Date();
            application.adminNotes = adminNotes;
            await application.save({ transaction });

            return { provider: newProvider };
        });

        // 5. Send approval email (outside transaction - non-critical)
        try {
            const { providerApprovedEmail } = require('../utils/emailTemplates');
            await sendEmail({
                to: user.email,
                ...providerApprovedEmail(user.firstName, application.businessName)
            });
        } catch (err) {
            console.error('Email error:', err.message);
        }

        // Invalidate cache
        await cache.delByPattern('route:/api/providers*');

        i18nResponse(req, res, 200, 'admin.applicationApproved', {
            application,
            provider
        });

    } else {
        // Rejected
        if (!rejectionReason) {
            throw new AppError(req.t('admin.rejectionReasonRequired'), 400);
        }

        application.status = 'rejected';
        application.rejectionReason = rejectionReason;
        application.reviewedBy = req.user.id;
        application.reviewedAt = new Date();
        application.adminNotes = adminNotes;
        await application.save();

        // Send rejection email
        try {
            const { providerRejectedEmail } = require('../utils/emailTemplates');
            await sendEmail({
                to: user.email,
                ...providerRejectedEmail(user.firstName, rejectionReason)
            });
        } catch (err) {
            console.error('Email error:', err.message);
        }

        i18nResponse(req, res, 200, 'admin.applicationRejected', { application });
    }
});

/**
 * @desc    Get application details (Admin)
 * @route   GET /api/admin/provider-applications/:id
 * @access  Private (admin only)
 */
const getApplicationDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const application = await ProviderApplication.findByPk(id, {
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profilePhoto', 'createdAt']
            }
        ]
    });

    if (!application) {
        throw new AppError(req.t('provider.applicationNotFound'), 404);
    }

    i18nResponse(req, res, 200, 'admin.applicationDetails', { application });
});

module.exports = {
    applyToBeProvider,
    getMyApplication,
    getApplications,
    reviewApplication,
    getApplicationDetails
};
