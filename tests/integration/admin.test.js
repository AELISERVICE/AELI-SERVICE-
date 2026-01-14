const request = require('supertest');
const app = require('../../src/app');

describe('Admin API', () => {
    describe('GET /api/admin/stats', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/admin/stats');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/admin/users', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/admin/users');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/admin/users/:id/status', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put('/api/admin/users/00000000-0000-0000-0000-000000000000/status')
                .send({ isActive: false });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/admin/providers/pending', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/admin/providers/pending');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/admin/providers/:id/verify', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put('/api/admin/providers/00000000-0000-0000-0000-000000000000/verify')
                .send({ isVerified: true });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/admin/providers/:id/feature', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put('/api/admin/providers/00000000-0000-0000-0000-000000000000/feature')
                .send({ isFeatured: true });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/admin/reviews/reported', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/admin/reviews/reported');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/admin/reviews/:id/visibility', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put('/api/admin/reviews/00000000-0000-0000-0000-000000000000/visibility')
                .send({ isVisible: false });

            expect(res.statusCode).toBe(401);
        });
    });
});
