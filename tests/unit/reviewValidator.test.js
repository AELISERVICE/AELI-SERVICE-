/**
 * Review Validator Unit Tests
 * Tests for review validation rules
 */

const { createReviewValidation, updateReviewValidation, reviewIdValidation } = require('../../src/validators/reviewValidator');
const { validationResult } = require('express-validator');

describe('Review Validator', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            body: {},
            params: {}
        };
        mockRes = {};
        mockNext = jest.fn();
    });

    describe('createReviewValidation', () => {
        it('should pass validation with valid review data', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                rating: 4,
                comment: 'Great service and friendly staff!'
            };

            for (const validator of createReviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should pass validation without comment', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                rating: 5
            };

            for (const validator of createReviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with missing providerId', async () => {
            mockReq.body = {
                rating: 4,
                comment: 'Good service'
            };

            for (const validator of createReviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'providerId' && error.msg === 'L\'ID du prestataire est requis')).toBe(true);
        });

        it('should fail validation with invalid providerId', async () => {
            mockReq.body = {
                providerId: 'invalid-uuid',
                rating: 4
            };

            for (const validator of createReviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'providerId' && error.msg === 'ID prestataire invalide')).toBe(true);
        });

        it('should fail validation with missing rating', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                comment: 'Good service'
            };

            for (const validator of createReviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'rating' && error.msg === 'La note doit être entre 1 et 5')).toBe(true);
        });

        it('should fail validation with rating too low', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                rating: 0
            };

            for (const validator of createReviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'rating' && error.msg === 'La note doit être entre 1 et 5')).toBe(true);
        });

        it('should fail validation with rating too high', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                rating: 6
            };

            for (const validator of createReviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'rating' && error.msg === 'La note doit être entre 1 et 5')).toBe(true);
        });

        it('should fail validation with comment too long', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                rating: 4,
                comment: 'a'.repeat(1001)
            };

            for (const validator of createReviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'comment' && error.msg === 'Le commentaire ne peut pas dépasser 1000 caractères')).toBe(true);
        });
    });

    describe('updateReviewValidation', () => {
        it('should pass validation with valid update data', async () => {
            mockReq.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
            mockReq.body = {
                rating: 4,
                comment: 'Updated review'
            };

            for (const validator of updateReviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should pass validation with only rating update', async () => {
            mockReq.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
            mockReq.body = {
                rating: 3
            };

            for (const validator of updateReviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with invalid review ID', async () => {
            mockReq.params = { id: 'invalid-id' };
            mockReq.body = {
                rating: 4
            };

            for (const validator of updateReviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'id' && error.msg === 'ID avis invalide')).toBe(true);
        });

        it('should fail validation with invalid rating', async () => {
            mockReq.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
            mockReq.body = {
                rating: 10
            };

            for (const validator of updateReviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'rating' && error.msg === 'La note doit être entre 1 et 5')).toBe(true);
        });
    });

    describe('reviewIdValidation', () => {
        it('should pass validation with valid review ID', async () => {
            mockReq.params = {
                id: '123e4567-e89b-12d3-a456-426614174000'
            };

            for (const validator of reviewIdValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with invalid review ID', async () => {
            mockReq.params = {
                id: 'not-a-uuid'
            };

            for (const validator of reviewIdValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'id' && error.msg === 'ID avis invalide')).toBe(true);
        });
    });
});
