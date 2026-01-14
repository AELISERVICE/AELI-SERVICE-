const request = require('supertest');
const app = require('../../src/app');
const { Provider, User, Category, Service } = require('../../src/models');

describe('Providers API', () => {
    describe('GET /api/providers', () => {
        it('should return paginated providers list', async () => {
            const res = await request(app)
                .get('/api/providers');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('providers');
            expect(res.body.data).toHaveProperty('pagination');
            expect(Array.isArray(res.body.data.providers)).toBe(true);
        });

        it('should accept pagination parameters', async () => {
            const res = await request(app)
                .get('/api/providers?page=1&limit=5');

            expect(res.statusCode).toBe(200);
            expect(res.body.data.pagination).toHaveProperty('currentPage');
            expect(res.body.data.pagination).toHaveProperty('itemsPerPage');
            expect(res.body.data.pagination).toHaveProperty('totalItems');
        });

        it('should accept filter parameters', async () => {
            const res = await request(app)
                .get('/api/providers?location=Douala&minRating=3');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should accept search parameter', async () => {
            const res = await request(app)
                .get('/api/providers?search=test');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should accept sort parameter', async () => {
            const res = await request(app)
                .get('/api/providers?sort=rating');

            expect(res.statusCode).toBe(200);
        });
    });

    describe('GET /api/providers/:id', () => {
        it('should return 404 for non-existent provider', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .get(`/api/providers/${fakeId}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should handle invalid UUID gracefully', async () => {
            const res = await request(app)
                .get('/api/providers/invalid-uuid');

            // Sequelize throws an error for invalid UUID format
            expect([400, 500]).toContain(res.statusCode);
        });
    });

    describe('POST /api/providers/create', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .post('/api/providers/create')
                .send({
                    businessName: 'Test Business',
                    description: 'Test description that is long enough to pass validation requirements',
                    location: 'Douala'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/providers/:id', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put('/api/providers/00000000-0000-0000-0000-000000000000')
                .send({ businessName: 'Updated' });

            expect(res.statusCode).toBe(401);
        });
    });
});
