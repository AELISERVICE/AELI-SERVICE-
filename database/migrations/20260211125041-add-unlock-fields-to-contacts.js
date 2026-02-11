'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('contacts');

    // Add is_unlocked column only if it doesn't exist
    if (!tableDescription.is_unlocked) {
      await queryInterface.addColumn('contacts', 'is_unlocked', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }

    // Add unlocked_at column only if it doesn't exist
    if (!tableDescription.unlocked_at) {
      await queryInterface.addColumn('contacts', 'unlocked_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // Add unlock_payment_id column only if it doesn't exist
    if (!tableDescription.unlock_payment_id) {
      await queryInterface.addColumn('contacts', 'unlock_payment_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'payments',
          key: 'id'
        },
        onDelete: 'SET NULL'
      });
    }

    // Unlock all existing messages (retroactive compatibility)
    await queryInterface.sequelize.query(`
      UPDATE contacts 
      SET is_unlocked = true, unlocked_at = NOW()
      WHERE created_at < NOW() AND is_unlocked = false
    `);
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('contacts');

    if (tableDescription.unlock_payment_id) {
      await queryInterface.removeColumn('contacts', 'unlock_payment_id');
    }

    if (tableDescription.unlocked_at) {
      await queryInterface.removeColumn('contacts', 'unlocked_at');
    }

    if (tableDescription.is_unlocked) {
      await queryInterface.removeColumn('contacts', 'is_unlocked');
    }
  }
};
