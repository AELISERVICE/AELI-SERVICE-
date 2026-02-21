const express = require('express');
const router = express.Router();
const {
    getCategories,
    createCategory,
    updateCategory,
    createService,
    getServicesByProvider,
    updateService,
    deleteService,
    getCategoriesByProvider,
    deleteProviderCategory
} = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const {
    createCategoryValidation,
    createServiceValidation,
    updateServiceValidation
} = require('../validators/serviceValidator');

// ============ CATEGORY ROUTES ============

// Public
router.get('/categories', getCategories);

// Admin or Provider can create categories
router.post('/categories', protect, restrictTo('admin', 'provider'), createCategoryValidation, validate, createCategory);
router.put('/categories/:id', protect, restrictTo('admin'), updateCategory);

// ============ SERVICE ROUTES ============

// Public
router.get('/provider/:providerId', getServicesByProvider);
router.get('/provider/:providerId/categories', getCategoriesByProvider);

// Provider only
router.post('/', protect, restrictTo('provider'), createServiceValidation, validate, createService);
router.put('/:id', protect, updateServiceValidation, validate, updateService);
router.delete('/:id', protect, deleteService);
router.delete('/provider/category/:categoryId', protect, restrictTo('provider'), deleteProviderCategory);

module.exports = router;
