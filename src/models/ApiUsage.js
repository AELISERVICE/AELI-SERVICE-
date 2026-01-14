const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApiUsage = sequelize.define('ApiUsage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    endpoint: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    method: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    statusCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status_code'
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Request duration in ms'
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'user_id'
    },
    ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'ip_address'
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'user_agent'
    },
    requestSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'request_size'
    },
    responseSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'response_size'
    }
}, {
    tableName: 'api_usage',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
        { fields: ['endpoint'] },
        { fields: ['method'] },
        { fields: ['status_code'] },
        { fields: ['created_at'] },
        { fields: ['user_id'] }
    ]
});

/**
 * Get endpoint statistics
 */
ApiUsage.getEndpointStats = async function (options = {}) {
    const { startDate, endDate, limit = 20 } = options;
    const { Op, fn, col, literal } = require('sequelize');

    const where = {};
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = startDate;
        if (endDate) where.createdAt[Op.lte] = endDate;
    }

    return this.findAll({
        attributes: [
            'endpoint',
            'method',
            [fn('COUNT', col('id')), 'totalRequests'],
            [fn('AVG', col('duration')), 'avgDuration'],
            [fn('MAX', col('duration')), 'maxDuration'],
            [fn('MIN', col('duration')), 'minDuration'],
            [fn('COUNT', literal("CASE WHEN status_code >= 400 THEN 1 END")), 'errorCount']
        ],
        where,
        group: ['endpoint', 'method'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit,
        raw: true
    });
};

/**
 * Get overall stats
 */
ApiUsage.getOverallStats = async function (options = {}) {
    const { startDate, endDate } = options;
    const { Op, fn, col, literal } = require('sequelize');

    const where = {};
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = startDate;
        if (endDate) where.createdAt[Op.lte] = endDate;
    }

    const result = await this.findOne({
        attributes: [
            [fn('COUNT', col('id')), 'totalRequests'],
            [fn('AVG', col('duration')), 'avgDuration'],
            [fn('COUNT', literal("CASE WHEN status_code >= 400 THEN 1 END")), 'totalErrors'],
            [fn('COUNT', literal("CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END")), 'successfulRequests']
        ],
        where,
        raw: true
    });

    return result;
};

/**
 * Get hourly breakdown
 */
ApiUsage.getHourlyBreakdown = async function (date = new Date()) {
    const { fn, col, literal } = require('sequelize');
    const { Op } = require('sequelize');

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.findAll({
        attributes: [
            [fn('date_trunc', 'hour', col('created_at')), 'hour'],
            [fn('COUNT', col('id')), 'requests'],
            [fn('AVG', col('duration')), 'avgDuration']
        ],
        where: {
            createdAt: { [Op.between]: [startOfDay, endOfDay] }
        },
        group: [fn('date_trunc', 'hour', col('created_at'))],
        order: [[fn('date_trunc', 'hour', col('created_at')), 'ASC']],
        raw: true
    });
};

module.exports = ApiUsage;
