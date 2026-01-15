const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * UnlockedContact - Tracks which provider contacts a client has unlocked
 */
const UnlockedContact = sequelize.define('UnlockedContact', {
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
    providerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'provider_id',
        references: {
            model: 'providers',
            key: 'id'
        }
    },
    paymentId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'payment_id'
    },
    unlockType: {
        type: DataTypes.ENUM('paid', 'subscription', 'free', 'promo'),
        defaultValue: 'paid',
        field: 'unlock_type'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'expires_at',
        comment: 'Null = lifetime unlock'
    }
}, {
    tableName: 'unlocked_contacts',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
        { fields: ['user_id', 'provider_id'], unique: true },
        { fields: ['user_id'] },
        { fields: ['provider_id'] }
    ]
});

// Contact unlock pricing
UnlockedContact.PRICING = {
    single: 500, // 500 FCFA per contact
    pack5: 2000, // 5 contacts for 2000 FCFA
    pack10: 3500 // 10 contacts for 3500 FCFA
};

/**
 * Check if user has unlocked a provider's contact
 */
UnlockedContact.isUnlocked = async function (userId, providerId) {
    // First check if user has premium subscription (unlimited)
    const Subscription = require('./Subscription');
    const hasUnlimited = await Subscription.hasUnlimitedContacts(userId);
    if (hasUnlimited) return true;

    // Check for specific unlock
    const unlock = await this.findOne({
        where: {
            userId,
            providerId,
            [Op.or]: [
                { expiresAt: null }, // Lifetime
                { expiresAt: { [Op.gt]: new Date() } } // Not expired
            ]
        }
    });

    return !!unlock;
};

/**
 * Unlock a provider's contact for a user
 */
UnlockedContact.unlock = async function (userId, providerId, paymentId = null, unlockType = 'paid') {
    // Check if already unlocked
    const existing = await this.findOne({
        where: { userId, providerId }
    });

    if (existing) {
        // Already unlocked
        return { unlocked: existing, isNew: false };
    }

    const unlock = await this.create({
        userId,
        providerId,
        paymentId,
        unlockType,
        expiresAt: null // Lifetime unlock by default
    });

    return { unlocked: unlock, isNew: true };
};

/**
 * Get user's unlocked providers
 */
UnlockedContact.getUnlockedProviders = async function (userId) {
    const Provider = require('./Provider');
    const User = require('./User');

    return this.findAll({
        where: {
            userId,
            [Op.or]: [
                { expiresAt: null },
                { expiresAt: { [Op.gt]: new Date() } }
            ]
        },
        include: [{
            model: Provider,
            as: 'provider',
            include: [{
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'profilePhoto']
            }]
        }]
    });
};

/**
 * Count unlocked contacts for a user
 */
UnlockedContact.countUnlocked = async function (userId) {
    return this.count({
        where: {
            userId,
            [Op.or]: [
                { expiresAt: null },
                { expiresAt: { [Op.gt]: new Date() } }
            ]
        }
    });
};

module.exports = UnlockedContact;
