const { sequelize } = require('../src/config/database');
const { Category } = require('../src/models');
const { categories } = require('./seedData');

const seed = async () => {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Test database connection instead of destructive sync
        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

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

        console.log('═══════════════════════════════════════');
        console.log('🎉 Database seeding completed!');
        console.log('═══════════════════════════════════════');
        console.log('\nCategories seeded successfully.');
        console.log('ℹ️  Admin account is provisioned via migration using AELI_ADMIN_EMAIL / AELI_ADMIN_PASSWORD.\n');

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
