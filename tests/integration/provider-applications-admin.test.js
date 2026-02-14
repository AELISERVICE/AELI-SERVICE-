const request = require('supertest');
const app = require('../../src/app');
const { User, Provider, ProviderApplication, Subscription } = require('../../src/models');
const { generateToken } = require('../../src/middlewares/auth');

describe('Provider Application Admin API', () => {
    let adminToken;
    let adminUser;
    let applicantUser;
    let testApplication;

    beforeAll(async () => {
        // Setup admin
        adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: `admin_app_${Date.now()}@test.com`,
            password: 'Password123!',
            role: 'admin',
            isEmailVerified: true
        });
        adminToken = generateToken(adminUser.id);

        // Setup applicant
        applicantUser = await User.create({
            firstName: 'Applicant',
            lastName: 'User',
            email: `applicant_${Date.now()}@test.com`,
            password: 'Password123!',
            role: 'client',
            isEmailVerified: true
        });

        // Create a pending application
        testApplication = await ProviderApplication.create({
            userId: applicantUser.id,
            firstName: 'Applicant',
            lastName: 'User',
            email: applicantUser.email,
            businessName: 'New Test Business',
            description: 'This is a sufficiently long description for testing the application review process and ensuring all validations are met.',
            location: 'Douala',
            status: 'pending',
            documents: [{ type: 'cni', url: 'http://test.com/cni.jpg', status: 'pending' }]
        });
    });

    afterAll(async () => {
        await Provider.destroy({ where: { userId: applicantUser.id } });
        await ProviderApplication.destroy({ where: { id: testApplication.id } });
        await User.destroy({ where: { id: [adminUser.id, applicantUser.id] } });
    });

    describe('PUT /api/admin/provider-applications/:id/review', () => {
        it('should approve a provider application', async () => {
            const res = await request(app)
                .put(`/api/admin/provider-applications/${testApplication.id}/review`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    decision: 'approved',
                    adminNotes: 'Looks good'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify applicant role changed
            const updatedUser = await User.findByPk(applicantUser.id);
            expect(updatedUser.role).toBe('provider');

            // Verify provider profile created
            const provider = await Provider.findOne({ where: { userId: applicantUser.id } });
            expect(provider).toBeDefined();
            expect(provider.businessName).toBe(testApplication.businessName);

            // Verify trial subscription created
            const subscription = await Subscription.findOne({ where: { providerId: provider.id } });
            expect(subscription).toBeDefined();
            expect(subscription.status).toBe('trial');
        });

        it('should reject if decision is invalid', async () => {
            const res = await request(app)
                .put(`/api/admin/provider-applications/${testApplication.id}/review`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    decision: 'maybe',
                    adminNotes: 'Notes'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/admin/provider-applications', () => {
        it('should list provider applications', async () => {
            const res = await request(app)
                .get('/api/admin/provider-applications')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.applications)).toBe(true);
        });
    });
});
