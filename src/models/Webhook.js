const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const Webhook = sequelize.define('Webhook', {
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
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    url: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
            isUrl: true
        }
    },
    secret: {
        type: DataTypes.STRING(64),
        allowNull: false,
        defaultValue: () => crypto.randomBytes(32).toString('hex')
    },
    events: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
        comment: 'List of event types to trigger this webhook'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    lastTriggeredAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_triggered_at'
    },
    failureCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'failure_count'
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    tableName: 'webhooks',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['is_active'] },
        { fields: ['events'], using: 'gin' }
    ]
});

// Available webhook events
Webhook.EVENTS = {
    // Provider events
    PROVIDER_CREATED: 'provider.created',
    PROVIDER_UPDATED: 'provider.updated',
    PROVIDER_VERIFIED: 'provider.verified',
    // Review events
    REVIEW_CREATED: 'review.created',
    REVIEW_DELETED: 'review.deleted',
    // Contact events
    CONTACT_RECEIVED: 'contact.received',
    CONTACT_STATUS_CHANGED: 'contact.status_changed',
    // User events
    USER_REGISTERED: 'user.registered',
    USER_DEACTIVATED: 'user.deactivated'
};

/**
 * Get webhooks for an event
 */
Webhook.getForEvent = async function (event) {
    const { Op } = require('sequelize');
    return this.findAll({
        where: {
            isActive: true,
            events: { [Op.contains]: [event] }
        }
    });
};

/**
 * Dispatch event to all subscribed webhooks
 */
Webhook.dispatch = async function (event, payload) {
    const { queueWebhook } = require('../config/queue');

    const webhooks = await this.getForEvent(event);

    const jobs = webhooks.map(webhook =>
        queueWebhook({
            url: webhook.url,
            event,
            payload,
            secret: webhook.secret,
            webhookId: webhook.id
        })
    );

    // Update last triggered
    await this.update(
        { lastTriggeredAt: new Date() },
        { where: { id: webhooks.map(w => w.id) } }
    );

    return Promise.all(jobs);
};

/**
 * Record webhook failure
 */
Webhook.recordFailure = async function (webhookId) {
    const webhook = await this.findByPk(webhookId);
    if (!webhook) return;

    await webhook.increment('failureCount');

    // Disable webhook after 10 consecutive failures
    if (webhook.failureCount >= 10) {
        await webhook.update({ isActive: false });
    }
};

/**
 * Reset failure count on success
 */
Webhook.recordSuccess = async function (webhookId) {
    await this.update(
        { failureCount: 0 },
        { where: { id: webhookId } }
    );
};

module.exports = Webhook;
