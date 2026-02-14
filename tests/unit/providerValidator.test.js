/**
 * Provider Validator Unit Tests
 * Tests for provider validation rules
 */

const { providerIdValidation, createProviderValidation, updateProviderValidation, deletePhotoValidation } = require('../../src/validators/providerValidator');
const { validationResult } = require('express-validator');

describe('Provider Validator', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            body: {},
            params: {}
        };
        mockRes = {};
        mockNext = jest.fn();
    });

    describe('providerIdValidation', () => {
        it('should pass validation with valid provider ID', async () => {
            mockReq.params = {
                id: '123e4567-e89b-12d3-a456-426614174000'
            };

            for (const validator of providerIdValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with invalid provider ID', async () => {
            mockReq.params = {
                id: 'invalid-uuid'
            };

            for (const validator of providerIdValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'id' && error.msg === 'ID prestataire invalide')).toBe(true);
        });
    });

    describe('createProviderValidation', () => {
        it('should pass validation with valid provider data', async () => {
            mockReq.body = {
                businessName: 'Test Business',
                description: 'This is a sufficiently long description for the provider that meets the minimum requirements for validation.',
                location: 'Douala',
                address: '123 Test Street',
                whatsapp: '+237699123456',
                facebook: 'https://facebook.com/test',
                instagram: 'test_business'
            };

            for (const validator of createProviderValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with missing businessName', async () => {
            mockReq.body = {
                description: 'Valid description here',
                location: 'Douala'
            };

            for (const validator of createProviderValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'businessName' && error.msg === 'Le nom de l\'entreprise est requis')).toBe(true);
        });

        it('should fail validation with businessName too short', async () => {
            mockReq.body = {
                businessName: 'A',
                description: 'Valid description here',
                location: 'Douala'
            };

            for (const validator of createProviderValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'businessName' && error.msg === 'Le nom doit contenir entre 2 et 200 caractères')).toBe(true);
        });

        it('should fail validation with missing description', async () => {
            mockReq.body = {
                businessName: 'Test Business',
                location: 'Douala'
            };

            for (const validator of createProviderValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'description' && error.msg === 'La description est requise')).toBe(true);
        });

        it('should fail validation with description too short', async () => {
            mockReq.body = {
                businessName: 'Test Business',
                description: 'Short',
                location: 'Douala'
            };

            for (const validator of createProviderValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'description' && error.msg === 'La description doit contenir entre 50 et 5000 caractères')).toBe(true);
        });

        it('should fail validation with missing location', async () => {
            mockReq.body = {
                businessName: 'Test Business',
                description: 'Valid description here with enough characters to pass validation requirements.'
            };

            for (const validator of createProviderValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'location' && error.msg === 'La localisation est requise')).toBe(true);
        });

        it('should fail validation with invalid WhatsApp', async () => {
            mockReq.body = {
                businessName: 'Test Business',
                description: 'Valid description here with enough characters to pass validation requirements.',
                location: 'Douala',
                whatsapp: 'invalid-phone'
            };

            for (const validator of createProviderValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'whatsapp' && error.msg === 'Numéro WhatsApp invalide')).toBe(true);
        });

        it('should fail validation with invalid Facebook URL', async () => {
            mockReq.body = {
                businessName: 'Test Business',
                description: 'Valid description here with enough characters to pass validation requirements.',
                location: 'Douala',
                facebook: 'not-a-url'
            };

            for (const validator of createProviderValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'facebook' && error.msg === 'URL Facebook invalide')).toBe(true);
        });
    });

    describe('updateProviderValidation', () => {
        it('should pass validation with valid update data', async () => {
            mockReq.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
            mockReq.body = {
                businessName: 'Updated Business',
                location: 'Yaoundé'
            };

            for (const validator of updateProviderValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with invalid ID param', async () => {
            mockReq.params = { id: 'invalid-id' };
            mockReq.body = {
                businessName: 'Updated Business'
            };

            for (const validator of updateProviderValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'id' && error.msg === 'ID prestataire invalide')).toBe(true);
        });
    });

    describe('deletePhotoValidation', () => {
        it('should pass validation with valid params', async () => {
            mockReq.params = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                photoIndex: '2'
            };

            for (const validator of deletePhotoValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with invalid photoIndex', async () => {
            mockReq.params = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                photoIndex: '15'
            };

            for (const validator of deletePhotoValidation) {
                await validator(mockReq, mockRes, mockNext);
            }

            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(error => error.path === 'photoIndex' && error.msg === 'Index de photo invalide')).toBe(true);
        });
    });
});
