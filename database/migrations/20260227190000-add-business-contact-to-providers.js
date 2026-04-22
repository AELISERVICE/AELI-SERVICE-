'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableDescription = await queryInterface.describeTable('providers');
        if (!tableDescription.business_contact) {
            await queryInterface.addColumn('providers', 'business_contact', {
                type: Sequelize.STRING(200),
                allowNull: true,
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableDescription = await queryInterface.describeTable('providers');
        if (tableDescription.business_contact) {
            await queryInterface.removeColumn('providers', 'business_contact');
        }
    }
};
