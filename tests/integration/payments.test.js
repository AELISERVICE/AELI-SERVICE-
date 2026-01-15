/**
 * Integration Tests for Payments
 * Tests payment initialization, status check, and history
 */

const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Provider, Payment, Subscription } = require('../../src/models');

// Mock CinetPay API calls (don't make real payments in tests)
jest.mock('axios', () => ({
    post: jest.fn().mockImplementation((url) => {
        if (url.includes('payment')) {
            return Promise.resolve({
                data: {
                    code: '201',
                    message: 'Success',
                    data: {
                        payment_token: 'test-payment-token-123',
                        payment_url: 'https://payment.test.com/pay/123'
                    }
                }
            });
        }
        if (url.includes('check')) {
            return Promise.resolve({
                data: {
                    code: '00',
                    message: 'Success',
                    data: {
                        status: 'WAITING_FOR_CUSTOMER',
                        payment_method: null
                    }
                }
            });
        }
        return Promise.reject(new Error('Unknown endpoint'));
    })
}));

describe('Payments Integration Tests', () => {
    let testUser;
    let testProvider;
    let authToken;

    beforeAll(async () => {
        await sequelize.sync({ alter: true });
    });

    beforeEach(async () => {
        // Create test user
        const timestamp = Date.now();
        testUser = await User.create({
            email: `payment_test_${timestamp}@test.com`,
            password: 'TestPassword123!',
            firstName: 'PayTest',
            lastName: 'User',
            role: 'provider',
            isEmailVerified: true,
            isActive: true
        });

        // Create provider profile
        testProvider = await Provider.create({
            userId: testUser.id,
            businessName: `Payment Test Business ${timestamp}`,
            description: 'A test business for payment testing. This description must be at least 50 characters long.',
            location: 'Yaoundé',
            isVerified: true
        });

        // Create subscription
        await Subscription.createTrial(testProvider.id);

        // Login to get token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'TestPassword123!'
            });

        authToken = loginRes.body.accessToken;
    });

    afterEach(async () => {
        // Cleanup
        await Payment.destroy({ where: { userId: testUser?.id } });
        await Subscription.destroy({ where: { providerId: testProvider?.id } });
        await Provider.destroy({ where: { id: testProvider?.id } });
        await User.destroy({ where: { id: testUser?.id } });
    });

    describe('Payment Model Methods', () => {
        describe('Payment.generateTransactionId()', () => {
            test('should generate unique transaction IDs', () => {
                const id1 = Payment.generateTransactionId();
                const id2 = Payment.generateTransactionId();

                expect(id1).not.toBe(id2);
            });

            test('should start with AELI prefix', () => {
                const id = Payment.generateTransactionId();
                expect(id.startsWith('AELI')).toBe(true);
            });

            test('should contain timestamp', () => {
                const before = Date.now();
                const id = Payment.generateTransactionId();
                const after = Date.now();

                // Extract timestamp portion (after AELI prefix)
                const timestampPortion = id.substring(4, 17);
                const timestamp = parseInt(timestampPortion);

                expect(timestamp).toBeGreaterThanOrEqual(before);
                expect(timestamp).toBeLessThanOrEqual(after);
            });
        });

        describe('Payment.findByTransactionId()', () => {
            test('should find existing payment', async () => {
                const payment = await Payment.create({
                    transactionId: 'TEST123456',
                    userId: testUser.id,
                    providerId: testProvider.id,
                    type: 'subscription',
                    amount: 5000,
                    currency: 'XAF',
                    status: 'PENDING'
                });

                const found = await Payment.findByTransactionId('TEST123456');

                expect(found).toBeDefined();
                expect(found.id).toBe(payment.id);
            });

            test('should return null for non-existent transaction', async () => {
                const found = await Payment.findByTransactionId('NONEXISTENT');
                expect(found).toBeNull();
            });
        });

        describe('Payment.prototype.updateFromCinetPay()', () => {
            test('should update payment from CinetPay response', async () => {
                const payment = await Payment.create({
                    transactionId: 'CINETPAY_TEST_1',
                    userId: testUser.id,
                    type: 'subscription',
                    amount: 5000,
                    currency: 'XAF',
                    status: 'PENDING'
                });

                await payment.updateFromCinetPay({
                    status: 'ACCEPTED',
                    payment_method: 'MOMO',
                    operator_id: 'OP123456',
                    payment_date: new Date().toISOString()
                });

                expect(payment.status).toBe('ACCEPTED');
                expect(payment.paymentMethod).toBe('MOMO');
                expect(payment.operatorId).toBe('OP123456');
                expect(payment.paidAt).toBeDefined();
            });

            test('should handle fund availability date', async () => {
                const payment = await Payment.create({
                    transactionId: 'CINETPAY_TEST_2',
                    userId: testUser.id,
                    type: 'boost',
                    amount: 1000,
                    currency: 'XAF',
                    status: 'PENDING'
                });

                const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
                await payment.updateFromCinetPay({
                    status: 'ACCEPTED',
                    fund_availability_date: futureDate.toISOString()
                });

                expect(payment.fundAvailabilityDate).toBeDefined();
            });
        });
    });

    describe('Payment Validation', () => {
        test('should reject amount less than 100', async () => {
            await expect(
                Payment.create({
                    transactionId: 'INVALID_AMOUNT_1',
                    userId: testUser.id,
                    type: 'subscription',
                    amount: 50, // Too low
                    currency: 'XAF'
                })
            ).rejects.toThrow();
        });

        test('should reject amount not multiple of 5', async () => {
            await expect(
                Payment.create({
                    transactionId: 'INVALID_AMOUNT_2',
                    userId: testUser.id,
                    type: 'subscription',
                    amount: 103, // Not multiple of 5
                    currency: 'XAF'
                })
            ).rejects.toThrow();
        });

        test('should accept valid amount', async () => {
            const payment = await Payment.create({
                transactionId: 'VALID_AMOUNT_1',
                userId: testUser.id,
                type: 'subscription',
                amount: 5000,
                currency: 'XAF'
            });

            expect(payment.id).toBeDefined();
            expect(payment.amount).toBe(5000);
        });
    });

    describe('GET /api/payments/history', () => {
        beforeEach(async () => {
            // Create some test payments
            await Payment.bulkCreate([
                {
                    transactionId: `HISTORY_1_${Date.now()}`,
                    userId: testUser.id,
                    type: 'subscription',
                    amount: 5000,
                    currency: 'XAF',
                    status: 'ACCEPTED',
                    paidAt: new Date()
                },
                {
                    transactionId: `HISTORY_2_${Date.now()}`,
                    userId: testUser.id,
                    type: 'boost',
                    amount: 1000,
                    currency: 'XAF',
                    status: 'PENDING'
                }
            ]);
        });

        test('should return user payment history (authenticated)', async () => {
            const res = await request(app)
                .get('/api/payments/history')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.payments).toBeDefined();
            expect(Array.isArray(res.body.payments)).toBe(true);
            expect(res.body.payments.length).toBeGreaterThanOrEqual(2);
        });

        test('should return 401 for unauthenticated request', async () => {
            await request(app)
                .get('/api/payments/history')
                .expect(401);
        });

        test('should support pagination', async () => {
            const res = await request(app)
                .get('/api/payments/history?page=1&limit=1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.pagination).toBeDefined();
            expect(res.body.pagination.currentPage).toBe(1);
            expect(res.body.pagination.limit).toBe(1);
        });
    });

    describe('Payment Types', () => {
        test('should support subscription type', async () => {
            const payment = await Payment.create({
                transactionId: `TYPE_SUB_${Date.now()}`,
                userId: testUser.id,
                type: 'subscription',
                amount: 5000,
                currency: 'XAF'
            });
            expect(payment.type).toBe('subscription');
        });

        test('should support featured type', async () => {
            const payment = await Payment.create({
                transactionId: `TYPE_FEAT_${Date.now()}`,
                userId: testUser.id,
                type: 'featured',
                amount: 10000,
                currency: 'XAF'
            });
            expect(payment.type).toBe('featured');
        });

        test('should support boost type', async () => {
            const payment = await Payment.create({
                transactionId: `TYPE_BOOST_${Date.now()}`,
                userId: testUser.id,
                type: 'boost',
                amount: 2000,
                currency: 'XAF'
            });
            expect(payment.type).toBe('boost');
        });

        test('should support contact_premium type', async () => {
            const payment = await Payment.create({
                transactionId: `TYPE_CONTACT_${Date.now()}`,
                userId: testUser.id,
                type: 'contact_premium',
                amount: 500,
                currency: 'XAF'
            });
            expect(payment.type).toBe('contact_premium');
        });
    });
});
