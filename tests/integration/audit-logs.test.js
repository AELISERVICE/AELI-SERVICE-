const request = require('supertest');
const app = require('../../src/app');
const { User, AuditLog } = require('../../src/models');
const { generateToken } = require('../../src/middlewares/auth');

describe('Audit Logging Integration', () => {
    let adminToken;
    let adminUser;

    beforeAll(async () => {
        try {
            console.log('--- START TEST SETUP ---');
            // Find or create admin user
            adminUser = await User.findOne({ where: { role: 'admin' } });
            if (!adminUser) {
                console.log('Creating admin user...');
                adminUser = await User.create({
                    firstName: 'Admin',
                    lastName: 'AELI',
                    email: 'admin_audit_test@aeli.com',
                    password: 'Password123!',
                    role: 'admin',
                    isEmailVerified: true
                });
            }
            adminToken = generateToken(adminUser.id);
            console.log('--- END TEST SETUP ---');
        } catch (error) {
            console.error('--- SETUP ERROR ---', error);
            throw error;
        }
    });

    describe('Login Event', () => {
        it('should log a login event', async () => {
            console.log('Running login test...');
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: adminUser.email,
                    password: 'Password123!'
                });

            expect(res.statusCode).toBe(200);

            // Wait a bit for async audit log
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check audit log
            const log = await AuditLog.findOne({
                where: {
                    userId: adminUser.id,
                    action: 'LOGIN',
                    entityType: 'User'
                },
                order: [['createdAt', 'DESC']]
            });

            expect(log).toBeDefined();
            expect(log.action).toBe('LOGIN');
            console.log('Login test PASSED');
        });
    });

    describe('Admin Actions', () => {
        it('should log a user status update', async () => {
            console.log('Running user status test...');
            // Create a test user
            const testUser = await User.create({
                firstName: 'Test',
                lastName: 'Audit',
                email: `audit_${Date.now()}@test.com`,
                password: 'Password123!',
                role: 'client'
            });

            const res = await request(app)
                .put(`/api/admin/users/${testUser.id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isActive: false });

            expect(res.statusCode).toBe(200);

            // Wait a bit for async audit log
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check audit log
            const log = await AuditLog.findOne({
                where: {
                    userId: adminUser.id,
                    action: 'UPDATE',
                    entityType: 'User',
                    entityId: testUser.id
                },
                order: [['createdAt', 'DESC']]
            });

            expect(log).toBeDefined();
            expect(log.newValues.isActive).toBe(false);
            console.log('User status test PASSED');
        });
    });
});
