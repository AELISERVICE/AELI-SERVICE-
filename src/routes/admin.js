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
const {
    exportUsersCSV,
    exportProvidersCSV,
    exportReviewsCSV,
    exportContactsCSV,
    exportReportPDF
} = require('../controllers/exportController');
const { protect, restrictTo } = require('../middlewares/auth');
const { AuditLog, ApiUsage, BannedIP } = require('../models');
const { asyncHandler } = require('../middlewares/errorHandler');

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

// ============ EXPORTS ============
router.get('/export/users', exportUsersCSV);
router.get('/export/providers', exportProvidersCSV);
router.get('/export/reviews', exportReviewsCSV);
router.get('/export/contacts', exportContactsCSV);
router.get('/export/report', exportReportPDF);

// ============ AUDIT LOGS ============
router.get('/audit-logs', asyncHandler(async (req, res) => {
    const { limit = 100, userId, entityType } = req.query;
    const where = {};
    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;

    const logs = await AuditLog.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        include: [{ association: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
    });
    res.json({ success: true, data: { logs } });
}));

// ============ API ANALYTICS ============
router.get('/analytics', asyncHandler(async (req, res) => {
    const stats = await ApiUsage.getOverallStats();
    const endpoints = await ApiUsage.getEndpointStats({ limit: 20 });
    res.json({ success: true, data: { stats, endpoints } });
}));

router.get('/analytics/hourly', asyncHandler(async (req, res) => {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const hourly = await ApiUsage.getHourlyBreakdown(date);
    res.json({ success: true, data: { hourly } });
}));

// ============ IP BANLIST ============
router.get('/banned-ips', asyncHandler(async (req, res) => {
    const ips = await BannedIP.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: { bannedIPs: ips } });
}));

router.post('/banned-ips', asyncHandler(async (req, res) => {
    const { ipAddress, reason, duration } = req.body;
    await BannedIP.banIP(ipAddress, {
        reason,
        bannedBy: req.user.id,
        duration
    });
    res.status(201).json({ success: true, message: 'IP bannie' });
}));

router.delete('/banned-ips/:ip', asyncHandler(async (req, res) => {
    await BannedIP.unbanIP(req.params.ip);
    res.json({ success: true, message: 'IP débannie' });
}));

// ============ PAYMENTS ============
const { getAllPayments } = require('../controllers/paymentController');
router.get('/payments', getAllPayments);

module.exports = router;
