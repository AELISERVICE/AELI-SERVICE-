const crypto = require('crypto');

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
        name: [['business_name', 'ASC']]
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
    successResponse
};
