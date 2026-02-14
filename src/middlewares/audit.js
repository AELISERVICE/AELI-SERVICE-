/**
 * Audit logging middleware and utilities
 * Provides automatic audit trail for critical operations
 */

const { AuditLog } = require('../models');

/**
 * Audit context builder - extracts common data from request
 */
const getAuditContext = (req) => ({
    userId: req.user?.id || null,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers?.['user-agent'],
    endpoint: req.originalUrl || req.path,
    method: req.method
});

/**
 * Generic audit logger function
 * @param {Object} options - Audit options
 */
const logAudit = async (options) => {
    try {
        const {
            req,
            action,
            entityType,
            entityId,
            oldValues = null,
            newValues = null,
            metadata = null,
            description = null
        } = options;

        const context = req ? getAuditContext(req) : {};

        await AuditLog.create({
            userId: options.userId || context.userId,
            action,
            entityType,
            entityId,
            oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
            newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            endpoint: context.endpoint,
            method: context.method,
            metadata: {
                ...metadata,
                description
            }
        });
    } catch (error) {
        console.error('Audit log error:', error.message);
        // Don't throw - audit failures shouldn't break main flow
    }
};

/**
 * Specific audit loggers for common operations
 */
const auditLogger = {
    // Provider operations
    providerCreated: (req, provider) => logAudit({
        req,
        action: 'CREATE',
        entityType: 'Provider',
        entityId: provider.id,
        newValues: { businessName: provider.businessName, location: provider.location },
        description: `Prestataire "${provider.businessName}" créé`
    }),

    providerUpdated: (req, provider, oldValues) => logAudit({
        req,
        action: 'UPDATE',
        entityType: 'Provider',
        entityId: provider.id,
        oldValues,
        newValues: { businessName: provider.businessName, location: provider.location },
        description: `Prestataire "${provider.businessName}" modifié`
    }),

    providerVerified: (req, provider, isVerified) => logAudit({
        req,
        action: 'UPDATE',
        entityType: 'Provider',
        entityId: provider.id,
        oldValues: { isVerified: !isVerified },
        newValues: { isVerified },
        description: isVerified
            ? `Prestataire "${provider.businessName}" vérifié`
            : `Prestataire "${provider.businessName}" rejeté`
    }),

    // Document operations
    documentsUploaded: (req, provider, documentsCount) => logAudit({
        req,
        action: 'CREATE',
        entityType: 'Document',
        entityId: provider.id,
        metadata: { documentsCount },
        description: `${documentsCount} document(s) uploadé(s) pour "${provider.businessName}"`
    }),

    documentsReviewed: (req, provider, decision, notes) => logAudit({
        req,
        action: 'UPDATE',
        entityType: 'Document',
        entityId: provider.id,
        newValues: { verificationStatus: decision },
        metadata: { notes },
        description: `Documents de "${provider.businessName}" ${decision === 'approved' ? 'approuvés' : 'rejetés'}`
    }),

    // User operations
    userStatusChanged: (req, user, isActive) => logAudit({
        req,
        action: 'UPDATE',
        entityType: 'User',
        entityId: user.id,
        oldValues: { isActive: !isActive },
        newValues: { isActive },
        description: isActive
            ? `Compte de ${user.email} activé`
            : `Compte de ${user.email} désactivé`
    }),

    // Payment operations
    paymentCompleted: (payment, status) => logAudit({
        action: 'UPDATE',
        entityType: 'Payment',
        entityId: payment.id,
        newValues: { status, amount: payment.amount },
        userId: payment.userId,
        description: `Paiement ${payment.transactionId} - ${status}`
    }),

    // Review moderation
    reviewModerated: (req, review, isVisible) => logAudit({
        req,
        action: 'UPDATE',
        entityType: 'Review',
        entityId: review.id,
        newValues: { isVisible },
        description: isVisible
            ? `Avis #${review.id} rendu visible`
            : `Avis #${review.id} masqué`
    }),

    // Login/Logout
    userLoggedIn: (req, user) => logAudit({
        req,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        userId: user.id,
        description: `Connexion de ${user.email}`
    }),

    userLoggedOut: (req, user) => logAudit({
        req,
        action: 'LOGOUT',
        entityType: 'User',
        entityId: user.id,
        description: `Déconnexion de ${user.email}`
    }),

    passwordChanged: (req, user) => logAudit({
        req,
        action: 'UPDATE',
        entityType: 'User',
        entityId: user.id,
        description: `Mot de passe changé pour ${user.email}`
    }),

    passwordResetRequested: (req, user) => logAudit({
        req,
        action: 'OTHER',
        entityType: 'User',
        entityId: user.id,
        description: `Demande de réinitialisation de mot de passe pour ${user.email}`
    }),

    // Export operations
    dataExported: (req, exportType, count) => logAudit({
        req,
        action: 'EXPORT',
        entityType: exportType,
        metadata: { rowCount: count },
        description: `Export ${exportType}: ${count} lignes`
    })
};

module.exports = {
    logAudit,
    auditLogger
};
