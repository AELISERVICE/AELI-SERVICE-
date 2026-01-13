const express = require('express');
const router = express.Router();
const {
    getStats,
    getPendingProviders,
    verifyProvider,
    featureProvider,
    updateUserStatus,
    getAllReviews,
    updateReviewVisibility,
    getAllUsers
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/auth');

// All routes require admin authentication
router.use(protect);
router.use(restrictTo('admin'));

// Statistics
router.get('/stats', getStats);

// Users management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

// Providers management
router.get('/providers/pending', getPendingProviders);
router.put('/providers/:id/verify', verifyProvider);
router.put('/providers/:id/feature', featureProvider);

// Reviews moderation
router.get('/reviews', getAllReviews);
router.put('/reviews/:id/visibility', updateReviewVisibility);

module.exports = router;
