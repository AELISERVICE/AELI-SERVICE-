'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Users table indexes
        await queryInterface.addIndex('users', ['email'], {
            name: 'idx_users_email',
            unique: true
        });
        await queryInterface.addIndex('users', ['role'], {
            name: 'idx_users_role'
        });
        await queryInterface.addIndex('users', ['is_active'], {
            name: 'idx_users_is_active'
        });
        await queryInterface.addIndex('users', ['created_at'], {
            name: 'idx_users_created_at'
        });

        // Providers table indexes
        await queryInterface.addIndex('providers', ['user_id'], {
            name: 'idx_providers_user_id',
            unique: true
        });
        await queryInterface.addIndex('providers', ['is_verified'], {
            name: 'idx_providers_is_verified'
        });
        await queryInterface.addIndex('providers', ['is_featured'], {
            name: 'idx_providers_is_featured'
        });
        await queryInterface.addIndex('providers', ['location'], {
            name: 'idx_providers_location'
        });
        await queryInterface.addIndex('providers', ['average_rating'], {
            name: 'idx_providers_average_rating'
        });
        await queryInterface.addIndex('providers', ['created_at'], {
            name: 'idx_providers_created_at'
        });
        // Composite index for common queries
        await queryInterface.addIndex('providers', ['is_verified', 'is_featured'], {
            name: 'idx_providers_verified_featured'
        });

        // Categories table indexes
        await queryInterface.addIndex('categories', ['slug'], {
            name: 'idx_categories_slug',
            unique: true
        });
        await queryInterface.addIndex('categories', ['is_active'], {
            name: 'idx_categories_is_active'
        });
        await queryInterface.addIndex('categories', ['order'], {
            name: 'idx_categories_order'
        });

        // Services table indexes
        await queryInterface.addIndex('services', ['provider_id'], {
            name: 'idx_services_provider_id'
        });
        await queryInterface.addIndex('services', ['category_id'], {
            name: 'idx_services_category_id'
        });
        await queryInterface.addIndex('services', ['is_active'], {
            name: 'idx_services_is_active'
        });
        // Composite index for provider services query
        await queryInterface.addIndex('services', ['provider_id', 'is_active'], {
            name: 'idx_services_provider_active'
        });

        // Reviews table indexes
        await queryInterface.addIndex('reviews', ['provider_id'], {
            name: 'idx_reviews_provider_id'
        });
        await queryInterface.addIndex('reviews', ['user_id'], {
            name: 'idx_reviews_user_id'
        });
        await queryInterface.addIndex('reviews', ['is_visible'], {
            name: 'idx_reviews_is_visible'
        });
        await queryInterface.addIndex('reviews', ['rating'], {
            name: 'idx_reviews_rating'
        });
        await queryInterface.addIndex('reviews', ['created_at'], {
            name: 'idx_reviews_created_at'
        });
        // Composite index for visible reviews by provider
        await queryInterface.addIndex('reviews', ['provider_id', 'is_visible'], {
            name: 'idx_reviews_provider_visible'
        });

        // Favorites table indexes
        await queryInterface.addIndex('favorites', ['user_id'], {
            name: 'idx_favorites_user_id'
        });
        await queryInterface.addIndex('favorites', ['provider_id'], {
            name: 'idx_favorites_provider_id'
        });
        // Composite unique index
        await queryInterface.addIndex('favorites', ['user_id', 'provider_id'], {
            name: 'idx_favorites_user_provider',
            unique: true
        });

        // Contacts table indexes
        await queryInterface.addIndex('contacts', ['provider_id'], {
            name: 'idx_contacts_provider_id'
        });
        await queryInterface.addIndex('contacts', ['user_id'], {
            name: 'idx_contacts_user_id'
        });
        await queryInterface.addIndex('contacts', ['status'], {
            name: 'idx_contacts_status'
        });
        await queryInterface.addIndex('contacts', ['created_at'], {
            name: 'idx_contacts_created_at'
        });
        // Composite index for provider contacts by status
        await queryInterface.addIndex('contacts', ['provider_id', 'status'], {
            name: 'idx_contacts_provider_status'
        });

        // Refresh tokens table indexes
        await queryInterface.addIndex('refresh_tokens', ['user_id'], {
            name: 'idx_refresh_tokens_user_id'
        });
        await queryInterface.addIndex('refresh_tokens', ['token'], {
            name: 'idx_refresh_tokens_token',
            unique: true
        });
        await queryInterface.addIndex('refresh_tokens', ['expires_at'], {
            name: 'idx_refresh_tokens_expires_at'
        });
        await queryInterface.addIndex('refresh_tokens', ['is_revoked'], {
            name: 'idx_refresh_tokens_is_revoked'
        });

        // Security logs table indexes
        await queryInterface.addIndex('security_logs', ['user_id'], {
            name: 'idx_security_logs_user_id'
        });
        await queryInterface.addIndex('security_logs', ['event_type'], {
            name: 'idx_security_logs_event_type'
        });
        await queryInterface.addIndex('security_logs', ['ip_address'], {
            name: 'idx_security_logs_ip_address'
        });
        await queryInterface.addIndex('security_logs', ['created_at'], {
            name: 'idx_security_logs_created_at'
        });

        console.log('✅ Database indexes created successfully');
    },

    down: async (queryInterface, Sequelize) => {
        // Remove all indexes (in reverse order)
        const indexes = [
            // Security logs
            'idx_security_logs_created_at', 'idx_security_logs_ip_address',
            'idx_security_logs_event_type', 'idx_security_logs_user_id',
            // Refresh tokens
            'idx_refresh_tokens_is_revoked', 'idx_refresh_tokens_expires_at',
            'idx_refresh_tokens_token', 'idx_refresh_tokens_user_id',
            // Contacts
            'idx_contacts_provider_status', 'idx_contacts_created_at',
            'idx_contacts_status', 'idx_contacts_user_id', 'idx_contacts_provider_id',
            // Favorites
            'idx_favorites_user_provider', 'idx_favorites_provider_id', 'idx_favorites_user_id',
            // Reviews
            'idx_reviews_provider_visible', 'idx_reviews_created_at', 'idx_reviews_rating',
            'idx_reviews_is_visible', 'idx_reviews_user_id', 'idx_reviews_provider_id',
            // Services
            'idx_services_provider_active', 'idx_services_is_active',
            'idx_services_category_id', 'idx_services_provider_id',
            // Categories
            'idx_categories_order', 'idx_categories_is_active', 'idx_categories_slug',
            // Providers
            'idx_providers_verified_featured', 'idx_providers_created_at',
            'idx_providers_average_rating', 'idx_providers_location',
            'idx_providers_is_featured', 'idx_providers_is_verified', 'idx_providers_user_id',
            // Users
            'idx_users_created_at', 'idx_users_is_active', 'idx_users_role', 'idx_users_email'
        ];

        const tables = {
            'security_logs': ['idx_security_logs_created_at', 'idx_security_logs_ip_address', 'idx_security_logs_event_type', 'idx_security_logs_user_id'],
            'refresh_tokens': ['idx_refresh_tokens_is_revoked', 'idx_refresh_tokens_expires_at', 'idx_refresh_tokens_token', 'idx_refresh_tokens_user_id'],
            'contacts': ['idx_contacts_provider_status', 'idx_contacts_created_at', 'idx_contacts_status', 'idx_contacts_user_id', 'idx_contacts_provider_id'],
            'favorites': ['idx_favorites_user_provider', 'idx_favorites_provider_id', 'idx_favorites_user_id'],
            'reviews': ['idx_reviews_provider_visible', 'idx_reviews_created_at', 'idx_reviews_rating', 'idx_reviews_is_visible', 'idx_reviews_user_id', 'idx_reviews_provider_id'],
            'services': ['idx_services_provider_active', 'idx_services_is_active', 'idx_services_category_id', 'idx_services_provider_id'],
            'categories': ['idx_categories_order', 'idx_categories_is_active', 'idx_categories_slug'],
            'providers': ['idx_providers_verified_featured', 'idx_providers_created_at', 'idx_providers_average_rating', 'idx_providers_location', 'idx_providers_is_featured', 'idx_providers_is_verified', 'idx_providers_user_id'],
            'users': ['idx_users_created_at', 'idx_users_is_active', 'idx_users_role', 'idx_users_email']
        };

        for (const [table, tableIndexes] of Object.entries(tables)) {
            for (const index of tableIndexes) {
                try {
                    await queryInterface.removeIndex(table, index);
                } catch (e) {
                    console.log(`Index ${index} may not exist, skipping...`);
                }
            }
        }

        console.log('✅ Database indexes removed');
    }
};
