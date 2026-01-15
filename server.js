require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/database');
const { verifyTransporter } = require('./src/config/email');
const { initRedis, closeRedis } = require('./src/config/redis');
const { initSocketIO } = require('./src/config/socket');
const { initCronJobs, stopCronJobs } = require('./src/jobs/cron');
const { initEmailWorker } = require('./src/workers/emailWorker');
const { closeQueues } = require('./src/config/queue');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);

    try {
        // Stop cron jobs first
        stopCronJobs();
        logger.info('Cron jobs stopped.');

        server.close();
        logger.info('HTTP server closed.');

        await closeQueues();
        logger.info('Bull queues closed.');

        await closeRedis();
        logger.info('Redis connection closed.');

        await sequelize.close();
        logger.info('Database connection closed.');

        process.exit(0);
    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Verify email transporter (optional, won't block startup)
        verifyTransporter();

        // Initialize Redis (optional, won't block startup)
        initRedis();

        // Initialize Socket.IO
        initSocketIO(server);

        // Sync database models (use { alter: true } in development, { force: false } in production)
        const syncOptions = process.env.NODE_ENV === 'development'
            ? { alter: true }
            : { force: false };

        await sequelize.sync(syncOptions);
        logger.info('✅ Database models synchronized');

        // Initialize background services
        if (process.env.NODE_ENV !== 'test') {
            // Initialize email worker (Bull)
            initEmailWorker();

            // Initialize cron jobs
            initCronJobs();
        }

        // Start listening
        server.listen(PORT, () => {
            logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌸 AELI SERVICES API                                   ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                          ║
║   API Health: http://localhost:${PORT}/api/health            ║
║   WebSocket: ws://localhost:${PORT}                          ║
║   Cron Jobs: Active                                       ║
║   Email Queue: Active                                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Port ${PORT} is already in use`);
                process.exit(1);
            }
            throw error;
        });

        // Handle graceful shutdown
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', error);
    process.exit(1);
});

// Start the server
startServer();

