const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Database configuration with optimized pooling
 * 
 * Pool Settings:
 * - Production: max 20, min 5 (high availability)
 * - Development: max 10, min 2 (moderate)
 * - Test: max 5, min 1 (minimal)
 */
const poolConfig = {
    production: { max: 20, min: 5, acquire: 60000, idle: 10000, evict: 30000 },
    development: { max: 10, min: 2, acquire: 30000, idle: 10000, evict: 30000 },
    test: { max: 5, min: 1, acquire: 30000, idle: 5000, evict: 10000 }
};

const currentPool = poolConfig[process.env.NODE_ENV] || poolConfig.development;

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development'
            ? (sql, timing) => console.log(`[SQL ${timing?.duration || 0}ms]`, sql)
            : false,
        benchmark: process.env.NODE_ENV === 'development', // Log query duration
        pool: {
            ...currentPool,
            // Validate connections before use
            validate: (connection) => {
                return connection && connection.constructor.name === 'Client';
            }
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        },
        // Retry logic for transient failures
        retry: {
            max: 3,
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/
            ]
        },
        // Dialect-specific options
        dialectOptions: isProduction ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            // Statement timeout (30s)
            statement_timeout: 30000,
            // Idle transaction timeout (60s)
            idle_in_transaction_session_timeout: 60000
        } : {}
    }
);

/**
 * Test database connection with retry
 * @param {number} retries - Number of retry attempts
 */
const testConnection = async (retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await sequelize.authenticate();
            console.log(`✅ Database connection established (pool: max=${currentPool.max}, min=${currentPool.min})`);
            return true;
        } catch (error) {
            console.error(`❌ Connection attempt ${attempt}/${retries} failed:`, error.message);
            if (attempt === retries) {
                console.error('❌ Unable to connect to the database after retries');
                if (!isTest) process.exit(1);
                return false;
            }
            // Wait before retry (exponential backoff)
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }
};

/**
 * Get current pool statistics
 * @returns {object} Pool stats
 */
const getPoolStats = () => {
    const pool = sequelize.connectionManager.pool;
    return {
        size: pool?.size || 0,
        available: pool?.available || 0,
        pending: pool?.pending || 0,
        max: currentPool.max,
        min: currentPool.min
    };
};

module.exports = { sequelize, testConnection, getPoolStats };
