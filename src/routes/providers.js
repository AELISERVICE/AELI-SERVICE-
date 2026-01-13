const express = require('express');
const router = express.Router();
const {
    createProvider,
    getProviders,
    getProviderById,
    updateProvider,
    deleteProviderPhoto,
    getMyProfile,
    getMyDashboard
} = require('../controllers/providerController');
const { protect, restrictTo } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const { handleGalleryPhotosUpload } = require('../middlewares/upload');
const {
    createProviderValidation,
    updateProviderValidation,
    listProvidersValidation
} = require('../validators/serviceValidator');

// Public routes
router.get('/', listProvidersValidation, validate, getProviders);
router.get('/:id', getProviderById);

// Protected routes (require authentication)
router.use(protect);

// Provider-specific routes
router.post('/create', restrictTo('provider'), handleGalleryPhotosUpload, createProviderValidation, validate, createProvider);
router.get('/my-profile', restrictTo('provider'), getMyProfile);
router.get('/my-dashboard', restrictTo('provider'), getMyDashboard);
router.put('/:id', handleGalleryPhotosUpload, updateProviderValidation, validate, updateProvider);
router.delete('/:id/photos/:photoIndex', deleteProviderPhoto);

module.exports = router;
