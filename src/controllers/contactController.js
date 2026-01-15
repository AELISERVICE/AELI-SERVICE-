const { Contact, Provider, User } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { i18nResponse, getPaginationParams, getPaginationData } = require('../utils/helpers');
const { sendEmail } = require('../config/email');
const { newContactEmail } = require('../utils/emailTemplates');
const { emitNewContact, emitContactStatusChange } = require('../config/socket');

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
        throw new AppError(req.t('provider.notFound'), 404);
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

    // Send WebSocket notification to provider
    emitNewContact(providerId, {
        id: contact.id,
        senderName,
        senderEmail,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
    });

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

    i18nResponse(req, res, 201, 'contact.sent', { contact });
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
        throw new AppError(req.t('provider.notFound'), 404);
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

    i18nResponse(req, res, 200, 'contact.list', { contacts, pagination });
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

    i18nResponse(req, res, 200, 'contact.list', { contacts, pagination });
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
        throw new AppError(req.t('common.badRequest'), 400);
    }

    const contact = await Contact.findByPk(id, {
        include: [{ model: Provider, as: 'provider' }]
    });

    if (!contact) {
        throw new AppError(req.t('contact.notFound'), 404);
    }

    // Check ownership (provider must be owner)
    if (contact.provider.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError(req.t('common.unauthorized'), 403);
    }

    contact.status = status;
    await contact.save({ fields: ['status'] });

    // Notify sender via WebSocket if they were authenticated
    if (contact.userId) {
        emitContactStatusChange(contact.userId, {
            id: contact.id,
            status,
            providerId: contact.providerId
        });
    }

    // Send email notification to sender
    if (contact.senderEmail) {
        const { contactStatusChangedEmail } = require('../utils/emailTemplates');
        sendEmail({
            to: contact.senderEmail,
            ...contactStatusChangedEmail({
                firstName: contact.senderName.split(' ')[0],
                providerName: contact.provider.businessName,
                status
            })
        }).catch(err => console.error('Contact status email error:', err.message));
    }

    i18nResponse(req, res, 200, 'contact.statusUpdated', { contact });
});

/**
 * @desc    Get daily contact statistics (for provider dashboard)
 * @route   GET /api/contacts/stats/daily
 * @access  Private (provider)
 */
const getDailyContactStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const { Op, fn, col, literal } = require('sequelize');

    // Get provider for current user
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider) {
        throw new AppError(req.t('provider.notFound'), 404);
    }

    // Default to last 30 days
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Get contacts grouped by date
    const dailyStats = await Contact.findAll({
        where: {
            providerId: provider.id,
            createdAt: { [Op.between]: [start, end] }
        },
        attributes: [
            [fn('DATE', col('created_at')), 'date'],
            [fn('COUNT', col('id')), 'count']
        ],
        group: [fn('DATE', col('created_at'))],
        order: [[fn('DATE', col('created_at')), 'DESC']],
        raw: true
    });

    // Get total for period
    const totalContacts = dailyStats.reduce((sum, day) => sum + parseInt(day.count), 0);

    i18nResponse(req, res, 200, 'contact.list', {
        period: { start, end },
        totalContacts,
        dailyStats
    });
});

/**
 * @desc    Get contacts for a specific date (for provider dashboard)
 * @route   GET /api/contacts/by-date/:date
 * @access  Private (provider)
 */
const getContactsByDate = asyncHandler(async (req, res) => {
    const { date } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const { Op } = require('sequelize');

    // Get provider for current user
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider) {
        throw new AppError(req.t('provider.notFound'), 404);
    }

    // Parse date
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const { limit: queryLimit, offset } = getPaginationParams(page, limit);

    const { count, rows: contacts } = await Contact.findAndCountAll({
        where: {
            providerId: provider.id,
            createdAt: { [Op.between]: [startOfDay, endOfDay] }
        },
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'firstName', 'lastName', 'profilePhoto', 'phone'],
                required: false
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: queryLimit,
        offset
    });

    const pagination = getPaginationData(page, queryLimit, count);

    i18nResponse(req, res, 200, 'contact.list', {
        date: date,
        contacts,
        pagination
    });
});

module.exports = {
    createContact,
    getReceivedContacts,
    getSentContacts,
    updateContactStatus,
    getDailyContactStats,
    getContactsByDate
};
