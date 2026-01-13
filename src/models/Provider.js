const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Provider = sequelize.define('Provider', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    businessName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'business_name',
        validate: {
            notEmpty: {
                msg: 'Le nom de l\'entreprise est requis'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La description est requise'
            },
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
            notEmpty: {
                msg: 'La localisation est requise'
            }
        }
    },
    address: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
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
    photos: {
        type: DataTypes.JSONB,
        defaultValue: [],
        validate: {
            isValidPhotos(value) {
                if (value && value.length > 5) {
                    throw new Error('Maximum 5 photos autorisées');
                }
            }
        }
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_verified'
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_featured'
    },
    viewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'views_count'
    },
    contactsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'contacts_count'
    },
    averageRating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.00,
        field: 'average_rating'
    },
    totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_reviews'
    }
}, {
    tableName: 'providers',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['location']
        },
        {
            fields: ['average_rating']
        },
        {
            fields: ['is_verified']
        },
        {
            fields: ['is_featured']
        }
    ]
});

// Method to increment view count
Provider.prototype.incrementViews = async function () {
    this.viewsCount += 1;
    await this.save({ fields: ['viewsCount'] });
};

// Method to increment contact count
Provider.prototype.incrementContacts = async function () {
    this.contactsCount += 1;
    await this.save({ fields: ['contactsCount'] });
};

// Method to update rating
Provider.prototype.updateRating = async function (newRating, isNewReview = true) {
    if (isNewReview) {
        const newTotal = this.totalReviews + 1;
        const currentSum = parseFloat(this.averageRating) * this.totalReviews;
        this.averageRating = ((currentSum + newRating) / newTotal).toFixed(2);
        this.totalReviews = newTotal;
    } else {
        // Recalculate from all reviews
        const Review = require('./Review');
        const reviews = await Review.findAll({
            where: { providerId: this.id, isVisible: true }
        });
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
            this.averageRating = (sum / reviews.length).toFixed(2);
            this.totalReviews = reviews.length;
        } else {
            this.averageRating = 0;
            this.totalReviews = 0;
        }
    }
    await this.save({ fields: ['averageRating', 'totalReviews'] });
};

module.exports = Provider;
