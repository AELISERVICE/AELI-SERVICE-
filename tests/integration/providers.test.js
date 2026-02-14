const request = require('supertest');
const app = require('../../src/app');
const { Provider, User, Category, Service } = require('../../src/models');
const { generateToken } = require('../../src/middlewares/auth');

describe('Providers API', () => {
    let providerToken;
    let providerUser;
    let clientToken;
    let clientUser;
    let testCategory;
    let testProvider;

    beforeAll(async () => {
        // Setup category
        testCategory = await Category.create({
            name: `Test Category ${Date.now()}`,
            slug: `test-cat-${Date.now()}`
        });

        // Setup provider user
        providerUser = await User.create({
            firstName: 'Pro',
            lastName: 'Vider',
            email: `provider_${Date.now()}@test.com`,
            password: 'Password123!',
            role: 'provider',
            isEmailVerified: true
        });
        providerToken = generateToken(providerUser.id);

        // Setup client user
        clientUser = await User.create({
            firstName: 'Cli',
            lastName: 'Ent',
            email: `client_${Date.now()}@test.com`,
            password: 'Password123!',
            role: 'client',
            isEmailVerified: true
        });
        clientToken = generateToken(clientUser.id);

        // Create a provider profile for testing GETByID/Update
        testProvider = await Provider.create({
            userId: providerUser.id,
            businessName: 'Existing Business',
            description: 'This is a sufficiently long description for testing the provider controller details and ensuring validation passes correctly.',
            location: 'Douala',
            isVerified: true
        });
    });

    afterAll(async () => {
        await Provider.destroy({ where: { userId: [providerUser.id] } });
        await User.destroy({ where: { id: [providerUser.id, clientUser.id] } });
        await Category.destroy({ where: { id: testCategory.id } });
    });

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

        it('should filter by category', async () => {
            const res = await request(app)
                .get(`/api/providers?category=${testCategory.slug}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            // Even if empty, it should exercise the category join logic
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
        });

        it('should return provider details', async () => {
            const res = await request(app)
                .get(`/api/providers/${testProvider.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.provider.id).toBe(testProvider.id);
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

        it('should reject if user already has a provider profile', async () => {
            const res = await request(app)
                .post('/api/providers/create')
                .set('Authorization', `Bearer ${providerToken}`)
                .send({
                    businessName: 'Another Business',
                    description: 'Another long enough description for the second provider attempt',
                    location: 'Douala'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('PUT /api/providers/:id', () => {
        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .put(`/api/providers/${testProvider.id}`)
                .send({ businessName: 'Updated' });

            expect(res.statusCode).toBe(401);
        });

        it('should update provider profile', async () => {
            const res = await request(app)
                .put(`/api/providers/${testProvider.id}`)
                .set('Authorization', `Bearer ${providerToken}`)
                .send({
                    businessName: 'Updated Business Name',
                    location: 'Yaounde'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.provider.businessName).toBe('Updated Business Name');
        });
    });

    describe('GET /api/providers/my-dashboard', () => {
        it('should return provider dashboard data', async () => {
            const res = await request(app)
                .get('/api/providers/my-dashboard')
                .set('Authorization', `Bearer ${providerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('stats');
        });

        it('should reject client access', async () => {
            const res = await request(app)
                .get('/api/providers/my-dashboard')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toBe(403);
        });
    });
});
