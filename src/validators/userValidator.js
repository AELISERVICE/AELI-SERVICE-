const { body } = require('express-validator');

/**
 * Validation rules for updating user profile
 */
const updateProfileValidation = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le prénom doit contenir entre 2 et 100 caractères'),

    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères'),

    body('phone')
        .optional()
        .trim()
        .matches(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/)
        .withMessage('Numéro de téléphone invalide')
];

module.exports = {
    updateProfileValidation
};
