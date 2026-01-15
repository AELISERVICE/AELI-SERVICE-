/**
 * Integration Tests for Subscriptions
 * Tests subscription creation, renewal, and expiration
 */

const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Provider, Subscription } = require('../../src/models');

describe('Subscription Integration Tests', () => {
    let testUser;
    let testProvider;
    let authToken;

    beforeAll(async () => {
        await sequelize.sync({ alter: true });
    });

    beforeEach(async () => {
        // Create test user with provider role
        const timestamp = Date.now();
        testUser = await User.create({
            email: `provider_sub_${timestamp}@test.com`,
            password: 'TestPassword123!',
            firstName: 'SubTest',
            lastName: 'Provider',
            role: 'provider',
            isEmailVerified: true,
            isActive: true
        });

        // Create provider profile
        testProvider = await Provider.create({
            userId: testUser.id,
            businessName: `Test Business ${timestamp}`,
            description: 'A test business for subscription testing. This description needs to be at least 50 characters.',
            location: 'Douala',
            isVerified: true
        });

        // Generate auth token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'TestPassword123!'
            });

        // Handle different response formats
        authToken = loginRes.body.accessToken || loginRes.body.data?.accessToken;
    });

    afterEach(async () => {
        // Cleanup - delete in order of dependencies
        await Subscription.destroy({ where: { providerId: testProvider?.id } });
        await Provider.destroy({ where: { id: testProvider?.id } });
        await User.destroy({ where: { id: testUser?.id } });
    });

    describe('Subscription Model Methods', () => {
        describe('Subscription.createTrial()', () => {
            test('should create a 30-day trial subscription', async () => {
                const subscription = await Subscription.createTrial(testProvider.id);

                expect(subscription).toBeDefined();
                expect(subscription.status).toBe('trial');
                expect(subscription.plan).toBe('trial');
                expect(parseFloat(subscription.price)).toBe(0);
                expect(subscription.providerId).toBe(testProvider.id);

                // Check dates
                const now = new Date();
                const thirtyDaysLater = new Date();
                thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

                expect(subscription.startDate).toBeDefined();
                expect(subscription.endDate).toBeDefined();

                // End date should be ~30 days from now
                const daysDiff = Math.round((subscription.endDate - subscription.startDate) / (1000 * 60 * 60 * 24));
                expect(daysDiff).toBe(30);
            });

            test('should set currency to XAF', async () => {
                const subscription = await Subscription.createTrial(testProvider.id);
                expect(subscription.currency).toBe('XAF');
            });
        });

        describe('Subscription.isActive()', () => {
            test('should return true for active trial', async () => {
                await Subscription.createTrial(testProvider.id);

                const isActive = await Subscription.isActive(testProvider.id);
                expect(isActive).toBe(true);
            });

            test('should return false for expired subscription', async () => {
                // Create subscription with past end date
                await Subscription.create({
                    providerId: testProvider.id,
                    status: 'trial',
                    plan: 'trial',
                    price: 0,
                    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
                    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
                });

                const isActive = await Subscription.isActive(testProvider.id);
                expect(isActive).toBe(false);
            });

            test('should return false for provider without subscription', async () => {
                const isActive = await Subscription.isActive(testProvider.id);
                expect(isActive).toBe(false);
            });
        });

        describe('Subscription.getStatus()', () => {
            test('should return complete status for active trial', async () => {
                await Subscription.createTrial(testProvider.id);

                const status = await Subscription.getStatus(testProvider.id);

                expect(status.status).toBe('trial');
                expect(status.isActive).toBe(true);
                expect(status.plan).toBe('trial');
                expect(status.isTrial).toBe(true);
                expect(status.daysRemaining).toBeGreaterThan(0);
                expect(status.daysRemaining).toBeLessThanOrEqual(30);
            });

            test('should return expired status for past subscription', async () => {
                await Subscription.create({
                    providerId: testProvider.id,
                    status: 'active',
                    plan: 'monthly',
                    price: 5000,
                    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Yesterday
                });

                const status = await Subscription.getStatus(testProvider.id);

                expect(status.status).toBe('expired');
                expect(status.isActive).toBe(false);
                expect(status.daysRemaining).toBe(0);
            });

            test('should return none status for provider without subscription', async () => {
                const status = await Subscription.getStatus(testProvider.id);

                expect(status.status).toBe('none');
                expect(status.isActive).toBe(false);
            });
        });

        describe('Subscription.renewSubscription()', () => {
            test('should renew subscription with monthly plan', async () => {
                // Create expired trial first
                await Subscription.create({
                    providerId: testProvider.id,
                    status: 'expired',
                    plan: 'trial',
                    price: 0,
                    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                });

                // Use a valid UUID for paymentId
                const validPaymentId = 'a0000000-0000-0000-0000-000000000001';
                const renewed = await Subscription.renewSubscription(testProvider.id, 'monthly', validPaymentId);

                expect(renewed.status).toBe('active');
                expect(renewed.plan).toBe('monthly');
                expect(parseFloat(renewed.price)).toBe(5000);
                expect(renewed.paymentId).toBe(validPaymentId);

                // Should have 30 more days
                const daysRemaining = Math.round((renewed.endDate - new Date()) / (1000 * 60 * 60 * 24));
                expect(daysRemaining).toBeGreaterThanOrEqual(29);
            });

            test('should throw error for trial plan renewal', async () => {
                await Subscription.createTrial(testProvider.id);

                await expect(
                    Subscription.renewSubscription(testProvider.id, 'trial')
                ).rejects.toThrow('Plan invalide');
            });

            test('should throw error for provider without subscription', async () => {
                await expect(
                    Subscription.renewSubscription(testProvider.id, 'monthly')
                ).rejects.toThrow('Aucun abonnement trouvé');
            });
        });

        describe('Subscription.expireOldSubscriptions()', () => {
            test('should expire subscriptions past end date', async () => {
                // Create expired subscription
                await Subscription.create({
                    providerId: testProvider.id,
                    status: 'trial',
                    plan: 'trial',
                    price: 0,
                    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Yesterday
                });

                const expiredCount = await Subscription.expireOldSubscriptions();

                expect(expiredCount).toBeGreaterThanOrEqual(1);

                // Verify subscription is now expired
                const sub = await Subscription.findOne({ where: { providerId: testProvider.id } });
                expect(sub.status).toBe('expired');
            });

            test('should not expire active subscriptions', async () => {
                await Subscription.createTrial(testProvider.id);

                await Subscription.expireOldSubscriptions();

                const sub = await Subscription.findOne({ where: { providerId: testProvider.id } });
                expect(sub.status).toBe('trial'); // Still trial
            });
        });
    });

    describe('PLANS pricing configuration', () => {
        test('should have correct trial pricing', () => {
            expect(Subscription.PLANS.trial.price).toBe(0);
            expect(Subscription.PLANS.trial.days).toBe(30);
        });

        test('should have correct monthly pricing', () => {
            expect(Subscription.PLANS.monthly.price).toBe(5000);
            expect(Subscription.PLANS.monthly.days).toBe(30);
        });

        test('should have correct quarterly pricing', () => {
            expect(Subscription.PLANS.quarterly.price).toBe(12000);
            expect(Subscription.PLANS.quarterly.days).toBe(90);
        });

        test('should have correct yearly pricing', () => {
            expect(Subscription.PLANS.yearly.price).toBe(15000);
            expect(Subscription.PLANS.yearly.days).toBe(365);
        });
    });
});
