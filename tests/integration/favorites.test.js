const request = require('supertest');
const app = require('../../src/app');

describe('Favorites API', () => {
    describe('GET /api/favorites', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/favorites');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/favorites', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .post('/api/favorites')
                .send({
                    providerId: '00000000-0000-0000-0000-000000000000'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('DELETE /api/favorites/:providerId', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .delete('/api/favorites/00000000-0000-0000-0000-000000000000');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/favorites/check/:providerId', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/favorites/check/00000000-0000-0000-0000-000000000000');

            expect(res.statusCode).toBe(401);
        });
    });
});
