'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const tableDescription = await queryInterface.describeTable('providers');
        if (!tableDescription.featured_until) {
            await queryInterface.addColumn('providers', 'featured_until', {
                type: Sequelize.DATE,
                allowNull: true
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        const tableDescription = await queryInterface.describeTable('providers');
        if (tableDescription.featured_until) {
            await queryInterface.removeColumn('providers', 'featured_until');
        }
    }
};
