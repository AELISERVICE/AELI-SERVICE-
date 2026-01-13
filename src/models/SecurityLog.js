const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * SecurityLog model for tracking security-related events
 */
const SecurityLog = sequelize.define('SecurityLog', {
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
    eventType: {
        type: DataTypes.ENUM(
            'login_success',
            'login_failed',
            'logout',
            'password_change',
            'password_reset_request',
            'password_reset_success',
            'otp_sent',
            'otp_verified',
            'otp_failed',
            'account_locked',
            'account_unlocked',
            'unauthorized_access',
            'admin_action',
            'suspicious_activity',
            'token_refresh',
            'session_expired'
        ),
        allowNull: false,
        field: 'event_type'
    },
    ipAddress: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'ip_address'
    },
    userAgent: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'user_agent'
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    details: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: 'Additional event details'
    },
    success: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    riskLevel: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'low',
        field: 'risk_level'
    }
}, {
    tableName: 'security_logs',
    timestamps: true,
    underscored: true,
    updatedAt: false, // Only need createdAt
    indexes: [
        { fields: ['user_id'] },
        { fields: ['event_type'] },
        { fields: ['ip_address'] },
        { fields: ['created_at'] },
        { fields: ['risk_level'] }
    ]
});

/**
 * Log a security event
 */
SecurityLog.logEvent = async function (eventData) {
    try {
        return await this.create(eventData);
    } catch (error) {
        console.error('Failed to log security event:', error.message);
    }
};

/**
 * Get recent failed login attempts for an IP
 */
SecurityLog.getRecentFailedLogins = async function (ipAddress, minutes = 15) {
    const { Op } = require('sequelize');
    const since = new Date(Date.now() - minutes * 60 * 1000);

    return await this.count({
        where: {
            ipAddress,
            eventType: 'login_failed',
            createdAt: { [Op.gte]: since }
        }
    });
};

/**
 * Check for suspicious activity
 */
SecurityLog.checkSuspiciousActivity = async function (userId, ipAddress) {
    const { Op } = require('sequelize');
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    // Check for multiple failed logins
    const failedAttempts = await this.count({
        where: {
            [Op.or]: [{ userId }, { ipAddress }],
            eventType: 'login_failed',
            createdAt: { [Op.gte]: lastHour }
        }
    });

    return failedAttempts >= 5;
};

module.exports = SecurityLog;
