const { body, param } = require('express-validator');

/**
 * @typedef {import('express-validator').ValidationChain} ValidationChain
 */

/**
 * Available subscription plans
 */
const VALID_PLANS = ['monthly', 'quarterly', 'yearly'];

/**
 * Validation rules for renewing/upgrading subscription
 * @type {ValidationChain[]}
 */
const renewSubscriptionValidation = [
    body('plan')
        .notEmpty()
        .withMessage('Le plan d\'abonnement est requis')
        .isIn(VALID_PLANS)
        .withMessage(`Plan invalide. Valeurs acceptées: ${VALID_PLANS.join(', ')}`),

    body('paymentId')
        .optional()
        .isUUID(4)
        .withMessage('ID de paiement invalide')
];

/**
 * Validation rules for provider ID parameter
 * @type {ValidationChain[]}
 */
const providerIdValidation = [
    param('providerId')
        .optional()
        .isUUID(4)
        .withMessage('ID prestataire invalide')
];

/**
 * Validation rules for subscription status check
 * @type {ValidationChain[]}
 */
const subscriptionStatusValidation = [
    param('providerId')
        .notEmpty()
        .withMessage('ID prestataire requis')
        .isUUID(4)
        .withMessage('ID prestataire invalide')
];

/**
 * Validation rules for canceling subscription
 * @type {ValidationChain[]}
 */
const cancelSubscriptionValidation = [
    body('reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La raison ne doit pas dépasser 500 caractères')
];

module.exports = {
    renewSubscriptionValidation,
    providerIdValidation,
    subscriptionStatusValidation,
    cancelSubscriptionValidation,
    VALID_PLANS
};
