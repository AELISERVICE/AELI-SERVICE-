/**
 * Payment Validator Unit Tests
 */
const { validationResult } = require('express-validator');

const {
    initializePaymentValidation,
    webhookValidation,
    checkPaymentStatusValidation,
    paymentHistoryValidation
} = require('../../src/validators/paymentValidator');

/** Helper: run an array of express-validator chains against a fake request */
const runValidation = async (validations, reqData) => {
    const req = {
        body: reqData.body || {},
        query: reqData.query || {},
        params: reqData.params || {}
    };
    for (const validation of validations) {
        await validation.run(req);
    }
    return validationResult(req);
};

describe('Payment Validator', () => {
    describe('initializePaymentValidation', () => {
        it('should pass with valid data', async () => {
            const result = await runValidation(initializePaymentValidation, {
                body: { amount: 500, type: 'subscription' }
            });
            expect(result.isEmpty()).toBe(true);
        });

        it('should fail when amount is missing', async () => {
            const result = await runValidation(initializePaymentValidation, {
                body: { type: 'subscription' }
            });
            expect(result.isEmpty()).toBe(false);
            const errors = result.array();
            expect(errors.some(e => e.path === 'amount')).toBe(true);
        });

        it('should fail when amount is below minimum (100)', async () => {
            const result = await runValidation(initializePaymentValidation, {
                body: { amount: 50, type: 'subscription' }
            });
            expect(result.isEmpty()).toBe(false);
        });

        it('should fail when amount is not a multiple of 5', async () => {
            const result = await runValidation(initializePaymentValidation, {
                body: { amount: 101, type: 'subscription' }
            });
            expect(result.isEmpty()).toBe(false);
            expect(result.array().some(e => e.msg.includes('multiple de 5'))).toBe(true);
        });

        it('should fail when type is invalid', async () => {
            const result = await runValidation(initializePaymentValidation, {
                body: { amount: 500, type: 'invalid_type' }
            });
            expect(result.isEmpty()).toBe(false);
            expect(result.array().some(e => e.path === 'type')).toBe(true);
        });

        it('should accept all valid payment types', async () => {
            const validTypes = ['contact_premium', 'featured', 'boost', 'subscription'];
            for (const type of validTypes) {
                const result = await runValidation(initializePaymentValidation, {
                    body: { amount: 500, type }
                });
                expect(result.isEmpty()).toBe(true);
            }
        });

        it('should fail when providerId is not a valid UUID', async () => {
            const result = await runValidation(initializePaymentValidation, {
                body: { amount: 500, type: 'subscription', providerId: 'not-a-uuid' }
            });
            expect(result.isEmpty()).toBe(false);
            expect(result.array().some(e => e.path === 'providerId')).toBe(true);
        });

        it('should pass when providerId is a valid UUID', async () => {
            const result = await runValidation(initializePaymentValidation, {
                body: {
                    amount: 500,
                    type: 'subscription',
                    providerId: '550e8400-e29b-41d4-a716-446655440000'
                }
            });
            expect(result.isEmpty()).toBe(true);
        });

        it('should fail when description exceeds 255 characters', async () => {
            const result = await runValidation(initializePaymentValidation, {
                body: { amount: 500, type: 'subscription', description: 'a'.repeat(256) }
            });
            expect(result.isEmpty()).toBe(false);
            expect(result.array().some(e => e.path === 'description')).toBe(true);
        });
    });

    describe('webhookValidation', () => {
        it('should pass with valid webhook data', async () => {
            const result = await runValidation(webhookValidation, {
                body: { cpm_trans_id: 'TXN123', cpm_site_id: 'SITE001' }
            });
            expect(result.isEmpty()).toBe(true);
        });

        it('should fail when cpm_trans_id is missing', async () => {
            const result = await runValidation(webhookValidation, {
                body: { cpm_site_id: 'SITE001' }
            });
            expect(result.isEmpty()).toBe(false);
            expect(result.array().some(e => e.path === 'cpm_trans_id')).toBe(true);
        });

        it('should fail when cpm_site_id is missing', async () => {
            const result = await runValidation(webhookValidation, {
                body: { cpm_trans_id: 'TXN123' }
            });
            expect(result.isEmpty()).toBe(false);
        });

        it('should fail with invalid currency', async () => {
            const result = await runValidation(webhookValidation, {
                body: { cpm_trans_id: 'TXN123', cpm_site_id: 'SITE001', cpm_currency: 'EUR' }
            });
            expect(result.isEmpty()).toBe(false);
            expect(result.array().some(e => e.path === 'cpm_currency')).toBe(true);
        });

        it('should accept valid currencies', async () => {
            const currencies = ['XAF', 'XOF', 'CDF', 'GNF', 'USD'];
            for (const currency of currencies) {
                const result = await runValidation(webhookValidation, {
                    body: { cpm_trans_id: 'TXN123', cpm_site_id: 'SITE001', cpm_currency: currency }
                });
                expect(result.isEmpty()).toBe(true);
            }
        });
    });

    describe('checkPaymentStatusValidation', () => {
        it('should pass with valid transaction ID', async () => {
            const result = await runValidation(checkPaymentStatusValidation, {
                params: { transactionId: 'AELI1234567890' }
            });
            expect(result.isEmpty()).toBe(true);
        });

        it('should fail with empty transaction ID', async () => {
            const result = await runValidation(checkPaymentStatusValidation, {
                params: { transactionId: '' }
            });
            expect(result.isEmpty()).toBe(false);
        });

        it('should fail with too short transaction ID (< 10 chars)', async () => {
            const result = await runValidation(checkPaymentStatusValidation, {
                params: { transactionId: 'abc123' }
            });
            expect(result.isEmpty()).toBe(false);
        });
    });

    describe('paymentHistoryValidation', () => {
        it('should pass with no query params', async () => {
            const result = await runValidation(paymentHistoryValidation, { query: {} });
            expect(result.isEmpty()).toBe(true);
        });

        it('should pass with valid query params', async () => {
            const result = await runValidation(paymentHistoryValidation, {
                query: { page: '1', limit: '10', status: 'ACCEPTED', type: 'subscription' }
            });
            expect(result.isEmpty()).toBe(true);
        });

        it('should fail with invalid status', async () => {
            const result = await runValidation(paymentHistoryValidation, {
                query: { status: 'COMPLETED' }
            });
            expect(result.isEmpty()).toBe(false);
        });

        it('should fail with invalid type', async () => {
            const result = await runValidation(paymentHistoryValidation, {
                query: { type: 'unknown' }
            });
            expect(result.isEmpty()).toBe(false);
        });

        it('should accept all valid statuses', async () => {
            const statuses = ['PENDING', 'WAITING_CUSTOMER', 'ACCEPTED', 'REFUSED', 'CANCELLED', 'EXPIRED'];
            for (const status of statuses) {
                const result = await runValidation(paymentHistoryValidation, { query: { status } });
                expect(result.isEmpty()).toBe(true);
            }
        });
    });
});
