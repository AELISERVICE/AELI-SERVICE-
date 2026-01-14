const request = require('supertest');
const app = require('../../src/app');

describe('API Health', () => {
    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const res = await request(app)
                .get('/api/health');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('AELI Services API');
            expect(res.body.timestamp).toBeDefined();
            expect(res.body.uptime).toBeDefined();
        });
    });

    describe('Public endpoints', () => {
        it('should list categories without auth', async () => {
            const res = await request(app)
                .get('/api/services/categories');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should list providers without auth', async () => {
            const res = await request(app)
                .get('/api/providers');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('providers');
            expect(res.body.data).toHaveProperty('pagination');
        });
    });

    describe('Protected endpoints', () => {
        it('should reject favorites without auth', async () => {
            const res = await request(app)
                .get('/api/favorites');

            expect(res.statusCode).toBe(401);
        });

        it('should reject admin routes without auth', async () => {
            const res = await request(app)
                .get('/api/admin/stats');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Rate limiting', () => {
        it('should include rate limit headers', async () => {
            const res = await request(app)
                .get('/api/health');

            // express-rate-limit v7+ uses lowercase headers without x- prefix
            expect(res.headers).toHaveProperty('ratelimit-limit');
            expect(res.headers).toHaveProperty('ratelimit-remaining');
        });
    });
});
