/**
 * Response Helper Utilities
 * Provides standardized response formatting and pagination helpers
 */

/**
 * @typedef {Object} PaginationInfo
 * @property {number} currentPage - Current page number
 * @property {number} totalPages - Total number of pages
 * @property {number} totalItems - Total count of items
 * @property {number} limit - Items per page
 * @property {boolean} hasNextPage - Whether there's a next page
 * @property {boolean} hasPrevPage - Whether there's a previous page
 */

/**
 * @typedef {Object} PaginationQuery
 * @property {number} page - Page number (1-indexed)
 * @property {number} limit - Items per page
 * @property {number} offset - Offset for database query
 */

/**
 * Parse pagination parameters from query string
 * 
 * @param {Object} query - Request query object
 * @param {Object} [defaults] - Default values
 * @param {number} [defaults.page=1] - Default page number
 * @param {number} [defaults.limit=20] - Default items per page
 * @param {number} [defaults.maxLimit=100] - Maximum allowed limit
 * @returns {PaginationQuery} Parsed pagination parameters
 * 
 * @example
 * const { page, limit, offset } = parsePagination(req.query);
 * const { rows, count } = await Model.findAndCountAll({ limit, offset });
 */
const parsePagination = (query, defaults = {}) => {
    const {
        page: defaultPage = 1,
        limit: defaultLimit = 20,
        maxLimit = 100
    } = defaults;

    let page = parseInt(query.page) || defaultPage;
    let limit = parseInt(query.limit) || defaultLimit;

    // Ensure valid ranges
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, maxLimit));

    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

/**
 * Build pagination info from query results
 * 
 * @param {number} totalItems - Total count of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {PaginationInfo} Pagination metadata
 */
const buildPaginationInfo = (totalItems, page, limit) => {
    const totalPages = Math.ceil(totalItems / limit);

    return {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
};

/**
 * Create a standardized success response
 * 
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {Object} [data] - Response data
 * @param {Object} [options] - Additional options
 * @returns {Object} Express response
 */
const successResponse = (res, statusCode, message, data = {}, options = {}) => {
    const response = {
        success: true,
        message,
        ...data
    };

    if (options.pagination) {
        response.pagination = options.pagination;
    }

    return res.status(statusCode).json(response);
};

/**
 * Create a standardized paginated response
 * 
 * @param {Object} res - Express response object
 * @param {string} message - Response message
 * @param {Array} items - Array of items
 * @param {number} totalCount - Total count of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} [itemsKey='items'] - Key name for items array
 * @returns {Object} Express response
 */
const paginatedResponse = (res, message, items, totalCount, page, limit, itemsKey = 'items') => {
    return successResponse(res, 200, message, {
        [itemsKey]: items
    }, {
        pagination: buildPaginationInfo(totalCount, page, limit)
    });
};

/**
 * Create a standardized error response
 * 
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} [errors] - Validation errors or additional error details
 * @returns {Object} Express response
 */
const errorResponse = (res, statusCode, message, errors = null) => {
    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

module.exports = {
    parsePagination,
    buildPaginationInfo,
    successResponse,
    paginatedResponse,
    errorResponse
};
