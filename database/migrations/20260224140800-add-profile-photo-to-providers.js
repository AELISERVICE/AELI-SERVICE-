'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableDescription = await queryInterface.describeTable('providers');
        if (!tableDescription.profile_photo) {
            await queryInterface.addColumn('providers', 'profile_photo', {
                type: Sequelize.STRING(500),
                allowNull: true,
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableDescription = await queryInterface.describeTable('providers');
        if (tableDescription.profile_photo) {
            await queryInterface.removeColumn('providers', 'profile_photo');
        }
    }
};
