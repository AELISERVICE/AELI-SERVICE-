const { sequelize } = require('../src/config/database');

// Increase timeout for database operations
jest.setTimeout(30000);

// Setup before all tests
beforeAll(async () => {
    // Sync database for tests (create tables if not exist)
    try {
        await sequelize.authenticate();
        console.log('✅ Test database connected');
    } catch (error) {
        console.error('❌ Test database connection failed:', error.message);
        throw error;
    }
});

// Cleanup after all tests
afterAll(async () => {
    try {
        await sequelize.close();
        console.log('✅ Test database connection closed');
    } catch (error) {
        console.error('Error closing test database:', error.message);
    }
});

// Global test helpers
global.testHelpers = {
    generateTestEmail: () => `test_${Date.now()}@example.com`,
    generateTestPassword: () => 'SecureTestPass123!'
};
