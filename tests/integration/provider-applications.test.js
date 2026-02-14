const request = require('supertest');
const path = require('path');
const app = require('../../src/app');
const { User, Provider, ProviderApplication, sequelize } = require('../../src/models');
const { generateToken } = require('../../src/utils/helpers');

describe('Provider Application Integration', () => {
    let clientToken;
    let client;

    beforeAll(async () => {
        // Setup a test client
        client = await User.create({
            firstName: 'Test',
            lastName: 'Client',
            email: 'client@test.com',
            password: 'Password123!',
            role: 'client'
        });
        clientToken = generateToken(client.id);
    });

    afterAll(async () => {
        await ProviderApplication.destroy({ where: { userId: client.id } });
        await Provider.destroy({ where: { userId: client.id } });
        await User.destroy({ where: { id: client.id } });
    });

    describe('POST /api/providers/apply', () => {
        it('should submit a complete application with new fields', async () => {
            const res = await request(app)
                .post('/api/providers/apply')
                .set('Authorization', `Bearer ${clientToken}`)
                .field('businessName', 'New Fashion Shop')
                .field('description', 'A very long description specifically designed to pass the validation threshold of fifty characters.')
                .field('location', 'Douala')
                .field('latitude', '4.0511')
                .field('longitude', '9.7085')
                .field('activities', JSON.stringify(['Hairdressing', 'Makeup']))
                .field('cniNumber', '123456789')
                .attach('imgcnirecto', path.join(__dirname, '../fixtures/test-image.png')) // Use an existing test fixture
                .attach('imgcniverso', path.join(__dirname, '../fixtures/test-image.png'));

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);

            const application = await ProviderApplication.findOne({ where: { userId: client.id } });
            expect(application).toBeDefined();
            expect(application.latitude).toBe('4.05110000');
            expect(application.activities).toContain('Hairdressing');
            expect(application.documents.some(d => d.type === 'cni_recto')).toBe(true);
        });

        it('should fail if CNI files are missing', async () => {
            const res = await request(app)
                .post('/api/providers/apply')
                .set('Authorization', `Bearer ${clientToken}`)
                .field('businessName', 'Fail Shop')
                .field('description', 'A descriptive shop description for testing purposes only.')
                .field('location', 'Yaoundé');

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('CNI');
        });
    });
});
