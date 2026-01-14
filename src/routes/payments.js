const express = require('express');
const router = express.Router();
const {
    initializePayment,
    handleWebhook,
    checkPaymentStatus,
    getPaymentHistory
} = require('../controllers/paymentController');
const { protect, optionalAuth } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');
const { AppError } = require('../middlewares/errorHandler');

// Validation middleware
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map(e => e.msg).join(', ');
        return next(new AppError(messages, 400));
    }
    next();
};

/**
 * @swagger
 * /api/payments/initialize:
 *   post:
 *     summary: Initialize a payment with CinetPay
 *     tags: [Payments]
 */
router.post('/initialize',
    optionalAuth,
    [
        body('amount')
            .isInt({ min: 100 })
            .withMessage('Le montant minimum est 100 FCFA')
            .custom(value => value % 5 === 0)
            .withMessage('Le montant doit être un multiple de 5'),
        body('type')
            .isIn(['contact_premium', 'featured', 'boost', 'subscription'])
            .withMessage('Type de paiement invalide'),
        body('providerId')
            .optional()
            .isUUID()
            .withMessage('ID prestataire invalide'),
        body('description')
            .optional()
            .isLength({ max: 255 })
            .trim()
    ],
    handleValidation,
    initializePayment
);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: CinetPay webhook endpoint (called by CinetPay)
 *     tags: [Payments]
 */
router.post('/webhook', handleWebhook);

/**
 * @swagger
 * /api/payments/{transactionId}/status:
 *   get:
 *     summary: Check payment status
 *     tags: [Payments]
 */
router.get('/:transactionId/status', checkPaymentStatus);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get user's payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/history', protect, getPaymentHistory);

module.exports = router;
