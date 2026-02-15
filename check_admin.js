const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

const checkAdmin = async () => {
    try {
        const admin = await User.findOne({ 
            where: { email: 'admin@aeli.cm' },
            hooks: false
        });
        
        if (admin) {
            console.log('ADMIN_FOUND: Yes');
            console.log('ADMIN_ROLE:', admin.role);
            console.log('ADMIN_ACTIVE:', admin.isActive);
            console.log('ADMIN_EMAIL_VERIFIED:', admin.isEmailVerified);
            console.log('STORED_HASH:', admin.password);
            
            // Tester avec Password123!
            const directMatch = bcrypt.compareSync('Password123!', admin.password);
            console.log('DIRECT_BCRYPT_MATCH (Password123!):', directMatch);
            
            const isMatch = await admin.comparePassword('Password123!');
            console.log('MODEL_COMPARE_MATCH (Password123!):', isMatch);
        } else {
            console.log('ADMIN_FOUND: No');
        }
    } catch (error) {
        console.error('Error checking admin:', error);
    } finally {
        await sequelize.close();
    }
};

checkAdmin();
