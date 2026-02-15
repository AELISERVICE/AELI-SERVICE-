const { sequelize } = require('../src/config/database');
const { User, Provider, Category, Service, Review } = require('../src/models');
const bcrypt = require('bcryptjs');
const {
    categories,
    generateUser,
    generateProvider,
    generateService,
    generateReview
} = require('./seedData');

const seed = async () => {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Sync database
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced\n');

        // 1. Seed Categories
        console.log('📁 Seeding categories...');
        let catCount = 0;
        for (const cat of categories) {
            const existing = await Category.findOne({ where: { name: cat.name } });
            if (!existing) {
                await Category.create(cat);
                catCount++;
            }
        }
        console.log(`   ✅ ${catCount} categories created (${categories.length - catCount} already existed)\n`);

        // 2. Create Admin user
        console.log('👤 Creating admin user...');
        
        // Supprimer d'abord l'admin existant
        await User.destroy({ where: { email: 'admin@aeli.cm' } });
        
        // Créer l'admin avec les hooks de sécurité activés
        const adminData = {
            id: require('uuid').v4(),
            email: 'admin@aeli.cm',
            password: 'Password123!', // En clair, le hook corrigé va le hasher
            firstName: 'Admin',
            lastName: 'User',
            phone: '+237612345678',
            country: 'Cameroun',
            gender: 'prefer_not_to_say',
            role: 'admin',
            isActive: true,
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        // Créer AVEC les hooks de sécurité corrigés
        const admin = await User.create(adminData);
        
        console.log(`   ✅ Admin: admin@aeli.cm / Password123!\n`);

        // 3. Create regular users
        console.log('👥 Creating test users...');
        const users = [];
        for (let i = 1; i <= 10; i++) {
            const userData = generateUser(i, 'client');
            const [user] = await User.findOrCreate({
                where: { email: userData.email },
                defaults: userData
            });
            users.push(user);
        }
        console.log(`   ✅ ${users.length} users loaded\n`);

        // 4. Create providers
        console.log('🏢 Creating providers...');
        const providers = [];
        for (let i = 0; i < 5; i++) {
            // Create provider user
            const providerUserData = generateUser(100 + i, 'provider');
            const [providerUser] = await User.findOrCreate({
                where: { email: providerUserData.email },
                defaults: providerUserData
            });

            // Create provider profile
            const providerData = generateProvider(providerUser.id, i);
            let [provider] = await Provider.findOrCreate({
                where: { userId: providerUser.id },
                defaults: providerData
            });
            providers.push(provider);
        }
        console.log(`   ✅ ${providers.length} providers loaded\n`);

        // 5. Create services
        console.log('🛠️ Creating services...');
        const allCategories = await Category.findAll();
        let serviceCount = 0;
        for (const provider of providers) {
            const numServices = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numServices; i++) {
                const category = allCategories[Math.floor(Math.random() * allCategories.length)];
                const serviceData = generateService(provider.id, category.id, serviceCount);
                await Service.upsert(serviceData);
                serviceCount++;
            }
        }
        console.log(`   ✅ ${serviceCount} services created\n`);

        // 6. Create reviews
        console.log('⭐ Creating reviews...');
        let reviewCount = 0;
        for (const provider of providers) {
            const numReviews = Math.floor(Math.random() * 5) + 2;
            for (let i = 0; i < numReviews; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const reviewData = generateReview(user.id, provider.id, reviewCount);
                try {
                    await Review.upsert(reviewData);
                    reviewCount++;
                } catch (e) {
                    // Skip duplicate reviews
                }
            }
        }
        console.log(`   ✅ ${reviewCount} reviews created\n`);

        console.log('═══════════════════════════════════════');
        console.log('🎉 Database seeding completed!');
        console.log('═══════════════════════════════════════');
        console.log('\nTest credentials:');
        console.log('  Admin: admin@aeli.cm / Password123!');
        console.log('  Users: Check console output above\n');

    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        if (error.errors) {
            error.errors.forEach(e => console.error('  -', e.message));
        }
        throw error;
    } finally {
        await sequelize.close();
    }
};

// Run if called directly
if (require.main === module) {
    seed()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = seed;
