const request = require('supertest');
const app = require('../../src/app');

describe('Contacts API', () => {
    describe('POST /api/contacts', () => {
        it('should create contact without authentication', async () => {
            // This should fail because provider doesn't exist, not auth
            const res = await request(app)
                .post('/api/contacts')
                .send({
                    providerId: '00000000-0000-0000-0000-000000000000',
                    message: 'Hello, I am interested in your services',
                    senderName: 'Test User',
                    senderEmail: 'test@example.com',
                    senderPhone: '+237690000000'
                });

            // Should fail with 404 (provider not found), not 401
            expect(res.statusCode).toBe(404);
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/contacts')
                .send({
                    providerId: '00000000-0000-0000-0000-000000000000'
                    // Missing required fields
                });

            expect(res.statusCode).toBe(400);
        });

        it('should validate email format', async () => {
            const res = await request(app)
                .post('/api/contacts')
                .send({
                    providerId: '00000000-0000-0000-0000-000000000000',
                    message: 'Test message',
                    senderName: 'Test User',
                    senderEmail: 'invalid-email',
                    senderPhone: '+237690000000'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/contacts/received', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/contacts/received');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/contacts/sent', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/contacts/sent');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/contacts/:id/status', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put('/api/contacts/00000000-0000-0000-0000-000000000000/status')
                .send({ status: 'read' });

            expect(res.statusCode).toBe(401);
        });
    });
});
