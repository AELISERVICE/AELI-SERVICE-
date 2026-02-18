const { body, param } = require('express-validator');

/**
 * Validate user status update
 */
const updateUserStatusValidation = [
    param('id')
        .isUUID()
        .withMessage('ID utilisateur invalide'),
    body('isActive')
        .isBoolean()
        .withMessage('isActive doit être un booléen')
];

/**
 * Validate provider verification
 */
const verifyProviderValidation = [
    param('id')
        .isUUID()
        .withMessage('ID prestataire invalide'),
    body('isVerified')
        .isBoolean()
        .withMessage('isVerified doit être un booléen'),
    body('rejectionReason')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('Le motif de rejet doit contenir entre 5 et 500 caractères')
];

/**
 * Validate provider featuring
 */
const featureProviderValidation = [
    param('id')
        .isUUID()
        .withMessage('ID prestataire invalide'),
    body('isFeatured')
        .isBoolean()
        .withMessage('isFeatured doit être un booléen')
];

/**
 * Validate review visibility
 */
const updateReviewVisibilityValidation = [
    param('id')
        .isUUID()
        .withMessage('ID avis invalide'),
    body('isVisible')
        .isBoolean()
        .withMessage('isVisible doit être un booléen')
];

/**
 * Validate category creation/update
 */
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom de la catégorie est requis')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La description ne peut pas dépasser 500 caractères'),
    body('icon')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('L\'icône ne peut pas dépasser 50 caractères'),
    body('order')
        .optional()
        .isInt({ min: 0 })
        .withMessage('L\'ordre doit être un entier positif'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive doit être un booléen')
];

/**
 * Validate category update
 */
const updateCategoryValidation = [
    param('id')
        .isUUID()
        .withMessage('ID catégorie invalide'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
    body('description')
        .optional()
        .trim(),
    body('icon')
        .optional()
        .trim(),
    body('order')
        .optional()
        .isInt({ min: 0 }),
    body('isActive')
        .optional()
        .isBoolean()
];

module.exports = {
    updateUserStatusValidation,
    verifyProviderValidation,
    featureProviderValidation,
    updateReviewVisibilityValidation,
    categoryValidation,
    updateCategoryValidation
};
