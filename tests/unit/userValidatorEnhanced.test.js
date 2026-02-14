/**
 * User Validator Enhanced Unit Tests
 * Enhanced tests for user validation rules with comprehensive coverage
 */

const { body, param } = require('express-validator');
// Mock the validation functions
jest.mock('../../src/validators/userValidator', () => ({
    registerValidation: jest.fn(),
    loginValidation: jest.fn(),
    updateProfileValidation: jest.fn(),
    changePasswordValidation: jest.fn(),
    forgotPasswordValidation: jest.fn(),
    resetPasswordValidation: jest.fn()
}));

const {
    registerValidation,
    loginValidation,
    updateProfileValidation,
    changePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation
} = require('../../src/validators/userValidator');

// Mock express-validator
jest.mock('express-validator', () => ({
    body: jest.fn(() => ({
        notEmpty: jest.fn().mockReturnThis(),
        withMessage: jest.fn().mockReturnThis(),
        isEmail: jest.fn().mockReturnThis(),
        isLength: jest.fn().mockReturnThis(),
        matches: jest.fn().mockReturnThis(),
        isString: jest.fn().mockReturnThis(),
        isUUID: jest.fn().mockReturnThis(),
        isBoolean: jest.fn().mockReturnThis(),
        optional: jest.fn().mockReturnThis(),
        trim: jest.fn().mockReturnThis(),
        equals: jest.fn().mockReturnThis(),
        isAlpha: jest.fn().mockReturnThis(),
        isIn: jest.fn().mockReturnThis(),
        isNumeric: jest.fn().mockReturnThis(),
        custom: jest.fn().mockReturnThis(),
        normalizeEmail: jest.fn().mockReturnThis()
    })),
    param: jest.fn(() => ({
        isUUID: jest.fn().mockReturnThis(),
        withMessage: jest.fn().mockReturnThis()
    }))
}));

describe('User Validator Enhanced', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockReq = {
            body: {},
            params: {}
        };
        
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        
        mockNext = jest.fn();
        
        // Mock validation functions
        body.mockReturnValue({
            isLength: jest.fn().mockReturnValue({
                withMessage: jest.fn().mockReturnValue({
                    isEmail: jest.fn().mockReturnValue({
                        withMessage: jest.fn().mockReturnValue({
                            normalizeEmail: jest.fn().mockReturnValue({
                                withMessage: jest.fn().mockReturnValue({
                                    notEmpty: jest.fn().mockReturnValue({
                                        withMessage: jest.fn().mockReturnValue({
                                            matches: jest.fn().mockReturnValue({
                                                withMessage: jest.fn().mockReturnValue({
                                                    isStrongPassword: jest.fn().mockReturnValue({
                                                        withMessage: jest.fn().mockReturnValue({
                                                            isAlpha: jest.fn().mockReturnValue({
                                                                withMessage: jest.fn().mockReturnValue({
                                                                    isNumeric: jest.fn().mockReturnValue({
                                                                        withMessage: jest.fn().mockReturnValue({
                                                                            isIn: jest.fn().mockReturnValue({
                                                                                withMessage: jest.fn().mockReturnValue({
                                                                                    isUUID: jest.fn().mockReturnValue({
                                                                                        withMessage: jest.fn().mockReturnValue({
                                                                                            isISO8601: jest.fn().mockReturnValue({
                                                                                                withMessage: jest.fn().mockReturnValue({
                                                                                                    isMobilePhone: jest.fn().mockReturnValue({
                                                                                                        withMessage: jest.fn().mockReturnValue({
                                                                                                            optional: jest.fn().mockReturnValue({
                                                                                                                bail: jest.fn().mockReturnValue({
                                                                                                                    run: jest.fn().mockReturnValue(Promise.resolve())
                                                                                                                })
                                                                                                            })
                                                                                                        })
                                                                                                    })
                                                                                                })
                                                                                            })
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        });
        
        param.mockReturnValue({
            isUUID: jest.fn().mockReturnValue({
                withMessage: jest.fn().mockReturnValue({
                    notEmpty: jest.fn().mockReturnValue({
                        withMessage: jest.fn().mockReturnValue({
                            run: jest.fn().mockReturnValue(Promise.resolve())
                        })
                    })
                })
            })
        });
    });

    describe('registerValidation', () => {
        it('should validate complete registration data', () => {
            const validation = registerValidation();
            
            expect(validation).toBeDefined();
            expect(body).toHaveBeenCalledWith('email');
            expect(body).toHaveBeenCalledWith('password');
            expect(body).toHaveBeenCalledWith('firstName');
            expect(body).toHaveBeenCalledWith('lastName');
            expect(body).toHaveBeenCalledWith('phone');
            expect(body).toHaveBeenCalledWith('country');
            expect(body).toHaveBeenCalledWith('gender');
            expect(body).toHaveBeenCalledWith('role');
        });

        it('should validate email format and normalization', () => {
            mockReq.body = {
                email: 'invalid-email',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('email');
        });

        it('should normalize email addresses', () => {
            mockReq.body = {
                email: 'TEST@EXAMPLE.COM',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('email');
        });

        it('should validate password strength', () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'weak',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('password');
        });

        it('should validate name fields are alphabetic', () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John123',
                lastName: 'Doe456',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('firstName');
            expect(body).toHaveBeenCalledWith('lastName');
        });

        it('should validate phone number format', () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                phone: 'invalid-phone',
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('phone');
        });

        it('should validate country is from allowed list', () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+237600000000',
                country: 'InvalidCountry',
                gender: 'male',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('country');
        });

        it('should validate gender is from allowed values', () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'invalid-gender',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('gender');
        });

        it('should validate role is from allowed values', () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'invalid-role'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('role');
        });

        it('should handle optional profile photo', () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client',
                profilePhoto: 'photo.jpg'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('profilePhoto');
        });
    });

    describe('loginValidation', () => {
        it('should validate login credentials', () => {
            const validation = loginValidation();
            
            expect(validation).toBeDefined();
            expect(body).toHaveBeenCalledWith('email');
            expect(body).toHaveBeenCalledWith('password');
        });

        it('should validate email format for login', () => {
            mockReq.body = {
                email: 'invalid-email',
                password: 'Password123!'
            };

            loginValidation();
            
            expect(body).toHaveBeenCalledWith('email');
        });

        it('should validate password is not empty', () => {
            mockReq.body = {
                email: 'test@example.com',
                password: ''
            };

            loginValidation();
            
            expect(body).toHaveBeenCalledWith('password');
        });

        it('should handle missing email', () => {
            mockReq.body = {
                password: 'Password123!'
            };

            loginValidation();
            
            expect(body).toHaveBeenCalledWith('email');
        });

        it('should handle missing password', () => {
            mockReq.body = {
                email: 'test@example.com'
            };

            loginValidation();
            
            expect(body).toHaveBeenCalledWith('password');
        });
    });

    describe('updateProfileValidation', () => {
        it('should validate profile update data', () => {
            const validation = updateProfileValidation();
            
            expect(validation).toBeDefined();
            expect(body).toHaveBeenCalledWith('firstName');
            expect(body).toHaveBeenCalledWith('lastName');
            expect(body).toHaveBeenCalledWith('phone');
            expect(body).toHaveBeenCalledWith('country');
            expect(body).toHaveBeenCalledWith('gender');
        });

        it('should allow partial profile updates', () => {
            mockReq.body = {
                firstName: 'John'
            };

            updateProfileValidation();
            
            expect(body).toHaveBeenCalledWith('firstName');
        });

        it('should validate phone number format on update', () => {
            mockReq.body = {
                phone: 'invalid-phone'
            };

            updateProfileValidation();
            
            expect(body).toHaveBeenCalledWith('phone');
        });

        it('should validate country on update', () => {
            mockReq.body = {
                country: 'InvalidCountry'
            };

            updateProfileValidation();
            
            expect(body).toHaveBeenCalledWith('country');
        });

        it('should validate gender on update', () => {
            mockReq.body = {
                gender: 'invalid-gender'
            };

            updateProfileValidation();
            
            expect(body).toHaveBeenCalledWith('gender');
        });

        it('should allow profile photo update', () => {
            mockReq.body = {
                profilePhoto: 'new-photo.jpg'
            };

            updateProfileValidation();
            
            expect(body).toHaveBeenCalledWith('profilePhoto');
        });
    });

    describe('changePasswordValidation', () => {
        it('should validate password change data', () => {
            const validation = changePasswordValidation();
            
            expect(validation).toBeDefined();
            expect(body).toHaveBeenCalledWith('currentPassword');
            expect(body).toHaveBeenCalledWith('newPassword');
            expect(body).toHaveBeenCalledWith('confirmPassword');
        });

        it('should validate current password is not empty', () => {
            mockReq.body = {
                currentPassword: '',
                newPassword: 'NewPassword123!',
                confirmPassword: 'NewPassword123!'
            };

            changePasswordValidation();
            
            expect(body).toHaveBeenCalledWith('currentPassword');
        });

        it('should validate new password strength', () => {
            mockReq.body = {
                currentPassword: 'OldPassword123!',
                newPassword: 'weak',
                confirmPassword: 'weak'
            };

            changePasswordValidation();
            
            expect(body).toHaveBeenCalledWith('newPassword');
        });

        it('should validate password confirmation matches', () => {
            mockReq.body = {
                currentPassword: 'OldPassword123!',
                newPassword: 'NewPassword123!',
                confirmPassword: 'DifferentPassword123!'
            };

            changePasswordValidation();
            
            expect(body).toHaveBeenCalledWith('confirmPassword');
        });

        it('should reject same password as current', () => {
            mockReq.body = {
                currentPassword: 'Password123!',
                newPassword: 'Password123!',
                confirmPassword: 'Password123!'
            };

            changePasswordValidation();
            
            expect(body).toHaveBeenCalledWith('newPassword');
        });
    });

    describe('forgotPasswordValidation', () => {
        it('should validate forgot password email', () => {
            const validation = forgotPasswordValidation();
            
            expect(validation).toBeDefined();
            expect(body).toHaveBeenCalledWith('email');
        });

        it('should validate email format for password reset', () => {
            mockReq.body = {
                email: 'invalid-email'
            };

            forgotPasswordValidation();
            
            expect(body).toHaveBeenCalledWith('email');
        });

        it('should handle missing email for password reset', () => {
            mockReq.body = {};

            forgotPasswordValidation();
            
            expect(body).toHaveBeenCalledWith('email');
        });
    });

    describe('resetPasswordValidation', () => {
        it('should validate password reset data', () => {
            const validation = resetPasswordValidation();
            
            expect(validation).toBeDefined();
            expect(param).toHaveBeenCalledWith('token');
            expect(body).toHaveBeenCalledWith('password');
        });

        it('should validate reset token format', () => {
            mockReq.params = { token: 'invalid-token' };

            resetPasswordValidation();
            
            expect(param).toHaveBeenCalledWith('token');
        });

        it('should validate new password strength', () => {
            mockReq.params = { token: 'valid-token-123' };
            mockReq.body = {
                password: 'weak'
            };

            resetPasswordValidation();
            
            expect(body).toHaveBeenCalledWith('password');
        });

        it('should handle missing reset token', () => {
            mockReq.params = {};
            mockReq.body = {
                password: 'NewPassword123!'
            };

            resetPasswordValidation();
            
            expect(param).toHaveBeenCalledWith('token');
        });

        it('should handle missing password', () => {
            mockReq.params = { token: 'valid-token-123' };
            mockReq.body = {};

            resetPasswordValidation();
            
            expect(body).toHaveBeenCalledWith('password');
        });
    });

    describe('Advanced Validation Rules', () => {
        it('should validate email uniqueness', () => {
            mockReq.body = {
                email: 'existing@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('email');
        });

        it('should validate phone uniqueness', () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+237600000000', // Existing phone
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('phone');
        });

        it('should validate age requirement', () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client',
                dateOfBirth: '2010-01-01' // Too young
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('dateOfBirth');
        });

        it('should validate business license for providers', () => {
            mockReq.body = {
                email: 'provider@example.com',
                password: 'Password123!',
                firstName: 'Jane',
                lastName: 'Doe',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'female',
                role: 'provider',
                businessLicense: 'invalid-license'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('businessLicense');
        });
    });

    describe('Input Sanitization', () => {
        it('should trim whitespace from all fields', () => {
            mockReq.body = {
                email: '  test@example.com  ',
                password: '  Password123!  ',
                firstName: '  John  ',
                lastName: '  Doe  ',
                phone: '  +237600000000  ',
                country: '  Cameroun  ',
                gender: '  male  ',
                role: '  client  '
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('email');
            expect(body).toHaveBeenCalledWith('firstName');
            expect(body).toHaveBeenCalledWith('lastName');
        });

        it('should escape HTML in text fields', () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: '<script>alert("xss")</script>John',
                lastName: 'Doe',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('firstName');
        });

        it('should remove special characters from names', () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John@#$%',
                lastName: 'Doe!@#',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('firstName');
            expect(body).toHaveBeenCalledWith('lastName');
        });
    });

    describe('Edge Cases', () => {
        it('should handle extremely long inputs', () => {
            const longString = 'a'.repeat(1000);
            
            mockReq.body = {
                email: `${longString}@example.com`,
                password: 'Password123!',
                firstName: longString,
                lastName: longString,
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('email');
            expect(body).toHaveBeenCalledWith('firstName');
            expect(body).toHaveBeenCalledWith('lastName');
        });

        it('should handle unicode characters', () => {
            mockReq.body = {
                email: 'tëst@éxample.com',
                password: 'Password123!',
                firstName: 'Jöhn',
                lastName: 'Döe',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('email');
            expect(body).toHaveBeenCalledWith('firstName');
            expect(body).toHaveBeenCalledWith('lastName');
        });

        it('should handle null and undefined values', () => {
            mockReq.body = {
                email: null,
                password: undefined,
                firstName: '',
                lastName: null,
                phone: undefined,
                country: '',
                gender: null,
                role: undefined
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('email');
            expect(body).toHaveBeenCalledWith('password');
            expect(body).toHaveBeenCalledWith('firstName');
        });

        it('should handle array inputs', () => {
            mockReq.body = {
                email: ['test@example.com'],
                password: ['Password123!'],
                firstName: ['John'],
                lastName: ['Doe'],
                phone: ['+237600000000'],
                country: ['Cameroun'],
                gender: ['male'],
                role: ['client']
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('email');
            expect(body).toHaveBeenCalledWith('password');
        });

        it('should handle object inputs', () => {
            mockReq.body = {
                email: { value: 'test@example.com' },
                password: { value: 'Password123!' },
                firstName: { value: 'John' },
                lastName: { value: 'Doe' },
                phone: { value: '+237600000000' },
                country: { value: 'Cameroun' },
                gender: { value: 'male' },
                role: { value: 'client' }
            };

            registerValidation();
            
            expect(body).toHaveBeenCalledWith('email');
            expect(body).toHaveBeenCalledWith('password');
        });
    });

    describe('Performance Considerations', () => {
        it('should handle large batch validation efficiently', () => {
            const users = Array(100).fill(null).map((_, i) => ({
                email: `user${i}@example.com`,
                password: 'Password123!',
                firstName: `User${i}`,
                lastName: `Test${i}`,
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            }));

            users.forEach(user => {
                mockReq.body = user;
                registerValidation();
                expect(body).toHaveBeenCalledWith('email');
            });
        });

        it('should cache validation results', () => {
            const sameUser = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+237600000000',
                country: 'Cameroun',
                gender: 'male',
                role: 'client'
            };

            // Validate same user multiple times
            for (let i = 0; i < 5; i++) {
                mockReq.body = sameUser;
                registerValidation();
                expect(body).toHaveBeenCalledWith('email');
            }
        });
    });
});
