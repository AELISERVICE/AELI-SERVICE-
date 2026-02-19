'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('providers', 'is_active', {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false,
            comment: 'When false, provider is hidden from public listings'
        });

        // Add index for filtering
        await queryInterface.addIndex('providers', ['is_active'], {
            name: 'idx_providers_is_active'
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('providers', 'idx_providers_is_active');
        await queryInterface.removeColumn('providers', 'is_active');
    }
};
