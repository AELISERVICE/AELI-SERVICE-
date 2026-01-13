const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
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
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'La note minimum est 1'
            },
            max: {
                args: [5],
                msg: 'La note maximum est 5'
            }
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_visible'
    }
}, {
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['provider_id']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['is_visible']
        },
        {
            unique: true,
            fields: ['user_id', 'provider_id'],
            name: 'unique_user_provider_review'
        }
    ]
});

module.exports = Review;
