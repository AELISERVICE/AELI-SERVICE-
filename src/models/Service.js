const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Service = sequelize.define('Service', {
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
    categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'category_id',
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Le nom du service est requis'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La description du service est requise'
            }
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: {
                args: [0],
                msg: 'Le prix ne peut pas être négatif'
            }
        }
    },
    priceType: {
        type: DataTypes.ENUM('fixed', 'from', 'range', 'contact'),
        defaultValue: 'contact',
        field: 'price_type'
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: {
                args: [0],
                msg: 'La durée ne peut pas être négative'
            }
        },
        comment: 'Duration in minutes'
    },
    tags: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'services',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['provider_id']
        },
        {
            fields: ['category_id']
        },
        {
            fields: ['is_active']
        }
    ]
});

module.exports = Service;
