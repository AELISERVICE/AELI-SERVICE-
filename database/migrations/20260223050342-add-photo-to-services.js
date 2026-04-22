'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('services');
    if (!tableDescription.photo) {
      await queryInterface.addColumn('services', 'photo', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('services');
    if (tableDescription.photo) {
      await queryInterface.removeColumn('services', 'photo');
    }
  }
};
