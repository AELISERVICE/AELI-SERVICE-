const { body } = require('express-validator');

/**
 * Validation rules for contact form
 */
const contactValidation = [
    body('providerId')
        .notEmpty()
        .withMessage('L\'ID du prestataire est requis')
        .isUUID()
        .withMessage('ID invalide'),

    body('message')
        .trim()
        .notEmpty()
        .withMessage('Le message est requis')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Le message doit contenir entre 10 et 2000 caractères'),

    body('senderName')
        .trim()
        .notEmpty()
        .withMessage('Votre nom est requis')
        .isLength({ max: 200 })
        .withMessage('Le nom ne peut pas dépasser 200 caractères'),

    body('senderEmail')
        .trim()
        .isEmail()
        .withMessage('Veuillez fournir un email valide')
        .normalizeEmail(),

    body('senderPhone')
        .optional()
        .trim()
];

/**
 * Validation rules for review
 */
const reviewValidation = [
    body('providerId')
        .notEmpty()
        .withMessage('L\'ID du prestataire est requis')
        .isUUID()
        .withMessage('ID invalide'),

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
 * Validation rules for favorite
 */
const favoriteValidation = [
    body('providerId')
        .notEmpty()
        .withMessage('L\'ID du prestataire est requis')
        .isUUID()
        .withMessage('ID invalide')
];

module.exports = {
    contactValidation,
    reviewValidation,
    favoriteValidation
};
