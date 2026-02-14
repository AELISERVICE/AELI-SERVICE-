'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if table already exists
        try {
            const result = await queryInterface.sequelize.query(
                `SELECT to_regclass('public.audit_logs') IS NOT NULL as exists`,
                { type: Sequelize.QueryTypes.SELECT }
            );
            if (result[0]?.exists) {
                console.log('⚠️  Table "audit_logs" already exists. Skipping creation.');
                return;
            }
        } catch (e) {
            console.log('Checking table existence failed, attempting creation...');
        }

        await queryInterface.createTable('audit_logs', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            action: {
                type: Sequelize.ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'OTHER'),
                allowNull: false
            },
            entity_type: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            entity_id: {
                type: Sequelize.UUID,
                allowNull: true
            },
            old_values: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            new_values: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            ip_address: {
                type: Sequelize.STRING(45),
                allowNull: true
            },
            user_agent: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            endpoint: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            method: {
                type: Sequelize.STRING(10),
                allowNull: true
            },
            status_code: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            duration: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            metadata: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addIndex('audit_logs', ['user_id']);
        await queryInterface.addIndex('audit_logs', ['action']);
        await queryInterface.addIndex('audit_logs', ['entity_type']);
        await queryInterface.addIndex('audit_logs', ['entity_id']);
        await queryInterface.addIndex('audit_logs', ['created_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('audit_logs');
        // For ENUM types in PostgreSQL, we might need to handle the type deletion specifically 
        // but usually dropTable is enough for simple cases or we can use:
        // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_audit_logs_action";');
    }
};
