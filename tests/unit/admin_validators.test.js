const {
    updateUserStatusValidation,
    verifyProviderValidation,
    featureProviderValidation,
    updateReviewVisibilityValidation
} = require('../../src/validators/adminValidator');
const { validationResult } = require('express-validator');

// Helper to run validation
const runValidation = async (req, validations) => {
    for (let validation of validations) {
        await validation.run(req);
    }
    return validationResult(req);
};

describe('Admin Validators', () => {
    describe('updateUserStatusValidation', () => {
        it('should pass for valid input', async () => {
            const req = {
                params: { id: 'e86b0260-0a35-4303-9993-470295834214' },
                body: { isActive: true }
            };
            const result = await runValidation(req, updateUserStatusValidation);
            expect(result.isEmpty()).toBe(true);
        });

        it('should fail for invalid UUID', async () => {
            const req = {
                params: { id: 'invalid-uuid' },
                body: { isActive: true }
            };
            const result = await runValidation(req, updateUserStatusValidation);
            expect(result.isEmpty()).toBe(false);
            expect(result.array()[0].msg).toBe('ID utilisateur invalide');
        });

        it('should fail for non-boolean isActive', async () => {
            const req = {
                params: { id: 'e86b0260-0a35-4303-9993-470295834214' },
                body: { isActive: 'yes' }
            };
            const result = await runValidation(req, updateUserStatusValidation);
            expect(result.isEmpty()).toBe(false);
            expect(result.array()[0].msg).toBe('isActive doit être un booléen');
        });
    });

    describe('verifyProviderValidation', () => {
        it('should fail for invalid UUID', async () => {
            const req = {
                params: { id: 'wrong' },
                body: { isVerified: true }
            };
            const result = await runValidation(req, verifyProviderValidation);
            expect(result.isEmpty()).toBe(false);
        });
    });

    describe('featureProviderValidation', () => {
        it('should fail for invalid isFeatured', async () => {
            const req = {
                params: { id: 'e86b0260-0a35-4303-9993-470295834214' },
                body: { isFeatured: 'not-bool' }
            };
            const result = await runValidation(req, featureProviderValidation);
            expect(result.isEmpty()).toBe(false);
        });
    });

    describe('updateReviewVisibilityValidation', () => {
        it('should pass for valid input', async () => {
            const req = {
                params: { id: 'e86b0260-0a35-4303-9993-470295834214' },
                body: { isVisible: false }
            };
            const result = await runValidation(req, updateReviewVisibilityValidation);
            expect(result.isEmpty()).toBe(true);
        });
    });
});
