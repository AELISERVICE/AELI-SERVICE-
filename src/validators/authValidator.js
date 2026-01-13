const { body } = require('express-validator');

/**
 * Validation rules for user registration
 */
const registerValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Veuillez fournir un email valide')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),

    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('Le prénom est requis')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le prénom doit contenir entre 2 et 100 caractères'),

    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Le nom est requis')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères'),

    body('role')
        .optional()
        .isIn(['client', 'provider'])
        .withMessage('Le rôle doit être "client" ou "provider"'),

    body('phone')
        .optional()
        .trim()
        .matches(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/)
        .withMessage('Numéro de téléphone invalide')
];

/**
 * Validation rules for user login
 */
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Veuillez fournir un email valide')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Le mot de passe est requis')
];

/**
 * Validation rules for forgot password
 */
const forgotPasswordValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Veuillez fournir un email valide')
        .normalizeEmail()
];

/**
 * Validation rules for reset password
 */
const resetPasswordValidation = [
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
];

/**
 * Validation rules for password change
 */
const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Le mot de passe actuel est requis'),

    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
];

module.exports = {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    changePasswordValidation
};
