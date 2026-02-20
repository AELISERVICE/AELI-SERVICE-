'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('providers', 'featured_until', {
            type: Sequelize.DATE,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('providers', 'featured_until');
    }
};
