const request = require('supertest');
const app = require('../../src/app');

describe('Users API', () => {
    describe('GET /api/users/profile', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/users/profile');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/users/profile', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .send({ firstName: 'Updated' });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/users/change-password', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put('/api/users/change-password')
                .send({
                    currentPassword: 'OldPass123!',
                    newPassword: 'NewPass123!'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('DELETE /api/users/deactivate', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .delete('/api/users/deactivate');

            expect(res.statusCode).toBe(401);
        });
    });
});
