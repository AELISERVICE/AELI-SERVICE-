const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const { sequelize, User, Provider } = require('../models');
const { CINETPAY_CONFIG, PAYMENT_STATUS, CINETPAY_CODES } = require('../config/cinetpay');
const { NOTCH_PAY_CONFIG, NOTCH_PAY_STATUS } = require('../config/notchpay');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { i18nResponse, getPaginationParams, getPaginationData } = require('../utils/helpers');
const logger = require('../utils/logger');
const { auditLogger } = require('../middlewares/audit');

/**
 * Initialize a payment with CinetPay
 * POST /api/payments/initialize
 */
const initializePayment = asyncHandler(async (req, res) => {
    const { amount, type, providerId, description } = req.body;
    const userId = req.user?.id;

    // Validate amount (must be multiple of 5)
    if (!amount || amount < 100 || amount % 5 !== 0) {
        throw new AppError(req.t('common.badRequest'), 400);
    }

    // Validate type
    const validTypes = ['contact_premium', 'featured', 'boost', 'subscription'];
    if (!validTypes.includes(type)) {
        throw new AppError(req.t('common.badRequest'), 400);
    }

    // Get user info for card payments
    let user = null;
    if (userId) {
        user = await User.findByPk(userId);
    }

    // Generate unique transaction ID
    const transactionId = Payment.generateTransactionId();

    // Create payment record
    const payment = await Payment.create({
        transactionId,
        userId,
        providerId,
        type,
        amount,
        currency: CINETPAY_CONFIG.currency,
        status: 'PENDING',
        description: description || `Paiement ${type} AELI Services`,
        metadata: { type, providerId }
    });

    // Prepare CinetPay request
    const cinetpayData = {
        apikey: CINETPAY_CONFIG.apiKey,
        site_id: CINETPAY_CONFIG.siteId,
        transaction_id: transactionId,
        amount: amount,
        currency: CINETPAY_CONFIG.currency,
        description: payment.description,
        notify_url: CINETPAY_CONFIG.notifyUrl,
        return_url: `${CINETPAY_CONFIG.returnUrl}?transaction_id=${transactionId}`,
        channels: CINETPAY_CONFIG.channels,
        lang: CINETPAY_CONFIG.lang,
        metadata: JSON.stringify({ paymentId: payment.id, type, userId })
    };

    // Add customer info for card payments
    if (user) {
        cinetpayData.customer_id = user.id;
        cinetpayData.customer_name = user.lastName || 'Client';
        cinetpayData.customer_surname = user.firstName || 'AELI';
        cinetpayData.customer_email = user.email;
        cinetpayData.customer_phone_number = user.phone || '';
        cinetpayData.customer_address = 'Cameroun';
        cinetpayData.customer_city = 'Douala';
        cinetpayData.customer_country = 'CM';
        cinetpayData.customer_state = 'CM';
        cinetpayData.customer_zip_code = '00237';
    }

    try {
        // Call CinetPay API
        const response = await axios.post(CINETPAY_CONFIG.paymentUrl, cinetpayData, {
            headers: { 'Content-Type': 'application/json' }
        });

        const cinetpayResponse = response.data;

        if (cinetpayResponse.code === '201') {
            // Update payment with token and URL
            payment.paymentToken = cinetpayResponse.data.payment_token;
            payment.paymentUrl = cinetpayResponse.data.payment_url;
            await payment.save();

            logger.info(`Payment initialized: ${transactionId}`);

            i18nResponse(req, res, 201, 'payment.initialized', {
                paymentId: payment.id,
                transactionId: payment.transactionId,
                paymentUrl: payment.paymentUrl,
                amount: payment.amount,
                currency: payment.currency
            });
        } else {
            // Handle error
            payment.status = 'REFUSED';
            payment.errorMessage = cinetpayResponse.message;
            await payment.save();

            throw new AppError(req.t('payment.failed'), 400);
        }
    } catch (error) {
        if (error.response) {
            logger.error('CinetPay API error:', error.response.data);
            payment.errorMessage = JSON.stringify(error.response.data);
            await payment.save();
        }
        throw error;
    }
});

/**
 * Initialize a payment with NotchPay
 * POST /api/payments/notchpay/initialize
 */
const initializeNotchPayPayment = asyncHandler(async (req, res) => {
    const { amount, type, providerId, description } = req.body;
    const userId = req.user?.id;

    // Validate amount
    if (!amount || amount < 100) {
        throw new AppError(req.t('common.badRequest'), 400);
    }

    // Validate type
    const validTypes = ['contact_premium', 'featured', 'boost', 'subscription', 'contact_unlock'];
    if (!validTypes.includes(type)) {
        throw new AppError(req.t('common.badRequest'), 400);
    }

    // Get user info
    let user = null;
    if (userId) {
        user = await User.findByPk(userId);
    }

    // Generate unique transaction ID (reference)
    const transactionId = Payment.generateTransactionId();

    // Create payment record
    const payment = await Payment.create({
        transactionId,
        userId,
        providerId,
        type,
        amount,
        currency: NOTCH_PAY_CONFIG.currency,
        status: 'PENDING',
        gateway: 'NotchPay',
        description: description || `Paiement ${type} AELI Services (NotchPay)`,
        metadata: { type, providerId }
    });

    // Prepare NotchPay request
    const notchPayData = {
        amount: amount,
        currency: NOTCH_PAY_CONFIG.currency,
        description: payment.description,
        reference: transactionId,
        callback: NOTCH_PAY_CONFIG.callbackUrl,
        customer: {
            name: user ? `${user.firstName} ${user.lastName}` : 'Client AELI',
            email: user?.email,
            phone: user?.phone
        }
    };

    try {
        // Call NotchPay API
        const response = await axios.post(`${NOTCH_PAY_CONFIG.baseUrl}/payments/initialize`, notchPayData, {
            headers: {
                'Authorization': NOTCH_PAY_CONFIG.publicKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const notchPayResponse = response.data;

        if (notchPayResponse.status === 'Accepted' || notchPayResponse.authorization_url) {
            // Update payment with URL
            payment.paymentUrl = notchPayResponse.authorization_url;
            await payment.save();

            logger.info(`NotchPay payment initialized: ${transactionId}`);

            i18nResponse(req, res, 201, 'payment.initialized', {
                paymentId: payment.id,
                transactionId: payment.transactionId,
                paymentUrl: payment.paymentUrl,
                amount: payment.amount,
                currency: payment.currency
            });
        } else {
            payment.status = 'REFUSED';
            payment.errorMessage = notchPayResponse.message;
            await payment.save();

            throw new AppError(req.t('payment.failed'), 400);
        }
    } catch (error) {
        if (error.response) {
            logger.error('NotchPay API error:', error.response.data);
            payment.errorMessage = JSON.stringify(error.response.data);
            await payment.save();
        }
        throw error;
    }
});

/**
 * CinetPay webhook handler
 * POST /api/payments/webhook
 */
const handleWebhook = asyncHandler(async (req, res) => {
    const {
        cpm_trans_id,
        cpm_site_id,
        cpm_amount,
        cpm_currency,
        cpm_error_message
    } = req.body;

    logger.info(`Webhook received for transaction: ${cpm_trans_id}`);

    // Verify site_id
    if (cpm_site_id !== CINETPAY_CONFIG.siteId) {
        logger.warn(`Invalid site_id in webhook: ${cpm_site_id}`);
        return res.status(400).send('Invalid site_id');
    }

    // Find payment
    const payment = await Payment.findByTransactionId(cpm_trans_id);
    if (!payment) {
        logger.warn(`Payment not found for transaction: ${cpm_trans_id}`);
        return res.status(404).send('Payment not found');
    }

    // If already processed, skip
    if (payment.status === 'ACCEPTED' || payment.status === 'REFUSED') {
        logger.info(`Payment ${cpm_trans_id} already processed`);
        return res.status(200).send('OK');
    }

    // Verify transaction with CinetPay API
    try {
        const verifyResponse = await axios.post(CINETPAY_CONFIG.checkUrl, {
            apikey: CINETPAY_CONFIG.apiKey,
            site_id: CINETPAY_CONFIG.siteId,
            transaction_id: cpm_trans_id
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const verifyData = verifyResponse.data;

        if (verifyData.code === '00' && verifyData.data.status === 'ACCEPTED') {
            // Payment successful
            await payment.updateFromCinetPay(verifyData.data);

            // Process business logic based on payment type
            await processPaymentSuccess(payment);

            logger.info(`Payment ${cpm_trans_id} verified and accepted`);
        } else if (verifyData.data.status === 'REFUSED') {
            // Payment failed
            payment.status = 'REFUSED';
            payment.errorMessage = cpm_error_message || verifyData.message;
            await payment.save();

            logger.info(`Payment ${cpm_trans_id} refused`);
        } else {
            // Still pending (WAITING_CUSTOMER)
            payment.status = 'WAITING_CUSTOMER';
            await payment.save();
        }
    } catch (error) {
        logger.error(`Error verifying payment ${cpm_trans_id}:`, error.message);
    }

    // Always return 200 to CinetPay
    res.status(200).send('OK');
});

/**
 * NotchPay webhook handler
 * POST /api/payments/notchpay/webhook
 */
const handleNotchPayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-notch-signature'];
    const event = req.body;

    logger.info(`NotchPay Webhook received: ${event.event} for ref ${event.data?.reference}`);

    // Verify signature (Security best practice)
    if (signature && NOTCH_PAY_CONFIG.secretKey) {
        const hash = crypto.createHmac('sha256', NOTCH_PAY_CONFIG.secretKey)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== signature) {
            logger.warn('Invalid NotchPay signature');
            return res.status(401).send('Invalid signature');
        }
    }

    const { reference, status } = event.data || {};

    if (!reference) return res.status(400).send('Missing reference');

    const payment = await Payment.findByTransactionId(reference);
    if (!payment) return res.status(404).send('Payment not found');

    // If already processed, skip
    if (payment.status === 'ACCEPTED' || payment.status === 'REFUSED') {
        return res.status(200).send('OK');
    }

    // Update payment
    await payment.updateFromNotchPay(event.data);

    if (payment.status === 'ACCEPTED') {
        await processPaymentSuccess(payment);
    } else if (payment.status === 'REFUSED') {
        await processPaymentFailure(payment, payment.errorMessage);
    }

    res.status(200).send('OK');
});

/**
 * Process successful payment
 */
const processPaymentSuccess = async (payment) => {
    const { sendEmail } = require('../config/email');
    const { paymentSuccessEmail } = require('../utils/emailTemplates');
    const { activateSubscription } = require('./subscriptionController');

    // Get user for email
    const user = await User.findByPk(payment.userId);

    switch (payment.type) {
        case 'featured':
            // Make provider featured
            if (payment.providerId) {
                await Provider.update(
                    { isFeatured: true },
                    { where: { id: payment.providerId } }
                );
                logger.info(`Provider ${payment.providerId} is now featured`);
            }
            break;

        case 'boost':
            // Boost provider visibility
            if (payment.providerId) {
                await Provider.increment('viewsCount', {
                    by: 100,
                    where: { id: payment.providerId }
                });
                logger.info(`Provider ${payment.providerId} boosted`);
            }
            break;

        case 'subscription':
            // Handle subscription activation
            await activateSubscription(payment);
            logger.info(`Subscription activated for user ${payment.userId}`);
            break;
    }

    // Audit Log
    auditLogger.paymentCompleted(payment, 'ACCEPTED');

    // Send success email
    if (user) {
        sendEmail({
            to: user.email,
            ...paymentSuccessEmail({
                firstName: user.firstName,
                transactionId: payment.transactionId,
                amount: payment.amount,
                currency: payment.currency,
                type: payment.type,
                description: payment.description
            })
        }).catch(err => console.error('Payment success email error:', err.message));
    }
};

/**
 * Process failed payment
 */
const processPaymentFailure = async (payment, errorMessage) => {
    const { sendEmail } = require('../config/email');
    const { paymentFailedEmail } = require('../utils/emailTemplates');

    const user = await User.findByPk(payment.userId);

    if (user) {
        sendEmail({
            to: user.email,
            ...paymentFailedEmail({
                firstName: user.firstName,
                transactionId: payment.transactionId,
                amount: payment.amount,
                currency: payment.currency,
                errorMessage: errorMessage
            })
        }).catch(err => console.error('Payment failed email error:', err.message));
    }
};

/**
 * Verify payment status
 * GET /api/payments/:transactionId/status
 */
const checkPaymentStatus = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    const payment = await Payment.findByTransactionId(transactionId);
    if (!payment) {
        throw new AppError(req.t('payment.notFound'), 404);
    }

    // If pending, check with CinetPay
    if (payment.status === 'PENDING' || payment.status === 'WAITING_CUSTOMER') {
        try {
            const response = await axios.post(CINETPAY_CONFIG.checkUrl, {
                apikey: CINETPAY_CONFIG.apiKey,
                site_id: CINETPAY_CONFIG.siteId,
                transaction_id: transactionId
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data.code === '00') {
                await payment.updateFromCinetPay(response.data.data);

                if (response.data.data.status === 'ACCEPTED') {
                    await processPaymentSuccess(payment);
                }
            }
        } catch (error) {
            logger.error(`Error checking payment status: ${error.message}`);
        }
    }

    i18nResponse(req, res, 200, 'payment.status', {
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        type: payment.type,
        paymentMethod: payment.paymentMethod,
        paidAt: payment.paidAt
    });
});

/**
 * Get user's payment history
 * GET /api/payments/history
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const { limit: queryLimit, offset } = getPaginationParams(page, limit);

    const { count, rows: payments } = await Payment.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: queryLimit,
        offset
    });

    const pagination = getPaginationData(page, queryLimit, count);

    i18nResponse(req, res, 200, 'payment.history', { payments, pagination });
});

/**
 * Admin: Get all payments
 * GET /api/admin/payments
 */
const getAllPayments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, type } = req.query;
    const { limit: queryLimit, offset } = getPaginationParams(page, limit);
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;

    const { count, rows: payments } = await Payment.findAndCountAll({
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

    // Calculate totals
    const totals = await Payment.findAll({
        where: { status: 'ACCEPTED' },
        attributes: [
            [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount']
        ],
        raw: true
    });

    i18nResponse(req, res, 200, 'common.list', {
        payments,
        totals: totals[0],
        pagination
    });
});

module.exports = {
    initializePayment,
    initializeNotchPayPayment,
    handleWebhook,
    handleNotchPayWebhook,
    checkPaymentStatus,
    getPaymentHistory,
    getAllPayments
};
