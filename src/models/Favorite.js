const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Favorite = sequelize.define('Favorite', {
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
    }
}, {
    tableName: 'favorites',
    timestamps: true,
    underscored: true,
    updatedAt: false, // Only need createdAt
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['provider_id']
        },
        {
            unique: true,
            fields: ['user_id', 'provider_id'],
            name: 'unique_user_provider_favorite'
        }
    ]
});

module.exports = Favorite;
