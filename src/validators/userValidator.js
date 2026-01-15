const { body } = require('express-validator');

/**
 * @typedef {import('express-validator').ValidationChain} ValidationChain
 */

/**
 * Validation rules for updating user profile
 * @type {ValidationChain[]}
 */
const updateProfileValidation = [
    body('firstName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Le prénom ne peut pas être vide')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le prénom doit contenir entre 2 et 100 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
        .withMessage('Le prénom contient des caractères invalides'),

    body('lastName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Le nom ne peut pas être vide')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
        .withMessage('Le nom contient des caractères invalides'),

    body('phone')
        .optional()
        .trim()
        .matches(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/)
        .withMessage('Numéro de téléphone invalide')
];

/**
 * Validation rules for changing password
 * @type {ValidationChain[]}
 */
const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Le mot de passe actuel est requis')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères'),

    body('newPassword')
        .notEmpty()
        .withMessage('Le nouveau mot de passe est requis')
        .isLength({ min: 8, max: 128 })
        .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),

    body('confirmPassword')
        .notEmpty()
        .withMessage('La confirmation du mot de passe est requise')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Les mots de passe ne correspondent pas');
            }
            return true;
        })
];

/**
 * Validation rules for updating email
 * @type {ValidationChain[]}
 */
const updateEmailValidation = [
    body('newEmail')
        .notEmpty()
        .withMessage('Le nouvel email est requis')
        .isEmail()
        .withMessage('Format d\'email invalide')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('L\'email ne doit pas dépasser 255 caractères'),

    body('password')
        .notEmpty()
        .withMessage('Le mot de passe est requis pour confirmer le changement d\'email')
];

/**
 * Validation rules for user ID parameter
 * @type {ValidationChain[]}
 */
const userIdValidation = [
    body('userId')
        .optional()
        .isUUID(4)
        .withMessage('ID utilisateur invalide')
];

module.exports = {
    updateProfileValidation,
    changePasswordValidation,
    updateEmailValidation,
    userIdValidation
};

