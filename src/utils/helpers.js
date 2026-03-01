const crypto = require('crypto');
const logger = require('./logger');
const { sendEmail: sendEmailService } = require('../config/email');

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalItems - Total number of items
 * @returns {Object} Pagination metadata
 */
const getPaginationData = (page, limit, totalItems) => {
    const currentPage = parseInt(page) || 1;
    const itemsPerPage = parseInt(limit) || 12;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
    };
};

/**
 * Calculate offset for database queries
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Limit and offset values
 */
const getPaginationParams = (page = 1, limit = 12) => {
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const offset = (parsedPage - 1) * parsedLimit;

    return {
        limit: parsedLimit,
        offset
    };
};

/**
 * Generate a random token for password reset
 * @returns {Object} Token and hashed token
 */
const generateResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    return {
        resetToken,
        hashedToken
    };
};

/**
 * Hash a token for comparison
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
const hashToken = (token) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
};

/**
 * Clean phone number (remove spaces, dashes, etc.)
 * @param {string} phone - Phone number to clean
 * @returns {string} Cleaned phone number
 */
const cleanPhoneNumber = (phone) => {
    if (!phone) return null;
    return phone.replace(/[\s\-\.\(\)]/g, '');
};

/**
 * Format price in FCFA
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
const formatPrice = (price) => {
    if (!price) return 'Sur demande';
    return new Intl.NumberFormat('fr-CM', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0
    }).format(price);
};

/**
 * Sanitize string for search (remove special characters)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeSearchString = (str) => {
    if (!str) return '';
    return str
        .trim()
        .replace(/[<>]/g, '')
        .substring(0, 100);
};

/**
 * Build sort order for Sequelize
 * @param {string} sortParam - Sort parameter (e.g., 'rating', 'recent', 'views')
 * @returns {Array} Sequelize order array
 */
const buildSortOrder = (sortParam) => {
    const sortOptions = {
        rating: [['average_rating', 'DESC']],
        recent: [['created_at', 'DESC']],
        views: [['views_count', 'DESC']],
        contacts: [['contacts_count', 'DESC']],
        name: [['business_name', 'ASC']],
        price_asc: [['min_price', 'ASC']],
        price_desc: [['min_price', 'DESC']]
    };

    return sortOptions[sortParam] || sortOptions.recent;
};

/**
 * Extract photo URLs from uploaded files
 * @param {Array} files - Multer file objects
 * @returns {Array} Array of photo URLs
 */
const extractPhotoUrls = (files) => {
    if (!files || !Array.isArray(files)) return [];
    return files.map(file => file.path || file.secure_url || file.url);
};

/**
 * Create success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 */
const successResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Create internationalized success response
 * Uses the i18n middleware to translate message keys
 * @param {Object} req - Express request object (with req.t function)
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} messageKey - i18n message key (e.g., 'provider.created')
 * @param {Object} data - Response data
 * @param {Object} params - Parameters for message interpolation
 */
const i18nResponse = (req, res, statusCode, messageKey, data = null, params = {}) => {
    // Use req.t() if available (i18n middleware), otherwise return the key
    const message = req.t ? req.t(messageKey, params) : messageKey;

    const response = {
        success: statusCode >= 200 && statusCode < 300,
        message,
        messageKey // Include key for debugging/testing
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Parse boolean from various formats
 * @param {any} value - Value to parse
 * @returns {boolean|undefined}
 */
const parseBoolean = (value) => {
    if (value === true || value === 'true' || value === '1' || value === 1) return true;
    if (value === false || value === 'false' || value === '0' || value === 0) return false;
    return undefined;
};

/**
 * Send email safely with proper error handling
 * This function centralizes email sending logic and handles errors gracefully
 * without blocking the main flow (emails are non-critical)
 * @param {Object} emailData - Email data { to, subject, html, text }
 * @param {string} emailType - Type of email (for logging purposes)
 * @returns {Promise<Object|null>} Email info or null if failed
 */
const sendEmailSafely = async (emailData, emailType = 'email') => {
    try {
        if (!sendEmailService || typeof sendEmailService !== 'function') {
            logger.warn(`Email service not available. Cannot send ${emailType} to ${emailData.to}`);
            return null;
        }

        const emailResult = await sendEmailService(emailData);
        logger.info(`Email sent: ${emailType} to ${emailData.to}`);
        return emailResult;
    } catch (error) {
        logger.error(`Failed to send ${emailType} to ${emailData.to}:`, {
            error: error.message,
            emailType,
            recipient: emailData.to
        });
        return null; // Never crash the main request
    }
};

module.exports = {
    getPaginationData,
    getPaginationParams,
    generateResetToken,
    hashToken,
    cleanPhoneNumber,
    formatPrice,
    sanitizeSearchString,
    buildSortOrder,
    extractPhotoUrls,
    successResponse,
    i18nResponse,
    parseBoolean,
    sendEmailSafely
};

