'use strict';

const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminEmail = process.env.AELI_ADMIN_EMAIL;
    const adminPassword = process.env.AELI_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        'Missing required env vars: AELI_ADMIN_EMAIL and AELI_ADMIN_PASSWORD',
      );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingByEmail = await queryInterface.sequelize.query(
      'SELECT id, role FROM users WHERE email = :email LIMIT 1',
      {
        replacements: { email: adminEmail },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    if (existingByEmail.length > 0 && existingByEmail[0].role !== 'admin') {
      throw new Error(
        `Email ${adminEmail} already belongs to a non-admin account.`,
      );
    }

    const existingAdmin = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (existingAdmin.length > 0) {
      await queryInterface.sequelize.query(
        `
          UPDATE users
          SET
            email = :email,
            password = :password,
            is_active = true,
            is_email_verified = true,
            updated_at = NOW()
          WHERE id = :id
        `,
        {
          replacements: {
            id: existingAdmin[0].id,
            email: adminEmail,
            password: hashedPassword,
          },
          type: Sequelize.QueryTypes.UPDATE,
        },
      );
      return;
    }

    await queryInterface.bulkInsert('users', [
      {
        id: randomUUID(),
        email: adminEmail,
        password: hashedPassword,
        first_name: 'AELI',
        last_name: 'Admin',
        country: 'Cameroun',
        gender: 'prefer_not_to_say',
        role: 'admin',
        is_active: true,
        is_email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down() {
    // Intentionally no-op: credentials rollback is sensitive and should be manual.
  },
};
