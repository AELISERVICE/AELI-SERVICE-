const { body, query } = require('express-validator');

/**
 * Validation rules for creating a provider profile
 */
const createProviderValidation = [
    body('businessName')
        .trim()
        .notEmpty()
        .withMessage('Le nom de l\'entreprise est requis')
        .isLength({ min: 2, max: 255 })
        .withMessage('Le nom doit contenir entre 2 et 255 caractères'),

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
        .isLength({ max: 255 })
        .withMessage('La localisation ne peut pas dépasser 255 caractères'),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('L\'adresse ne peut pas dépasser 500 caractères'),

    body('whatsapp')
        .optional()
        .trim()
        .matches(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/)
        .withMessage('Numéro WhatsApp invalide'),

    body('facebook')
        .optional()
        .trim()
        .isURL()
        .withMessage('URL Facebook invalide'),

    body('instagram')
        .optional()
        .trim()
];

/**
 * Validation rules for updating a provider profile
 */
const updateProviderValidation = [
    body('businessName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Le nom doit contenir entre 2 et 255 caractères'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 50, max: 5000 })
        .withMessage('La description doit contenir entre 50 et 5000 caractères'),

    body('location')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('La localisation ne peut pas dépasser 255 caractères'),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('L\'adresse ne peut pas dépasser 500 caractères'),

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
 * Validation rules for listing providers
 */
const listProvidersValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Le numéro de page doit être un entier positif'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('La limite doit être entre 1 et 50'),

    query('minRating')
        .optional()
        .isFloat({ min: 0, max: 5 })
        .withMessage('La note minimum doit être entre 0 et 5'),

    query('sort')
        .optional()
        .isIn(['rating', 'recent', 'views', 'name'])
        .withMessage('Tri invalide')
];

/**
 * Validation rules for creating a service
 */
const createServiceValidation = [
    body('categoryId')
        .notEmpty()
        .withMessage('La catégorie est requise')
        .isUUID()
        .withMessage('ID de catégorie invalide'),

    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom du service est requis')
        .isLength({ min: 2, max: 255 })
        .withMessage('Le nom doit contenir entre 2 et 255 caractères'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('La description est requise')
        .isLength({ min: 10, max: 2000 })
        .withMessage('La description doit contenir entre 10 et 2000 caractères'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le prix doit être un nombre positif'),

    body('priceType')
        .optional()
        .isIn(['fixed', 'from', 'range', 'contact'])
        .withMessage('Type de prix invalide'),

    body('duration')
        .optional()
        .isInt({ min: 0 })
        .withMessage('La durée doit être un nombre positif'),

    body('tags')
        .optional()
        .isArray()
        .withMessage('Les tags doivent être un tableau')
];

/**
 * Validation rules for updating a service
 */
const updateServiceValidation = [
    body('categoryId')
        .optional()
        .isUUID()
        .withMessage('ID de catégorie invalide'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Le nom doit contenir entre 2 et 255 caractères'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('La description doit contenir entre 10 et 2000 caractères'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le prix doit être un nombre positif'),

    body('priceType')
        .optional()
        .isIn(['fixed', 'from', 'range', 'contact'])
        .withMessage('Type de prix invalide'),

    body('duration')
        .optional()
        .isInt({ min: 0 })
        .withMessage('La durée doit être un nombre positif'),

    body('tags')
        .optional()
        .isArray()
        .withMessage('Les tags doivent être un tableau'),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive doit être un booléen')
];

/**
 * Validation rules for creating a category (admin)
 */
const createCategoryValidation = [
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
        .isLength({ max: 100 })
        .withMessage('L\'icône ne peut pas dépasser 100 caractères'),

    body('order')
        .optional()
        .isInt({ min: 0 })
        .withMessage('L\'ordre doit être un entier positif')
];

/**
 * Validation rules for provider application
 */
const applyProviderValidation = [
    body('businessName')
        .trim()
        .notEmpty()
        .withMessage('Le nom de l\'activité est requis')
        .isLength({ min: 2, max: 255 })
        .withMessage('Le nom doit contenir entre 2 et 255 caractères'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('La description de l\'activité est requise')
        .isLength({ min: 50, max: 5000 })
        .withMessage('La description doit contenir entre 50 et 5000 caractères'),

    body('location')
        .trim()
        .notEmpty()
        .withMessage('La ville est requise')
        .isLength({ max: 255 })
        .withMessage('La localisation ne peut pas dépasser 255 caractères'),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('L\'adresse ne peut pas dépasser 500 caractères'),

    body('whatsapp')
        .optional()
        .trim()
        .matches(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/)
        .withMessage('Numéro WhatsApp invalide'),

    body('facebook')
        .optional()
        .trim(),

    body('instagram')
        .optional()
        .trim()
];

module.exports = {
    createProviderValidation,
    updateProviderValidation,
    listProvidersValidation,
    createServiceValidation,
    updateServiceValidation,
    createCategoryValidation,
    applyProviderValidation
};
