const { Model, DataTypes } = require('sequelize');

class Banner extends Model {
    static associate(models) {
        // No direct associations needed for now
    }
}

module.exports = (sequelize) => {
    Banner.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: 'Titre de la bannière'
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Texte descriptif optionnel'
            },
            imageUrl: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'image_url',
                comment: 'URL de l\'image sur Cloudinary'
            },
            publicId: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'public_id',
                comment: 'ID public Cloudinary pour la suppression'
            },
            linkUrl: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'link_url',
                comment: 'Lien de redirection au clic'
            },
            type: {
                type: DataTypes.ENUM('main_home', 'sidebar', 'featured', 'popup'),
                allowNull: false,
                defaultValue: 'main_home',
                comment: 'Emplacement de la bannière'
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                field: 'is_active',
                comment: 'Statut d\'affichage'
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'start_date',
                comment: 'Date de début de diffusion'
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'end_date',
                comment: 'Date de fin de diffusion'
            },
            order: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                comment: 'Ordre d\'affichage (priorité)'
            }
        },
        {
            sequelize,
            modelName: 'Banner',
            tableName: 'banners',
            underscored: true,
            timestamps: true
        }
    );

    return Banner;
};
