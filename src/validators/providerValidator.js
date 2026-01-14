const { body, param } = require('express-validator');

/**
 * Validation for provider ID param
 */
const providerIdValidation = [
    param('id')
        .isUUID()
        .withMessage('ID prestataire invalide')
];

/**
 * Validation for creating a provider
 */
const createProviderValidation = [
    body('businessName')
        .trim()
        .notEmpty()
        .withMessage('Le nom de l\'entreprise est requis')
        .isLength({ min: 2, max: 200 })
        .withMessage('Le nom doit contenir entre 2 et 200 caractères'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('La description est requise')
        .isLength({ min: 50, max: 5000 })
        .withMessage('La description doit contenir entre 50 et 5000 caractères'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('La localisation est requise')
        .isLength({ max: 200 })
        .withMessage('La localisation ne peut pas dépasser 200 caractères'),
    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 }),
    body('whatsapp')
        .optional()
        .trim()
        .isMobilePhone('any')
        .withMessage('Numéro WhatsApp invalide'),
    body('facebook')
        .optional()
        .trim()
        .isURL()
        .withMessage('URL Facebook invalide'),
    body('instagram')
        .optional()
        .trim()
        .isLength({ max: 100 })
];

/**
 * Validation for updating a provider
 */
const updateProviderValidation = [
    param('id')
        .isUUID()
        .withMessage('ID prestataire invalide'),
    body('businessName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 }),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 50, max: 5000 }),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 }),
    body('address')
        .optional()
        .trim(),
    body('whatsapp')
        .optional()
        .trim(),
    body('facebook')
        .optional()
        .trim(),
    body('instagram')
        .optional()
        .trim()
];

/**
 * Validation for deleting a photo
 */
const deletePhotoValidation = [
    param('id')
        .isUUID()
        .withMessage('ID prestataire invalide'),
    param('photoIndex')
        .isInt({ min: 0, max: 9 })
        .withMessage('Index de photo invalide')
];

module.exports = {
    providerIdValidation,
    createProviderValidation,
    updateProviderValidation,
    deletePhotoValidation
};
