/**
 * Database Helper Utilities
 * Provides transaction wrappers and common database operations
 */

const { sequelize } = require('../config/database');

/**
 * @typedef {import('sequelize').Transaction} Transaction
 * @typedef {import('sequelize').TransactionOptions} TransactionOptions
 */

/**
 * Execute a callback within a database transaction
 * Automatically commits on success, rolls back on error
 * 
 * @template T
 * @param {(transaction: Transaction) => Promise<T>} callback - Async function to execute within transaction
 * @param {TransactionOptions} [options] - Optional transaction options
 * @returns {Promise<T>} Result of the callback
 * @throws {Error} Rethrows any error from callback after rollback
 * 
 * @example
 * const result = await withTransaction(async (t) => {
 *     await User.update({ role: 'provider' }, { where: { id: userId }, transaction: t });
 *     await Provider.create({ userId, ... }, { transaction: t });
 *     return { success: true };
 * });
 */
const withTransaction = async (callback, options = {}) => {
    const transaction = await sequelize.transaction(options);

    try {
        const result = await callback(transaction);
        await transaction.commit();
        return result;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Execute a callback with automatic retry on deadlock
 * Useful for high-concurrency scenarios
 * 
 * @template T
 * @param {(transaction: Transaction) => Promise<T>} callback - Async function to execute
 * @param {number} [maxRetries=3] - Maximum number of retries on deadlock
 * @param {TransactionOptions} [options] - Optional transaction options
 * @returns {Promise<T>} Result of the callback
 */
const withRetryableTransaction = async (callback, maxRetries = 3, options = {}) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await withTransaction(callback, options);
        } catch (error) {
            lastError = error;

            // Check if it's a deadlock error (Postgres: 40P01, MySQL: 1213)
            const isDeadlock = error.parent && (
                error.parent.code === '40P01' ||
                error.parent.errno === 1213
            );

            if (!isDeadlock || attempt === maxRetries) {
                throw error;
            }

            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        }
    }

    throw lastError;
};

/**
 * Batch insert with chunking to avoid memory issues
 * 
 * @template T
 * @param {import('sequelize').ModelStatic<any>} Model - Sequelize model
 * @param {T[]} records - Array of records to insert
 * @param {number} [chunkSize=100] - Number of records per batch
 * @param {object} [options] - Additional bulkCreate options
 * @returns {Promise<any[]>} Array of created instances
 */
const batchInsert = async (Model, records, chunkSize = 100, options = {}) => {
    const results = [];

    for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        const created = await Model.bulkCreate(chunk, {
            ...options,
            returning: true
        });
        results.push(...created);
    }

    return results;
};

/**
 * Safe findOrCreate that handles race conditions
 * 
 * @template T
 * @param {import('sequelize').ModelStatic<any>} Model - Sequelize model
 * @param {object} where - Where clause to find existing record
 * @param {object} defaults - Default values for creation
 * @param {Transaction} [transaction] - Optional transaction
 * @returns {Promise<[any, boolean]>} [instance, created]
 */
const safeFindOrCreate = async (Model, where, defaults, transaction = null) => {
    try {
        return await Model.findOrCreate({
            where,
            defaults,
            transaction
        });
    } catch (error) {
        // Handle unique constraint violation (race condition)
        if (error.name === 'SequelizeUniqueConstraintError') {
            const existing = await Model.findOne({ where, transaction });
            if (existing) {
                return [existing, false];
            }
        }
        throw error;
    }
};

module.exports = {
    withTransaction,
    withRetryableTransaction,
    batchInsert,
    safeFindOrCreate
};
