'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('users');

    // Add country column only if it doesn't exist
    if (!tableDescription.country) {
      await queryInterface.addColumn('users', 'country', {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'Cameroun'
      });
    }

    // Add gender column only if it doesn't exist
    if (!tableDescription.gender) {
      await queryInterface.addColumn('users', 'gender', {
        type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('users');

    if (tableDescription.gender) {
      await queryInterface.removeColumn('users', 'gender');
    }

    if (tableDescription.country) {
      await queryInterface.removeColumn('users', 'country');
    }
  }
};
