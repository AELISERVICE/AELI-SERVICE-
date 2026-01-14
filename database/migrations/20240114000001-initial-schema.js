'use strict';

/**
 * This migration is for fresh databases only.
 * If tables already exist from sequelize.sync(), skip this migration by running:
 * npx sequelize-cli db:migrate:undo:all
 * Then drop all tables manually and re-run: npm run db:migrate
 * 
 * OR for development, just use sequelize.sync() and skip migrations.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if tables already exist
        const tableExists = async (tableName) => {
            try {
                const result = await queryInterface.sequelize.query(
                    `SELECT to_regclass('public.${tableName}') IS NOT NULL as exists`,
                    { type: Sequelize.QueryTypes.SELECT }
                );
                return result[0]?.exists || false;
            } catch (e) {
                return false;
            }
        };

        // Skip if users table already exists (sync was used)
        if (await tableExists('users')) {
            console.log('⚠️  Tables already exist (created by sync). Skipping migration.');
            console.log('   To use migrations, drop all tables first and re-run.');
            return;
        }

        // Users table
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            first_name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            last_name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            role: {
                type: Sequelize.ENUM('client', 'provider', 'admin'),
                defaultValue: 'client'
            },
            profile_photo: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            is_email_verified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            reset_password_token: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            reset_password_expires: {
                type: Sequelize.DATE,
                allowNull: true
            },
            last_login: {
                type: Sequelize.DATE,
                allowNull: true
            },
            otp_code: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            otp_expires: {
                type: Sequelize.DATE,
                allowNull: true
            },
            otp_attempts: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            failed_login_attempts: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            locked_until: {
                type: Sequelize.DATE,
                allowNull: true
            },
            last_activity: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Categories table
        await queryInterface.createTable('categories', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            slug: {
                type: Sequelize.STRING(120),
                allowNull: false,
                unique: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            icon: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            display_order: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Providers table (without slug - matches current model)
        await queryInterface.createTable('providers', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            business_name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            location: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            address: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            whatsapp: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            facebook: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            instagram: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            photos: {
                type: Sequelize.JSONB,
                defaultValue: []
            },
            is_verified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            is_featured: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            views_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            contacts_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            average_rating: {
                type: Sequelize.DECIMAL(3, 2),
                defaultValue: 0.0
            },
            total_reviews: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Services table
        await queryInterface.createTable('services', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'providers', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            category_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'categories', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            name: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            price_type: {
                type: Sequelize.ENUM('fixed', 'from', 'range', 'contact'),
                defaultValue: 'fixed'
            },
            price_max: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            duration: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            tags: {
                type: Sequelize.JSONB,
                defaultValue: []
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Reviews table
        await queryInterface.createTable('reviews', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'providers', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            rating: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            comment: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            is_visible: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addConstraint('reviews', {
            fields: ['provider_id', 'user_id'],
            type: 'unique',
            name: 'reviews_provider_user_unique'
        });

        // Favorites table
        await queryInterface.createTable('favorites', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'providers', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addConstraint('favorites', {
            fields: ['user_id', 'provider_id'],
            type: 'unique',
            name: 'favorites_user_provider_unique'
        });

        // Contacts table
        await queryInterface.createTable('contacts', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'providers', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            sender_name: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            sender_email: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            sender_phone: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('pending', 'read', 'replied'),
                defaultValue: 'pending'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Refresh tokens table
        await queryInterface.createTable('refresh_tokens', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            token: {
                type: Sequelize.STRING(500),
                allowNull: false,
                unique: true
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            is_revoked: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            revoked_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            user_agent: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            ip_address: {
                type: Sequelize.STRING(45),
                allowNull: true
            },
            last_used_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Security logs table
        await queryInterface.createTable('security_logs', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            event_type: {
                type: Sequelize.ENUM(
                    'login_success', 'login_failed', 'logout',
                    'password_change', 'password_reset_request', 'password_reset_success',
                    'otp_sent', 'otp_verified', 'otp_failed',
                    'account_locked', 'account_unlocked',
                    'session_expired', 'token_refresh',
                    'unauthorized_access', 'admin_action'
                ),
                allowNull: false
            },
            ip_address: {
                type: Sequelize.STRING(45),
                allowNull: true
            },
            user_agent: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            metadata: {
                type: Sequelize.JSONB,
                defaultValue: {}
            },
            is_suspicious: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Indexes
        await queryInterface.addIndex('users', ['email']);
        await queryInterface.addIndex('providers', ['user_id']);
        await queryInterface.addIndex('providers', ['location']);
        await queryInterface.addIndex('services', ['provider_id']);
        await queryInterface.addIndex('services', ['category_id']);
        await queryInterface.addIndex('reviews', ['provider_id']);
        await queryInterface.addIndex('contacts', ['provider_id']);
        await queryInterface.addIndex('refresh_tokens', ['user_id']);
        await queryInterface.addIndex('security_logs', ['user_id']);
        await queryInterface.addIndex('security_logs', ['event_type']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('security_logs');
        await queryInterface.dropTable('refresh_tokens');
        await queryInterface.dropTable('contacts');
        await queryInterface.dropTable('favorites');
        await queryInterface.dropTable('reviews');
        await queryInterface.dropTable('services');
        await queryInterface.dropTable('providers');
        await queryInterface.dropTable('categories');
        await queryInterface.dropTable('users');
    }
};
