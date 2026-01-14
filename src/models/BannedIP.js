const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BannedIP = sequelize.define('BannedIP', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    ipAddress: {
        type: DataTypes.STRING(45), // IPv6 compatible
        allowNull: false,
        unique: true,
        field: 'ip_address'
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    bannedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'banned_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'expires_at',
        comment: 'Null = permanent ban'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    hitCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'hit_count',
        comment: 'Number of blocked requests'
    }
}, {
    tableName: 'banned_ips',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['ip_address'], unique: true },
        { fields: ['is_active'] },
        { fields: ['expires_at'] }
    ]
});

// Class methods
BannedIP.isIPBanned = async function (ip) {
    const ban = await this.findOne({
        where: {
            ipAddress: ip,
            isActive: true
        }
    });

    if (!ban) return false;

    // Check if ban has expired
    if (ban.expiresAt && new Date() > ban.expiresAt) {
        await ban.update({ isActive: false });
        return false;
    }

    // Increment hit count
    await ban.increment('hitCount');
    return true;
};

BannedIP.banIP = async function (ip, options = {}) {
    const { reason, bannedBy, duration } = options;

    const expiresAt = duration ? new Date(Date.now() + duration * 1000) : null;

    return this.upsert({
        ipAddress: ip,
        reason,
        bannedBy,
        expiresAt,
        isActive: true,
        hitCount: 0
    });
};

BannedIP.unbanIP = async function (ip) {
    return this.update(
        { isActive: false },
        { where: { ipAddress: ip } }
    );
};

BannedIP.cleanExpired = async function () {
    const now = new Date();
    return this.update(
        { isActive: false },
        {
            where: {
                expiresAt: { [require('sequelize').Op.lt]: now },
                isActive: true
            }
        }
    );
};

module.exports = BannedIP;
