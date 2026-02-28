/**
 * Subscription Validator Unit Tests
 */
const { validationResult } = require('express-validator');

const {
    renewSubscriptionValidation,
    providerIdValidation,
    subscriptionStatusValidation,
    cancelSubscriptionValidation,
    VALID_PLANS
} = require('../../src/validators/subscriptionValidator');

const runValidation = async (validations, reqData) => {
    const req = {
        body: reqData.body || {},
        params: reqData.params || {},
        query: reqData.query || {}
    };
    for (const validation of validations) {
        await validation.run(req);
    }
    return validationResult(req);
};

describe('Subscription Validator', () => {
    describe('VALID_PLANS constant', () => {
        it('should export the correct plans', () => {
            expect(VALID_PLANS).toEqual(['monthly', 'quarterly', 'yearly']);
        });
    });

    describe('renewSubscriptionValidation', () => {
        it('should pass with valid monthly plan', async () => {
            const result = await runValidation(renewSubscriptionValidation, {
                body: { plan: 'monthly' }
            });
            expect(result.isEmpty()).toBe(true);
        });

        it('should pass with all valid plans', async () => {
            for (const plan of VALID_PLANS) {
                const result = await runValidation(renewSubscriptionValidation, {
                    body: { plan }
                });
                expect(result.isEmpty()).toBe(true);
            }
        });

        it('should fail when plan is missing', async () => {
            const result = await runValidation(renewSubscriptionValidation, {
                body: {}
            });
            expect(result.isEmpty()).toBe(false);
            expect(result.array().some(e => e.path === 'plan')).toBe(true);
        });

        it('should fail with invalid plan name', async () => {
            const result = await runValidation(renewSubscriptionValidation, {
                body: { plan: 'weekly' }
            });
            expect(result.isEmpty()).toBe(false);
            expect(result.array().some(e => e.path === 'plan')).toBe(true);
        });

        it('should pass with valid optional paymentId UUID', async () => {
            const result = await runValidation(renewSubscriptionValidation, {
                body: { plan: 'monthly', paymentId: '550e8400-e29b-41d4-a716-446655440000' }
            });
            expect(result.isEmpty()).toBe(true);
        });

        it('should fail when paymentId is not a UUID', async () => {
            const result = await runValidation(renewSubscriptionValidation, {
                body: { plan: 'monthly', paymentId: 'not-a-uuid' }
            });
            expect(result.isEmpty()).toBe(false);
            expect(result.array().some(e => e.path === 'paymentId')).toBe(true);
        });
    });

    describe('providerIdValidation', () => {
        it('should pass with valid UUID', async () => {
            const result = await runValidation(providerIdValidation, {
                params: { providerId: '550e8400-e29b-41d4-a716-446655440000' }
            });
            expect(result.isEmpty()).toBe(true);
        });

        it('should pass with no providerId (optional)', async () => {
            const result = await runValidation(providerIdValidation, { params: {} });
            expect(result.isEmpty()).toBe(true);
        });

        it('should fail with invalid UUID format', async () => {
            const result = await runValidation(providerIdValidation, {
                params: { providerId: 'not-a-uuid' }
            });
            expect(result.isEmpty()).toBe(false);
        });
    });

    describe('subscriptionStatusValidation', () => {
        it('should pass with valid provider UUID', async () => {
            const result = await runValidation(subscriptionStatusValidation, {
                params: { providerId: '550e8400-e29b-41d4-a716-446655440000' }
            });
            expect(result.isEmpty()).toBe(true);
        });

        it('should fail when providerId is missing', async () => {
            const result = await runValidation(subscriptionStatusValidation, {
                params: {}
            });
            expect(result.isEmpty()).toBe(false);
        });

        it('should fail when providerId is not a UUID', async () => {
            const result = await runValidation(subscriptionStatusValidation, {
                params: { providerId: 'invalid' }
            });
            expect(result.isEmpty()).toBe(false);
        });
    });

    describe('cancelSubscriptionValidation', () => {
        it('should pass with no reason (optional)', async () => {
            const result = await runValidation(cancelSubscriptionValidation, { body: {} });
            expect(result.isEmpty()).toBe(true);
        });

        it('should pass with a valid reason', async () => {
            const result = await runValidation(cancelSubscriptionValidation, {
                body: { reason: 'Je ne veux plus m\'abonner.' }
            });
            expect(result.isEmpty()).toBe(true);
        });

        it('should fail when reason exceeds 500 chars', async () => {
            const result = await runValidation(cancelSubscriptionValidation, {
                body: { reason: 'a'.repeat(501) }
            });
            expect(result.isEmpty()).toBe(false);
            expect(result.array().some(e => e.path === 'reason')).toBe(true);
        });
    });
});
