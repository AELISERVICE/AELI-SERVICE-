const express = require('express');
const router = express.Router();
const {
    createProvider,
    getProviders,
    getProviderById,
    updateProvider,
    deleteProviderPhoto,
    getMyProfile,
    getMyDashboard,
    uploadDocuments,
    getDocuments,
    deleteDocument
} = require('../controllers/providerController');
const {
    applyToBeProvider,
    getMyApplication
} = require('../controllers/providerApplicationController');
const { protect, restrictTo } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const { handleGalleryPhotosUpload, handleDocumentUpload, handleApplicationUpload } = require('../middlewares/upload');
const {
    createProviderValidation,
    updateProviderValidation,
    listProvidersValidation,
    applyProviderValidation
} = require('../validators/serviceValidator');
const { cacheMiddleware } = require('../config/redis');

// Public routes
router.get('/', listProvidersValidation, validate, cacheMiddleware(600), getProviders);

// Protected routes (require authentication)
router.use(protect);

// ============ APPLICATION ROUTES (Client -> Provider) ============
// Apply to become a provider (clients only)
router.post('/apply', restrictTo('client'), handleApplicationUpload, applyProviderValidation, validate, applyToBeProvider);
router.get('/my-application', getMyApplication);

// ============ PROVIDER ROUTES ============
// Get by ID must come after named routes
router.get('/my-profile', restrictTo('provider'), getMyProfile);
router.get('/my-dashboard', restrictTo('provider'), getMyDashboard);

// Legacy create route (keep for backwards compatibility, but now mainly done via application approval)
router.post('/create', restrictTo('provider'), handleGalleryPhotosUpload, createProviderValidation, validate, createProvider);

router.put('/:id', handleGalleryPhotosUpload, updateProviderValidation, validate, updateProvider);
router.delete('/:id/photos/:photoIndex', deleteProviderPhoto);

// Document routes (KYC verification)
router.post('/:id/documents', handleDocumentUpload, uploadDocuments);
router.get('/:id/documents', getDocuments);
router.delete('/:id/documents/:docIndex', deleteDocument);

// Public get by ID (must be last to avoid capturing other routes)
router.get('/:id', cacheMiddleware(300), getProviderById);

module.exports = router;
