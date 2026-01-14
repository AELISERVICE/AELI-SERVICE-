const { body, param } = require('express-validator');

/**
 * Validation for adding a favorite
 */
const addFavoriteValidation = [
    body('providerId')
        .notEmpty()
        .withMessage('L\'ID du prestataire est requis')
        .isUUID()
        .withMessage('ID prestataire invalide')
];

/**
 * Validation for favorite provider ID param
 */
const favoriteProviderIdValidation = [
    param('providerId')
        .isUUID()
        .withMessage('ID prestataire invalide')
];

module.exports = {
    addFavoriteValidation,
    favoriteProviderIdValidation
};
