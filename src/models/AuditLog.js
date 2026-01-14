const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'OTHER'),
        allowNull: false
    },
    entityType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'entity_type',
        comment: 'Table/Model name affected'
    },
    entityId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'entity_id'
    },
    oldValues: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'old_values'
    },
    newValues: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'new_values'
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
    endpoint: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    method: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    statusCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'status_code'
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Request duration in ms'
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional context data'
    }
}, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false, // Audit logs should never be updated
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['action'] },
        { fields: ['entity_type'] },
        { fields: ['entity_id'] },
        { fields: ['created_at'] },
        { fields: ['ip_address'] }
    ]
});

// Class methods
AuditLog.log = async function (options) {
    const {
        userId,
        action,
        entityType,
        entityId,
        oldValues,
        newValues,
        req
    } = options;

    return this.create({
        userId,
        action,
        entityType,
        entityId,
        oldValues,
        newValues,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.headers?.['user-agent'],
        endpoint: req?.path,
        method: req?.method,
        statusCode: options.statusCode,
        duration: options.duration,
        metadata: options.metadata
    });
};

AuditLog.logCreate = function (entityType, entityId, newValues, req, userId) {
    return this.log({
        userId,
        action: 'CREATE',
        entityType,
        entityId,
        newValues,
        req
    });
};

AuditLog.logUpdate = function (entityType, entityId, oldValues, newValues, req, userId) {
    return this.log({
        userId,
        action: 'UPDATE',
        entityType,
        entityId,
        oldValues,
        newValues,
        req
    });
};

AuditLog.logDelete = function (entityType, entityId, oldValues, req, userId) {
    return this.log({
        userId,
        action: 'DELETE',
        entityType,
        entityId,
        oldValues,
        req
    });
};

AuditLog.getRecentLogs = function (limit = 100) {
    return this.findAll({
        order: [['createdAt', 'DESC']],
        limit,
        include: [{
            model: require('./User'),
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
        }]
    });
};

AuditLog.getLogsByUser = function (userId, limit = 50) {
    return this.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit
    });
};

AuditLog.getLogsByEntity = function (entityType, entityId) {
    return this.findAll({
        where: { entityType, entityId },
        order: [['createdAt', 'DESC']]
    });
};

module.exports = AuditLog;
