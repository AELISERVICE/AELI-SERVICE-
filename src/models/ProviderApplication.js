/**
 * ProviderApplication Model
 * Stores provider applications pending admin review
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProviderApplication = sequelize.define('ProviderApplication', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true, // One application per user at a time
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // Business Info
    businessName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'business_name',
        validate: {
            notEmpty: { msg: 'Le nom de l\'entreprise est requis' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La description est requise' },
            len: {
                args: [50, 5000],
                msg: 'La description doit contenir entre 50 et 5000 caractères'
            }
        }
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La localisation est requise' }
        }
    },
    address: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    // Contacts
    whatsapp: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    facebook: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    instagram: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    // Photos of activity/work
    photos: {
        type: DataTypes.JSONB,
        defaultValue: [],
        comment: 'Array of photo URLs'
    },
    // Documents (CNI required)
    documents: {
        type: DataTypes.JSONB,
        defaultValue: [],
        comment: 'Array of documents: [{type, url, uploadedAt}]',
        validate: {
            hasCNI(value) {
                if (!value || !Array.isArray(value)) return;
                const hasCni = value.some(doc => doc.type === 'cni');
                if (!hasCni && this.status === 'pending') {
                    // CNI will be validated at submission
                }
            }
        }
    },
    // Application Status
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    },
    reviewedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'reviewed_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reviewed_at'
    },
    // Admin notes
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'admin_notes'
    }
}, {
    tableName: 'provider_applications',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['status'] },
        { fields: ['created_at'] }
    ]
});

/**
 * Check if user has a pending application
 */
ProviderApplication.hasPendingApplication = async function (userId) {
    const application = await this.findOne({
        where: { userId, status: 'pending' }
    });
    return !!application;
};

/**
 * Get application by user
 */
ProviderApplication.getByUser = async function (userId) {
    return await this.findOne({
        where: { userId },
        order: [['createdAt', 'DESC']]
    });
};

module.exports = ProviderApplication;
