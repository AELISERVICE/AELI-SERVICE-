const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * RefreshToken model for storing refresh tokens
 * Used for token refresh mechanism and logout/blacklist
 */
const RefreshToken = sequelize.define('RefreshToken', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at'
    },
    isRevoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_revoked'
    },
    revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'revoked_at'
    },
    userAgent: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'user_agent'
    },
    ipAddress: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'ip_address'
    },
    lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_used_at'
    }
}, {
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['token'] },
        { fields: ['expires_at'] },
        { fields: ['is_revoked'] }
    ]
});

/**
 * Clean up expired tokens (run periodically)
 */
RefreshToken.cleanupExpired = async function () {
    const { Op } = require('sequelize');
    return await this.destroy({
        where: {
            [Op.or]: [
                { expiresAt: { [Op.lt]: new Date() } },
                { isRevoked: true, revokedAt: { [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
            ]
        }
    });
};

/**
 * Revoke all tokens for a user (logout from all devices)
 */
RefreshToken.revokeAllForUser = async function (userId) {
    return await this.update(
        { isRevoked: true, revokedAt: new Date() },
        { where: { userId, isRevoked: false } }
    );
};

module.exports = RefreshToken;
