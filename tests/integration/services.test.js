const request = require('supertest');
const app = require('../../src/app');

describe('Services API', () => {
    describe('GET /api/services/categories', () => {
        it('should return list of categories', async () => {
            const res = await request(app)
                .get('/api/services/categories');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('categories');
            expect(Array.isArray(res.body.data.categories)).toBe(true);
        });
    });

    describe('GET /api/services/provider/:providerId', () => {
        it('should return empty array for non-existent provider', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .get(`/api/services/provider/${fakeId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.categories).toEqual([]);
        });
    });

    describe('POST /api/services/categories', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .post('/api/services/categories')
                .send({ name: 'Test Category' });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/services', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .post('/api/services')
                .send({
                    categoryId: '00000000-0000-0000-0000-000000000000',
                    name: 'Test Service',
                    description: 'Test description'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/services/:id', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put('/api/services/00000000-0000-0000-0000-000000000000')
                .send({ name: 'Updated' });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('DELETE /api/services/:id', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .delete('/api/services/00000000-0000-0000-0000-000000000000');

            expect(res.statusCode).toBe(401);
        });
    });
});
