const request = require('supertest');
const path = require('path');
const app = require('../../src/app');
const { User, Provider, ProviderApplication } = require('../../src/models');
const { generateToken } = require('../../src/middlewares/auth');

// Mock email to avoid SMTP errors
jest.mock('../../src/config/email', () => ({
    sendEmail: jest.fn().mockResolvedValue(true)
}));

describe('Provider Application Integration', () => {
    let clientToken;
    let client;

    beforeAll(async () => {
        client = await User.create({
            firstName: 'Test',
            lastName: 'Client',
            email: global.testHelpers.generateTestEmail(),
            password: global.testHelpers.generateTestPassword(),
            role: 'client'
        });
        clientToken = generateToken(client.id);
    });

    afterAll(async () => {
        if (client) {
            await ProviderApplication.destroy({ where: { userId: client.id } });
            await Provider.destroy({ where: { userId: client.id } });
            await User.destroy({ where: { id: client.id } });
        }
    });

    describe('POST /api/providers/apply', () => {
        it('should require CNI files', async () => {
            const res = await request(app)
                .post('/api/providers/apply')
                .set('Authorization', `Bearer ${clientToken}`)
                .field('businessName', 'Test Shop')
                .field('description', 'A descriptive shop description for testing purposes with enough characters to pass validation.')
                .field('location', 'Yaoundé');

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});
