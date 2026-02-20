const request = require('supertest');
const app = require('../../src/app');
const { User, Provider } = require('../../src/models');
const { generateToken } = require('../../src/middlewares/auth');

describe('Admin API - Review Documents Refined', () => {
    let adminToken;
    let adminUser;
    let testProvider;
    let providerUser;

    beforeAll(async () => {
        // Setup admin
        adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: `admin_rev_${Date.now()}@test.com`,
            password: 'Password123!',
            role: 'admin',
            isEmailVerified: true
        });
        adminToken = generateToken(adminUser.id);

        // Setup test provider with documents
        providerUser = await User.create({
            firstName: 'Provider',
            lastName: 'User',
            email: `provider_rev_${Date.now()}@test.com`,
            password: 'Password123!',
            role: 'provider'
        });
        testProvider = await Provider.create({
            userId: providerUser.id,
            businessName: 'Review Test Provider',
            description: 'Testing the refined document review system with multi-document support.',
            location: 'Douala',
            isVerified: false,
            documents: [
                { type: 'ID_CARD', url: 'https://test.com/id.jpg', status: 'pending' },
                { type: 'LICENSE', url: 'https://test.com/lic.jpg', status: 'pending' }
            ]
        });
    });

    afterAll(async () => {
        await Provider.destroy({ where: { id: testProvider.id } });
        await User.destroy({ where: { id: [adminUser.id, providerUser.id] } });
    });

    describe('PUT /api/admin/providers/:id/review-documents', () => {
        it('should fail if decision is invalid', async () => {
            const res = await request(app)
                .put(`/api/admin/providers/${testProvider.id}/review-documents`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    decision: 'invalid_decision'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Erreur de validation');
        });

        it('should approve specific documents', async () => {
            const res = await request(app)
                .put(`/api/admin/providers/${testProvider.id}/review-documents`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    decision: 'under_review',
                    approvedDocuments: [0]
                });

            expect(res.statusCode).toBe(200);

            const updatedProvider = await Provider.findByPk(testProvider.id);
            expect(updatedProvider.documents[0].status).toBe('approved');
            expect(updatedProvider.documents[1].status).toBe('pending');
        });

        it('should reject specific documents with reason', async () => {
            const res = await request(app)
                .put(`/api/admin/providers/${testProvider.id}/review-documents`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    decision: 'under_review',
                    rejectedDocuments: [
                        { index: 1, reason: 'Document is blur' }
                    ]
                });

            expect(res.statusCode).toBe(200);

            const updatedProvider = await Provider.findByPk(testProvider.id);
            expect(updatedProvider.documents[1].status).toBe('rejected');
            expect(updatedProvider.documents[1].rejectionReason).toBe('Document is blur');
        });

        it('should handle invalid document indexes gracefully', async () => {
            const res = await request(app)
                .put(`/api/admin/providers/${testProvider.id}/review-documents`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    decision: 'under_review',
                    approvedDocuments: [999], // Out of bounds
                    rejectedDocuments: [
                        { index: 888, reason: 'Does not exist' }
                    ]
                });

            expect(res.statusCode).toBe(200); // Should not crash, just ignore/log

            const updatedProvider = await Provider.findByPk(testProvider.id);
            // Verify no other documents were affected
            expect(updatedProvider.documents.length).toBe(2);
        });

        it('should verify provider when decision is approved', async () => {
            const res = await request(app)
                .put(`/api/admin/providers/${testProvider.id}/review-documents`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    decision: 'approved'
                });

            expect(res.statusCode).toBe(200);

            const updatedProvider = await Provider.findByPk(testProvider.id);
            expect(updatedProvider.isVerified).toBe(true);
            expect(updatedProvider.verificationStatus).toBe('approved');
        });
    });
});
