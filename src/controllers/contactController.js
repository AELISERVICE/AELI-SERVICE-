const { Contact, Provider, User } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { successResponse, getPaginationParams, getPaginationData } = require('../utils/helpers');
const { sendEmail } = require('../config/email');
const { newContactEmail } = require('../utils/emailTemplates');

/**
 * @desc    Send a contact request to a provider
 * @route   POST /api/contacts
 * @access  Public (can be authenticated or not)
 */
const createContact = asyncHandler(async (req, res) => {
    const { providerId, message, senderName, senderEmail, senderPhone } = req.body;

    // Check if provider exists
    const provider = await Provider.findByPk(providerId, {
        include: [{ model: User, as: 'user' }]
    });

    if (!provider) {
        throw new AppError('Prestataire non trouvé', 404);
    }

    // Create contact request
    const contact = await Contact.create({
        userId: req.user ? req.user.id : null,
        providerId,
        message,
        senderName,
        senderEmail,
        senderPhone
    });

    // Increment provider's contact count
    await provider.incrementContacts();

    // Send email notification to provider
    if (provider.user && provider.user.email) {
        sendEmail({
            to: provider.user.email,
            ...newContactEmail({
                providerName: provider.businessName,
                senderName,
                senderEmail,
                senderPhone,
                message
            })
        }).catch(err => console.error('Contact notification email error:', err.message));
    }

    successResponse(res, 201, 'Message envoyé avec succès', { contact });
});

/**
 * @desc    Get received contact requests (for providers)
 * @route   GET /api/contacts/received
 * @access  Private (provider)
 */
const getReceivedContacts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    // Get provider for current user
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider) {
        throw new AppError('Profil prestataire non trouvé', 404);
    }

    const { limit: queryLimit, offset } = getPaginationParams(page, limit);

    const where = { providerId: provider.id };
    if (status) {
        where.status = status;
    }

    const { count, rows: contacts } = await Contact.findAndCountAll({
        where,
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
                required: false
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: queryLimit,
        offset
    });

    const pagination = getPaginationData(page, queryLimit, count);

    successResponse(res, 200, 'Demandes de contact reçues', { contacts, pagination });
});

/**
 * @desc    Get sent contact requests (for clients)
 * @route   GET /api/contacts/sent
 * @access  Private
 */
const getSentContacts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const { limit: queryLimit, offset } = getPaginationParams(page, limit);

    const { count, rows: contacts } = await Contact.findAndCountAll({
        where: { userId: req.user.id },
        include: [
            {
                model: Provider,
                as: 'provider',
                attributes: ['id', 'businessName', 'location'],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['firstName', 'lastName', 'profilePhoto']
                    }
                ]
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: queryLimit,
        offset
    });

    const pagination = getPaginationData(page, queryLimit, count);

    successResponse(res, 200, 'Demandes de contact envoyées', { contacts, pagination });
});

/**
 * @desc    Update contact status
 * @route   PUT /api/contacts/:id/status
 * @access  Private (provider - owner)
 */
const updateContactStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'read', 'replied'].includes(status)) {
        throw new AppError('Statut invalide', 400);
    }

    const contact = await Contact.findByPk(id, {
        include: [{ model: Provider, as: 'provider' }]
    });

    if (!contact) {
        throw new AppError('Demande de contact non trouvée', 404);
    }

    // Check ownership (provider must be owner)
    if (contact.provider.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Non autorisé', 403);
    }

    contact.status = status;
    await contact.save({ fields: ['status'] });

    successResponse(res, 200, 'Statut mis à jour', { contact });
});

module.exports = {
    createContact,
    getReceivedContacts,
    getSentContacts,
    updateContactStatus
};
