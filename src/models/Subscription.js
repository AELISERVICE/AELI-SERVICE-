const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Subscription - Manages provider subscriptions only
 * Business Model:
 * - Clients access everything FREE
 * - Providers get 30-day FREE trial on creation
 * - After trial: must pay to remain visible with full profile
 * - Expired: profile visible but NO contact info, NO images
 */
const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
    status: {
        type: DataTypes.ENUM('trial', 'active', 'expired', 'cancelled'),
        defaultValue: 'trial'
    },
    plan: {
        type: DataTypes.ENUM('trial', 'monthly', 'quarterly', 'yearly'),
        defaultValue: 'trial'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'XAF'
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'start_date'
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'end_date'
    },
    paymentId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'payment_id'
    },
    reminderSentAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reminder_sent_at'
    }
}, {
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['provider_id'], unique: true },
        { fields: ['status'] },
        { fields: ['end_date'] }
    ]
});

// Pricing configuration (FCFA)
Subscription.PLANS = {
    trial: { price: 0, days: 30 },        // FREE 30 days
    monthly: { price: 5000, days: 30 },   // 5000 FCFA/month
    quarterly: { price: 12000, days: 90 }, // 4000 FCFA/month
    yearly: { price: 15000, days: 365 }   // ~1250 FCFA/month
};

/**
 * Create FREE trial for new provider
 */
Subscription.createTrial = async function (providerId) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days free

    return this.create({
        providerId,
        status: 'trial',
        plan: 'trial',
        price: 0,
        startDate,
        endDate
    });
};

/**
 * Renew or upgrade subscription after payment
 */
Subscription.renewSubscription = async function (providerId, plan, paymentId = null) {
    const planConfig = this.PLANS[plan];
    if (!planConfig || plan === 'trial') {
        throw new Error('Plan invalide');
    }

    const existing = await this.findOne({ where: { providerId } });

    if (!existing) {
        throw new Error('Aucun abonnement trouvé pour ce prestataire');
    }

    // Calculate new end date
    const startDate = existing.status === 'expired' ? new Date() : existing.endDate;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + planConfig.days);

    existing.status = 'active';
    existing.plan = plan;
    existing.price = planConfig.price;
    existing.startDate = new Date();
    existing.endDate = endDate;
    existing.paymentId = paymentId;
    existing.reminderSentAt = null;
    await existing.save();

    return existing;
};

/**
 * Check if provider has active subscription (Static method)
 */
Subscription.isActive = async function (providerId) {
    const sub = await this.findOne({ where: { providerId } });
    if (!sub) return false;

    return sub.isActive();
};

/**
 * Check if this subscription is active (Instance method)
 */
Subscription.prototype.isActive = function () {
    return (this.status === 'trial' || this.status === 'active')
        && this.endDate > new Date();
};

/**
 * Get provider subscription status
 */
Subscription.getStatus = async function (providerId) {
    const sub = await this.findOne({ where: { providerId } });

    if (!sub) {
        return { status: 'none', isActive: false };
    }

    const isExpired = sub.endDate <= new Date();
    const daysRemaining = Math.ceil((sub.endDate - new Date()) / (1000 * 60 * 60 * 24));

    return {
        status: isExpired ? 'expired' : sub.status,
        isActive: !isExpired && (sub.status === 'trial' || sub.status === 'active'),
        plan: sub.plan,
        endDate: sub.endDate,
        daysRemaining: Math.max(0, daysRemaining),
        isTrial: sub.plan === 'trial'
    };
};

/**
 * Expire old subscriptions (run via cron daily)
 */
Subscription.expireOldSubscriptions = async function () {
    const [count] = await this.update(
        { status: 'expired' },
        {
            where: {
                status: { [Op.in]: ['trial', 'active'] },
                endDate: { [Op.lt]: new Date() }
            }
        }
    );
    return count;
};

/**
 * Get subscriptions expiring soon (for reminder emails)
 * Returns subscriptions expiring in next 7 days that haven't been notified
 */
Subscription.getExpiringSoon = async function () {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const Provider = require('./Provider');
    const User = require('./User');

    return this.findAll({
        where: {
            status: { [Op.in]: ['trial', 'active'] },
            endDate: {
                [Op.gt]: new Date(),
                [Op.lte]: sevenDaysFromNow
            },
            reminderSentAt: null
        },
        include: [{
            model: Provider,
            as: 'provider',
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'email', 'firstName']
            }]
        }]
    });
};

/**
 * Mark reminder as sent
 */
Subscription.markReminderSent = async function (subscriptionId) {
    await this.update(
        { reminderSentAt: new Date() },
        { where: { id: subscriptionId } }
    );
};

module.exports = Subscription;
