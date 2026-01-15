const { body, param, query } = require('express-validator');

/**
 * @typedef {import('express-validator').ValidationChain} ValidationChain
 */

/**
 * Validation rules for initializing a payment
 * @type {ValidationChain[]}
 */
const initializePaymentValidation = [
    body('amount')
        .notEmpty()
        .withMessage('Le montant est requis')
        .isInt({ min: 100 })
        .withMessage('Le montant minimum est de 100 FCFA')
        .custom((value) => {
            if (value % 5 !== 0) {
                throw new Error('Le montant doit être un multiple de 5');
            }
            return true;
        }),

    body('type')
        .notEmpty()
        .withMessage('Le type de paiement est requis')
        .isIn(['contact_premium', 'featured', 'boost', 'subscription'])
        .withMessage('Type de paiement invalide. Valeurs acceptées: contact_premium, featured, boost, subscription'),

    body('providerId')
        .optional()
        .isUUID(4)
        .withMessage('ID prestataire invalide'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('La description ne doit pas dépasser 255 caractères')
];

/**
 * Validation rules for webhook payload from CinetPay
 * @type {ValidationChain[]}
 */
const webhookValidation = [
    body('cpm_trans_id')
        .notEmpty()
        .withMessage('Transaction ID requis'),

    body('cpm_site_id')
        .notEmpty()
        .withMessage('Site ID requis'),

    body('cpm_amount')
        .optional()
        .isNumeric()
        .withMessage('Montant invalide'),

    body('cpm_currency')
        .optional()
        .isIn(['XAF', 'XOF', 'CDF', 'GNF', 'USD'])
        .withMessage('Devise non supportée')
];

/**
 * Validation rules for checking payment status
 * @type {ValidationChain[]}
 */
const checkPaymentStatusValidation = [
    param('transactionId')
        .notEmpty()
        .withMessage('Transaction ID requis')
        .isLength({ min: 10, max: 100 })
        .withMessage('Format de transaction ID invalide')
];

/**
 * Validation rules for payment history query
 * @type {ValidationChain[]}
 */
const paymentHistoryValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Le numéro de page doit être un entier positif'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('La limite doit être entre 1 et 100'),

    query('status')
        .optional()
        .isIn(['PENDING', 'WAITING_CUSTOMER', 'ACCEPTED', 'REFUSED', 'CANCELLED', 'EXPIRED'])
        .withMessage('Statut invalide'),

    query('type')
        .optional()
        .isIn(['contact_premium', 'featured', 'boost', 'subscription'])
        .withMessage('Type invalide')
];

module.exports = {
    initializePaymentValidation,
    webhookValidation,
    checkPaymentStatusValidation,
    paymentHistoryValidation
};
