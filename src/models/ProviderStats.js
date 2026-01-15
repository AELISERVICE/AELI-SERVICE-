const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * ProviderStats - Daily statistics tracking for providers
 * Stores views, contacts, traffic sources by day
 */
const ProviderStats = sequelize.define('ProviderStats', {
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
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    uniqueViews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'unique_views'
    },
    contacts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    favorites: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // Traffic sources
    sourceDirect: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'source_direct'
    },
    sourceSearch: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'source_search'
    },
    sourceCategory: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'source_category'
    },
    sourceFeatured: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'source_featured'
    },
    sourceExternal: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'source_external'
    }
}, {
    tableName: 'provider_stats',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
        { fields: ['provider_id', 'date'], unique: true },
        { fields: ['date'] },
        { fields: ['provider_id'] }
    ]
});

/**
 * Record a view for a provider
 */
ProviderStats.recordView = async function (providerId, source = 'direct') {
    const today = new Date().toISOString().split('T')[0];

    const [stats, created] = await this.findOrCreate({
        where: { providerId, date: today },
        defaults: { providerId, date: today }
    });

    // Increment views
    stats.views += 1;

    // Increment source
    switch (source) {
        case 'search':
            stats.sourceSearch += 1;
            break;
        case 'category':
            stats.sourceCategory += 1;
            break;
        case 'featured':
            stats.sourceFeatured += 1;
            break;
        case 'external':
            stats.sourceExternal += 1;
            break;
        default:
            stats.sourceDirect += 1;
    }

    await stats.save();
    return stats;
};

/**
 * Record a contact for a provider
 */
ProviderStats.recordContact = async function (providerId) {
    const today = new Date().toISOString().split('T')[0];

    const [stats] = await this.findOrCreate({
        where: { providerId, date: today },
        defaults: { providerId, date: today }
    });

    stats.contacts += 1;
    await stats.save();
    return stats;
};

/**
 * Record a favorite add for a provider
 */
ProviderStats.recordFavorite = async function (providerId) {
    const today = new Date().toISOString().split('T')[0];

    const [stats] = await this.findOrCreate({
        where: { providerId, date: today },
        defaults: { providerId, date: today }
    });

    stats.favorites += 1;
    await stats.save();
    return stats;
};

/**
 * Get daily stats for last N days
 */
ProviderStats.getDailyStats = async function (providerId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.findAll({
        where: {
            providerId,
            date: { [Op.gte]: startDate }
        },
        order: [['date', 'ASC']],
        raw: true
    });
};

/**
 * Get weekly aggregated stats
 */
ProviderStats.getWeeklyStats = async function (providerId, weeks = 12) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    const stats = await this.findAll({
        where: {
            providerId,
            date: { [Op.gte]: startDate }
        },
        attributes: [
            [sequelize.fn('DATE_TRUNC', 'week', sequelize.col('date')), 'week'],
            [sequelize.fn('SUM', sequelize.col('views')), 'views'],
            [sequelize.fn('SUM', sequelize.col('contacts')), 'contacts'],
            [sequelize.fn('SUM', sequelize.col('favorites')), 'favorites']
        ],
        group: [sequelize.fn('DATE_TRUNC', 'week', sequelize.col('date'))],
        order: [[sequelize.fn('DATE_TRUNC', 'week', sequelize.col('date')), 'ASC']],
        raw: true
    });

    return stats;
};

/**
 * Get conversion rate (views to contacts)
 */
ProviderStats.getConversionRate = async function (providerId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totals = await this.findOne({
        where: {
            providerId,
            date: { [Op.gte]: startDate }
        },
        attributes: [
            [sequelize.fn('SUM', sequelize.col('views')), 'totalViews'],
            [sequelize.fn('SUM', sequelize.col('contacts')), 'totalContacts']
        ],
        raw: true
    });

    const views = parseInt(totals.totalViews) || 0;
    const contacts = parseInt(totals.totalContacts) || 0;
    const conversionRate = views > 0 ? ((contacts / views) * 100).toFixed(2) : 0;

    return {
        views,
        contacts,
        conversionRate: parseFloat(conversionRate)
    };
};

/**
 * Get traffic sources breakdown
 */
ProviderStats.getTrafficSources = async function (providerId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totals = await this.findOne({
        where: {
            providerId,
            date: { [Op.gte]: startDate }
        },
        attributes: [
            [sequelize.fn('SUM', sequelize.col('source_direct')), 'direct'],
            [sequelize.fn('SUM', sequelize.col('source_search')), 'search'],
            [sequelize.fn('SUM', sequelize.col('source_category')), 'category'],
            [sequelize.fn('SUM', sequelize.col('source_featured')), 'featured'],
            [sequelize.fn('SUM', sequelize.col('source_external')), 'external']
        ],
        raw: true
    });

    const sources = {
        direct: parseInt(totals.direct) || 0,
        search: parseInt(totals.search) || 0,
        category: parseInt(totals.category) || 0,
        featured: parseInt(totals.featured) || 0,
        external: parseInt(totals.external) || 0
    };

    const total = Object.values(sources).reduce((a, b) => a + b, 0);

    return {
        sources,
        total,
        percentages: {
            direct: total > 0 ? ((sources.direct / total) * 100).toFixed(1) : 0,
            search: total > 0 ? ((sources.search / total) * 100).toFixed(1) : 0,
            category: total > 0 ? ((sources.category / total) * 100).toFixed(1) : 0,
            featured: total > 0 ? ((sources.featured / total) * 100).toFixed(1) : 0,
            external: total > 0 ? ((sources.external / total) * 100).toFixed(1) : 0
        }
    };
};

module.exports = ProviderStats;
