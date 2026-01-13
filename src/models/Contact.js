const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true, // Can be null for unauthenticated users
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
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Le message est requis'
            },
            len: {
                args: [10, 2000],
                msg: 'Le message doit contenir entre 10 et 2000 caractères'
            }
        }
    },
    senderName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'sender_name',
        validate: {
            notEmpty: {
                msg: 'Le nom est requis'
            }
        }
    },
    senderEmail: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'sender_email',
        validate: {
            isEmail: {
                msg: 'Veuillez fournir un email valide'
            }
        }
    },
    senderPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'sender_phone'
    },
    status: {
        type: DataTypes.ENUM('pending', 'read', 'replied'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'contacts',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['provider_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['created_at']
        }
    ]
});

module.exports = Contact;
