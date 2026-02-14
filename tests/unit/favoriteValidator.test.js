/**
 * Favorite Validator Unit Tests
 * Tests for favorite validation rules
 */

const { addFavoriteValidation, favoriteProviderIdValidation } = require('../../src/validators/favoriteValidator');
const { validationResult } = require('express-validator');

describe('Favorite Validator', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            body: {},
            params: {}
        };
        mockRes = {};
        mockNext = jest.fn();
    });

    describe('addFavoriteValidation', () => {
        it('should pass validation with valid providerId', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000'
            };

            for (const validator of addFavoriteValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with missing providerId', async () => {
            mockReq.body = {};

            for (const validator of addFavoriteValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.param === 'providerId' && error.msg === 'L\'ID du prestataire est requis')).toBe(true);
        });

        it('should fail validation with invalid providerId', async () => {
            mockReq.body = {
                providerId: 'invalid-uuid'
            };

            for (const validator of addFavoriteValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.param === 'providerId' && error.msg === 'ID prestataire invalide')).toBe(true);
        });
    });

    describe('favoriteProviderIdValidation', () => {
        it('should pass validation with valid providerId param', async () => {
            mockReq.params = {
                providerId: '123e4567-e89b-12d3-a456-426614174000'
            };

            for (const validator of favoriteProviderIdValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with invalid providerId param', async () => {
            mockReq.params = {
                providerId: 'not-a-valid-uuid'
            };

            for (const validator of favoriteProviderIdValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.param === 'providerId' && error.msg === 'ID prestataire invalide')).toBe(true);
        });
    });
});
