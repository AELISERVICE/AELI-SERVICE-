'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add fields to provider_applications
        await queryInterface.addColumn('provider_applications', 'first_name', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('provider_applications', 'last_name', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('provider_applications', 'gender', {
            type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
            allowNull: true
        });
        await queryInterface.addColumn('provider_applications', 'country', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('provider_applications', 'email', {
            type: Sequelize.STRING(255),
            allowNull: true
        });
        await queryInterface.addColumn('provider_applications', 'phone', {
            type: Sequelize.STRING(20),
            allowNull: true
        });
        await queryInterface.addColumn('provider_applications', 'business_contact', {
            type: Sequelize.STRING(20),
            allowNull: true
        });
        await queryInterface.addColumn('provider_applications', 'activities', {
            type: Sequelize.JSONB,
            defaultValue: []
        });
        await queryInterface.addColumn('provider_applications', 'latitude', {
            type: Sequelize.DECIMAL(10, 8),
            allowNull: true
        });
        await queryInterface.addColumn('provider_applications', 'longitude', {
            type: Sequelize.DECIMAL(11, 8),
            allowNull: true
        });
        await queryInterface.addColumn('provider_applications', 'cni_number', {
            type: Sequelize.STRING(100),
            allowNull: true
        });

        // Add fields to providers
        await queryInterface.addColumn('providers', 'activities', {
            type: Sequelize.JSONB,
            defaultValue: []
        });
        await queryInterface.addColumn('providers', 'latitude', {
            type: Sequelize.DECIMAL(10, 8),
            allowNull: true
        });
        await queryInterface.addColumn('providers', 'longitude', {
            type: Sequelize.DECIMAL(11, 8),
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove from providers
        await queryInterface.removeColumn('providers', 'activities');
        await queryInterface.removeColumn('providers', 'latitude');
        await queryInterface.removeColumn('providers', 'longitude');

        // Remove from provider_applications
        await queryInterface.removeColumn('provider_applications', 'first_name');
        await queryInterface.removeColumn('provider_applications', 'last_name');
        await queryInterface.removeColumn('provider_applications', 'gender');
        await queryInterface.removeColumn('provider_applications', 'country');
        await queryInterface.removeColumn('provider_applications', 'email');
        await queryInterface.removeColumn('provider_applications', 'phone');
        await queryInterface.removeColumn('provider_applications', 'business_contact');
        await queryInterface.removeColumn('provider_applications', 'activities');
        await queryInterface.removeColumn('provider_applications', 'latitude');
        await queryInterface.removeColumn('provider_applications', 'longitude');
        await queryInterface.removeColumn('provider_applications', 'cni_number');

        // Note: Enum 'gender' won't be removed automatically in some DBs, 
        // but column removal is the primary goal here.
    }
};
