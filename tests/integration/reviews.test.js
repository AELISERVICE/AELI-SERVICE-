const request = require('supertest');
const app = require('../../src/app');

describe('Reviews API', () => {
    describe('GET /api/reviews/provider/:providerId', () => {
        it('should return empty array for non-existent provider', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .get(`/api/reviews/provider/${fakeId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.reviews).toEqual([]);
            expect(res.body.data.pagination).toBeDefined();
        });

        it('should accept pagination parameters', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .get(`/api/reviews/provider/${fakeId}?page=1&limit=5`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.pagination.itemsPerPage).toBe(5);
        });
    });

    describe('POST /api/reviews', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .post('/api/reviews')
                .send({
                    providerId: '00000000-0000-0000-0000-000000000000',
                    rating: 5,
                    comment: 'Great service!'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/reviews/:id', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put('/api/reviews/00000000-0000-0000-0000-000000000000')
                .send({ rating: 4 });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('DELETE /api/reviews/:id', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .delete('/api/reviews/00000000-0000-0000-0000-000000000000');

            expect(res.statusCode).toBe(401);
        });
    });
});
