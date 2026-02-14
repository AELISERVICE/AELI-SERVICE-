/**
 * Contact Validator Unit Tests
 * Tests for contact form validation rules
 */

const { contactValidation, reviewValidation, favoriteValidation } = require('../../src/validators/contactValidator');
const { validationResult } = require('express-validator');

describe('Contact Validator', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            body: {}
        };
        mockRes = {};
        mockNext = jest.fn();
    });

    describe('contactValidation', () => {
        it('should pass validation with valid data', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                message: 'This is a valid message with enough characters to pass validation.',
                senderName: 'John Doe',
                senderEmail: 'john@example.com',
                senderPhone: '+237699123456'
            };

            // Run all validators
            for (const validator of contactValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with missing providerId', async () => {
            mockReq.body = {
                message: 'Valid message',
                senderName: 'John Doe',
                senderEmail: 'john@example.com'
            };

            for (const validator of contactValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        param: 'providerId',
                        msg: 'L\'ID du prestataire est requis'
                    })
                ])
            );
        });

        it('should fail validation with invalid providerId', async () => {
            mockReq.body = {
                providerId: 'invalid-uuid',
                message: 'Valid message',
                senderName: 'John Doe',
                senderEmail: 'john@example.com'
            };

            for (const validator of contactValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        param: 'providerId',
                        msg: 'ID invalide'
                    })
                ])
            );
        });

        it('should fail validation with empty message', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                message: '',
                senderName: 'John Doe',
                senderEmail: 'john@example.com'
            };

            for (const validator of contactValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        param: 'message',
                        msg: 'Le message est requis'
                    })
                ])
            );
        });

        it('should fail validation with message too short', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                message: 'Short',
                senderName: 'John Doe',
                senderEmail: 'john@example.com'
            };

            for (const validator of contactValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        param: 'message',
                        msg: 'Le message doit contenir entre 10 et 2000 caractères'
                    })
                ])
            );
        });

        it('should fail validation with missing senderName', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                message: 'Valid message content here',
                senderEmail: 'john@example.com'
            };

            for (const validator of contactValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        param: 'senderName',
                        msg: 'Votre nom est requis'
                    })
                ])
            );
        });

        it('should fail validation with invalid email', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                message: 'Valid message content here',
                senderName: 'John Doe',
                senderEmail: 'invalid-email'
            };

            for (const validator of contactValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        param: 'senderEmail',
                        msg: 'Veuillez fournir un email valide'
                    })
                ])
            );
        });
    });

    describe('reviewValidation', () => {
        it('should pass validation with valid review data', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                rating: 4,
                comment: 'Great service!'
            };

            for (const validator of reviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with invalid rating', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                rating: 6,
                comment: 'Great service!'
            };

            for (const validator of reviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        param: 'rating',
                        msg: 'La note doit être entre 1 et 5'
                    })
                ])
            );
        });

        it('should fail validation with comment too long', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                rating: 4,
                comment: 'a'.repeat(1001)
            };

            for (const validator of reviewValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        param: 'comment',
                        msg: 'Le commentaire ne peut pas dépasser 1000 caractères'
                    })
                ])
            );
        });
    });

    describe('favoriteValidation', () => {
        it('should pass validation with valid providerId', async () => {
            mockReq.body = {
                providerId: '123e4567-e89b-12d3-a456-426614174000'
            };

            for (const validator of favoriteValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with missing providerId', async () => {
            mockReq.body = {};

            for (const validator of favoriteValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        param: 'providerId',
                        msg: 'L\'ID du prestataire est requis'
                    })
                ])
            );
        });

        it('should fail validation with invalid providerId', async () => {
            mockReq.body = {
                providerId: 'not-a-uuid'
            };

            for (const validator of favoriteValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        param: 'providerId',
                        msg: 'ID invalide'
                    })
                ])
            );
        });
    });
});
