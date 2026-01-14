const { body, param } = require('express-validator');

/**
 * Validation for creating a review
 */
const createReviewValidation = [
    body('providerId')
        .notEmpty()
        .withMessage('L\'ID du prestataire est requis')
        .isUUID()
        .withMessage('ID prestataire invalide'),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('La note doit être entre 1 et 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Le commentaire ne peut pas dépasser 1000 caractères')
];

/**
 * Validation for updating a review
 */
const updateReviewValidation = [
    param('id')
        .isUUID()
        .withMessage('ID avis invalide'),
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('La note doit être entre 1 et 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Le commentaire ne peut pas dépasser 1000 caractères')
];

/**
 * Validation for review ID param
 */
const reviewIdValidation = [
    param('id')
        .isUUID()
        .withMessage('ID avis invalide')
];

module.exports = {
    createReviewValidation,
    updateReviewValidation,
    reviewIdValidation
};
