const logger = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Handle Sequelize validation errors
 */
const handleSequelizeValidationError = (err) => {
    const errors = err.errors.map(e => ({
        field: e.path,
        message: e.message
    }));
    return {
        statusCode: 400,
        message: 'Erreur de validation',
        errors
    };
};

/**
 * Handle Sequelize unique constraint errors
 */
const handleSequelizeUniqueConstraintError = (err) => {
    const field = err.errors[0]?.path || 'field';
    return {
        statusCode: 400,
        message: `Cette valeur existe déjà pour le champ: ${field}`
    };
};

/**
 * Handle Sequelize foreign key constraint errors
 */
const handleSequelizeForeignKeyError = (err) => {
    return {
        statusCode: 400,
        message: 'Référence invalide: la ressource liée n\'existe pas'
    };
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => ({
    statusCode: 401,
    message: 'Token invalide, veuillez vous reconnecter'
});

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = () => ({
    statusCode: 401,
    message: 'Votre session a expiré, veuillez vous reconnecter'
});

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
        error: err,
        stack: err.stack
    });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.errors && { errors: err.errors })
        });
    } else {
        // Programming or unknown error: don't leak error details
        logger.error('ERROR 💥', err);

        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue, veuillez réessayer'
        });
    }
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // Handle specific error types
        if (err.name === 'SequelizeValidationError') {
            const formattedError = handleSequelizeValidationError(err);
            error = new AppError(formattedError.message, formattedError.statusCode);
            error.errors = formattedError.errors;
        }

        if (err.name === 'SequelizeUniqueConstraintError') {
            const formattedError = handleSequelizeUniqueConstraintError(err);
            error = new AppError(formattedError.message, formattedError.statusCode);
        }

        if (err.name === 'SequelizeForeignKeyConstraintError') {
            const formattedError = handleSequelizeForeignKeyError(err);
            error = new AppError(formattedError.message, formattedError.statusCode);
        }

        if (err.name === 'JsonWebTokenError') {
            const formattedError = handleJWTError();
            error = new AppError(formattedError.message, formattedError.statusCode);
        }

        if (err.name === 'TokenExpiredError') {
            const formattedError = handleJWTExpiredError();
            error = new AppError(formattedError.message, formattedError.statusCode);
        }

        sendErrorProd(error, res);
    }
};

/**
 * Handle 404 - Route not found
 */
const notFound = (req, res, next) => {
    const error = new AppError(`Route non trouvée: ${req.originalUrl}`, 404);
    next(error);
};

/**
 * Async handler wrapper to catch errors in async functions
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    AppError,
    errorHandler,
    notFound,
    asyncHandler
};
