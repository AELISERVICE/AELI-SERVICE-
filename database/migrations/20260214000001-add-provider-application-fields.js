'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const addColumnIfMissing = async (tableName, columnName, definition) => {
            const tableDescription = await queryInterface.describeTable(tableName);
            if (!tableDescription[columnName]) {
                await queryInterface.addColumn(tableName, columnName, definition);
            }
        };

        // Add fields to provider_applications
        await addColumnIfMissing('provider_applications', 'first_name', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await addColumnIfMissing('provider_applications', 'last_name', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await addColumnIfMissing('provider_applications', 'gender', {
            type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
            allowNull: true
        });
        await addColumnIfMissing('provider_applications', 'country', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await addColumnIfMissing('provider_applications', 'email', {
            type: Sequelize.STRING(255),
            allowNull: true
        });
        await addColumnIfMissing('provider_applications', 'phone', {
            type: Sequelize.STRING(20),
            allowNull: true
        });
        await addColumnIfMissing('provider_applications', 'business_contact', {
            type: Sequelize.STRING(20),
            allowNull: true
        });
        await addColumnIfMissing('provider_applications', 'activities', {
            type: Sequelize.JSONB,
            defaultValue: []
        });
        await addColumnIfMissing('provider_applications', 'latitude', {
            type: Sequelize.DECIMAL(10, 8),
            allowNull: true
        });
        await addColumnIfMissing('provider_applications', 'longitude', {
            type: Sequelize.DECIMAL(11, 8),
            allowNull: true
        });
        await addColumnIfMissing('provider_applications', 'cni_number', {
            type: Sequelize.STRING(100),
            allowNull: true
        });

        // Add fields to providers
        await addColumnIfMissing('providers', 'activities', {
            type: Sequelize.JSONB,
            defaultValue: []
        });
        await addColumnIfMissing('providers', 'latitude', {
            type: Sequelize.DECIMAL(10, 8),
            allowNull: true
        });
        await addColumnIfMissing('providers', 'longitude', {
            type: Sequelize.DECIMAL(11, 8),
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        const removeColumnIfExists = async (tableName, columnName) => {
            const tableDescription = await queryInterface.describeTable(tableName);
            if (tableDescription[columnName]) {
                await queryInterface.removeColumn(tableName, columnName);
            }
        };

        // Remove from providers
        await removeColumnIfExists('providers', 'activities');
        await removeColumnIfExists('providers', 'latitude');
        await removeColumnIfExists('providers', 'longitude');

        // Remove from provider_applications
        await removeColumnIfExists('provider_applications', 'first_name');
        await removeColumnIfExists('provider_applications', 'last_name');
        await removeColumnIfExists('provider_applications', 'gender');
        await removeColumnIfExists('provider_applications', 'country');
        await removeColumnIfExists('provider_applications', 'email');
        await removeColumnIfExists('provider_applications', 'phone');
        await removeColumnIfExists('provider_applications', 'business_contact');
        await removeColumnIfExists('provider_applications', 'activities');
        await removeColumnIfExists('provider_applications', 'latitude');
        await removeColumnIfExists('provider_applications', 'longitude');
        await removeColumnIfExists('provider_applications', 'cni_number');

        // Note: Enum 'gender' won't be removed automatically in some DBs, 
        // but column removal is the primary goal here.
    }
};
