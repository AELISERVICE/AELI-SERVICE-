const request = require('supertest');
const app = require('../../src/app');
const { User } = require('../../src/models');
const { generateToken } = require('../../src/middlewares/auth');

describe('User API', () => {
    let testUser;
    let userToken;

    beforeAll(async () => {
        // Setup test user
        testUser = await User.create({
            firstName: 'Normal',
            lastName: 'User',
            email: `user_${Date.now()}@test.com`,
            password: 'Password123!',
            role: 'client',
            isEmailVerified: true
        });
        userToken = generateToken(testUser.id);
    });

    afterAll(async () => {
        await User.destroy({ where: { id: testUser.id } });
    });

    describe('GET /api/users/profile', () => {
        it('should return user profile', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe(testUser.email);
        });

        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/users/profile');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/users/profile', () => {
        it('should update user profile fields', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    firstName: 'UpdatedName',
                    lastName: 'UpdatedLastName'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.firstName).toBe('UpdatedName');

            const updatedUser = await User.findByPk(testUser.id);
            expect(updatedUser.firstName).toBe('UpdatedName');
        });
    });

    describe('PUT /api/users/password', () => {
        it('should change user password', async () => {
            const res = await request(app)
                .put('/api/users/password')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    currentPassword: 'Password123!',
                    newPassword: 'NewPassword123!'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify we can login with new password (indirectly by checking DB if we wanted, 
            // but controller logic is exercised)
            const user = await User.findByPk(testUser.id);
            const isMatch = await user.comparePassword('NewPassword123!');
            expect(isMatch).toBe(true);
        });

        it('should reject incorrect current password', async () => {
            const res = await request(app)
                .put('/api/users/password')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    currentPassword: 'WrongPassword!',
                    newPassword: 'AnotherPassword123!'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('DELETE /api/users/account', () => {
        it('should deactivate user account', async () => {
            const res = await request(app)
                .delete('/api/users/account')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const user = await User.findByPk(testUser.id);
            expect(user.isActive).toBe(false);
        });
    });
});
