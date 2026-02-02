const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');

const checkAdmin = async () => {
    try {
        const admin = await User.findOne({ where: { email: 'admin@aeli.cm' } });
        if (admin) {
            console.log('ADMIN_FOUND: Yes');
            console.log('ADMIN_ROLE:', admin.role);
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
