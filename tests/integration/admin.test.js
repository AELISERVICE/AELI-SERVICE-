const request = require('supertest');
const app = require('../../src/app');

const { User, Provider, Review } = require('../../src/models');
const { generateToken } = require('../../src/middlewares/auth');

describe('Admin API', () => {
    let adminToken;
    let adminUser;
    let testUser;
    let testProvider;
    let testReview;

    beforeAll(async () => {
        // Setup admin
        adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: `admin_${Date.now()}@test.com`,
            password: 'Password123!',
            role: 'admin',
            isEmailVerified: true
        });
        adminToken = generateToken(adminUser.id);

        // Setup test client
        testUser = await User.create({
            firstName: 'Test',
            lastName: 'Client',
            email: `client_${Date.now()}@test.com`,
            password: 'Password123!',
            role: 'client'
        });

        // Setup test provider
        const providerUser = await User.create({
            firstName: 'Provider',
            lastName: 'User',
            email: `provider_${Date.now()}@test.com`,
            password: 'Password123!',
            role: 'provider'
        });
        testProvider = await Provider.create({
            userId: providerUser.id,
            businessName: 'Admin Test Provider Inc',
            description: 'This is a sufficiently long description for testing the admin controller functionality and ensuring validation passes correctly for integration tests.',
            location: 'Douala',
            isVerified: false
        });

        // Setup test review
        testReview = await Review.create({
            userId: testUser.id,
            providerId: testProvider.id,
            rating: 4,
            comment: 'Good service',
            isVisible: true
        });
    });

    afterAll(async () => {
        await Review.destroy({ where: { providerId: testProvider.id } });
        await Provider.destroy({ where: { id: testProvider.id } });
        await User.destroy({ where: { role: ['admin', 'client', 'provider'] } });
    });

    describe('GET /api/admin/stats', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/admin/stats');

            expect(res.statusCode).toBe(401);
        });

        it('should return platform statistics', async () => {
            const res = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('users');
            expect(res.body.data).toHaveProperty('providers');
            expect(res.body.data).toHaveProperty('payments');
        });
    });

    describe('GET /api/admin/users', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/admin/users');

            expect(res.statusCode).toBe(401);
        });

        it('should return list of users', async () => {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.users)).toBe(true);
        });
    });

    describe('PUT /api/admin/users/:id/status', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put(`/api/admin/users/${testUser.id}/status`)
                .send({ isActive: false });

            expect(res.statusCode).toBe(401);
        });

        it('should update user status', async () => {
            const res = await request(app)
                .put(`/api/admin/users/${testUser.id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isActive: false });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const updatedUser = await User.findByPk(testUser.id);
            expect(updatedUser.isActive).toBe(false);
        });
    });

    describe('GET /api/admin/providers/pending', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/admin/providers/pending');

            expect(res.statusCode).toBe(401);
        });

        it('should return pending providers', async () => {
            const res = await request(app)
                .get('/api/admin/providers/pending')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.providers)).toBe(true);
        });
    });

    describe('PUT /api/admin/providers/:id/verify', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put(`/api/admin/providers/${testProvider.id}/verify`)
                .send({ isVerified: true });

            expect(res.statusCode).toBe(401);
        });

        it('should verify a provider', async () => {
            const res = await request(app)
                .put(`/api/admin/providers/${testProvider.id}/verify`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isVerified: true });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const updatedProvider = await Provider.findByPk(testProvider.id);
            expect(updatedProvider.isVerified).toBe(true);
        });
    });

    describe('PUT /api/admin/providers/:id/feature', () => {
        it('should feature a provider', async () => {
            const res = await request(app)
                .put(`/api/admin/providers/${testProvider.id}/feature`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isFeatured: true });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const updatedProvider = await Provider.findByPk(testProvider.id);
            expect(updatedProvider.isFeatured).toBe(true);
        });
    });

    describe('GET /api/admin/providers/under-review', () => {
        it('should return providers under review', async () => {
            const res = await request(app)
                .get('/api/admin/providers/under-review')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('PUT /api/admin/providers/:id/review-documents', () => {
        it('should update document review status', async () => {
            const res = await request(app)
                .put(`/api/admin/providers/${testProvider.id}/review-documents`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    decision: 'under_review',
                    notes: 'Checking documents now'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const updatedProvider = await Provider.findByPk(testProvider.id);
            expect(updatedProvider.verificationStatus).toBe('under_review');
        });
    });

    describe('GET /api/admin/audit-logs', () => {
        it('should return audit logs', async () => {
            const res = await request(app)
                .get('/api/admin/audit-logs')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('logs');
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
                .put(`/api/admin/reviews/${testReview.id}/visibility`)
                .send({ isVisible: false });

            expect(res.statusCode).toBe(401);
        });

        it('should update review visibility', async () => {
            const res = await request(app)
                .put(`/api/admin/reviews/${testReview.id}/visibility`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isVisible: false });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const updatedReview = await Review.findByPk(testReview.id);
            expect(updatedReview.isVisible).toBe(false);
        });
    });
});
