const { Server } = require('socket.io');
const logger = require('../utils/logger');

const { allAllowedOrigins } = require('./cors');

let io = null;

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - The HTTP server instance
 */
const initSocketIO = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: allAllowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Connection handler
    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        // Join user-specific room when authenticated
        socket.on('authenticate', (userId) => {
            if (userId) {
                socket.join(`user:${userId}`);
                logger.debug(`Socket ${socket.id} joined room user:${userId}`);
            }
        });

        // Join provider-specific room
        socket.on('join-provider', (providerId) => {
            if (providerId) {
                socket.join(`provider:${providerId}`);
                logger.debug(`Socket ${socket.id} joined room provider:${providerId}`);
            }
        });

        // Leave provider room
        socket.on('leave-provider', (providerId) => {
            if (providerId) {
                socket.leave(`provider:${providerId}`);
            }
        });

        // Admin room
        socket.on('join-admin', () => {
            socket.join('admin');
            logger.debug(`Socket ${socket.id} joined admin room`);
        });

        socket.on('disconnect', (reason) => {
            logger.debug(`Socket disconnected: ${socket.id} - ${reason}`);
        });
    });

    logger.info(' Socket.IO initialized');
    return io;
};

/**
 * Get Socket.IO instance
 */
const getIO = () => {
    if (!io) {
        logger.warn('Socket.IO not initialized');
    }
    return io;
};

// ==================== NOTIFICATION EMITTERS ====================

/**
 * Emit new contact notification to provider
 */
const emitNewContact = (providerId, contact) => {
    if (!io) return;
    io.to(`provider:${providerId}`).emit('new-contact', {
        type: 'contact',
        message: 'Nouvelle demande de contact',
        data: contact
    });
};

/**
 * Emit new review notification to provider
 */
const emitNewReview = (providerId, review) => {
    if (!io) return;
    io.to(`provider:${providerId}`).emit('new-review', {
        type: 'review',
        message: 'Nouvel avis reçu',
        data: review
    });
};

/**
 * Emit provider verification notification
 */
const emitProviderVerified = (userId, provider) => {
    if (!io) return;
    io.to(`user:${userId}`).emit('provider-verified', {
        type: 'verification',
        message: 'Votre profil prestataire a été vérifié !',
        data: provider
    });
};

/**
 * Emit stats update to admin dashboard
 */
const emitAdminStatsUpdate = (stats) => {
    if (!io) return;
    io.to('admin').emit('stats-update', {
        type: 'stats',
        data: stats
    });
};

/**
 * Emit contact status change to sender
 */
const emitContactStatusChange = (userId, contact) => {
    if (!io) return;
    io.to(`user:${userId}`).emit('contact-status', {
        type: 'contact-status',
        message: `Votre demande a été ${contact.status === 'read' ? 'lue' : 'répondue'}`,
        data: contact
    });
};

module.exports = {
    initSocketIO,
    getIO,
    emitNewContact,
    emitNewReview,
    emitProviderVerified,
    emitAdminStatsUpdate,
    emitContactStatusChange
};
