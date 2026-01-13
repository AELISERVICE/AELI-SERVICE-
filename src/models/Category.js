const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('slugify');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'Le nom de la catégorie est requis'
            }
        }
    },
    slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeValidate: (category) => {
            if (category.name) {
                category.slug = slugify(category.name, {
                    lower: true,
                    strict: true,
                    locale: 'fr'
                });
            }
        }
    },
    indexes: [
        {
            fields: ['slug']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['order']
        }
    ]
});

module.exports = Category;
