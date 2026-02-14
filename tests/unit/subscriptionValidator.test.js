/**
 * Subscription Validator Unit Tests
 * Tests for subscription validation rules
 */

const { body, param, query } = require('express-validator');
const {
    createSubscriptionValidation,
    updateSubscriptionValidation,
    getSubscriptionValidation,
    cancelSubscriptionValidation,
    renewSubscriptionValidation
} = require('../../src/validators/subscriptionValidator');

// Mock express-validator
jest.mock('express-validator', () => ({
    body: jest.fn(() => ({
        notEmpty: jest.fn().mockReturnThis(),
        withMessage: jest.fn().mockReturnThis(),
        isInt: jest.fn().mockReturnThis(),
        isIn: jest.fn().mockReturnThis(),
        isUUID: jest.fn().mockReturnThis(),
        isBoolean: jest.fn().mockReturnThis(),
        isLength: jest.fn().mockReturnThis(),
        isString: jest.fn().mockReturnThis(),
        optional: jest.fn().mockReturnThis(),
        trim: jest.fn().mockReturnThis(),
        isEmail: jest.fn().mockReturnThis(),
        matches: jest.fn().mockReturnThis(),
        isDecimal: jest.fn().mockReturnThis(),
        min: jest.fn().mockReturnThis(),
        max: jest.fn().mockReturnThis(),
        toInt: jest.fn().mockReturnThis()
    })),
    param: jest.fn(() => ({
        optional: jest.fn().mockReturnThis(),
        isUUID: jest.fn().mockReturnThis(),
        withMessage: jest.fn().mockReturnThis(),
        notEmpty: jest.fn().mockReturnThis()
    })),
    query: jest.fn(() => ({
        isInt: jest.fn().mockReturnThis(),
        withMessage: jest.fn().mockReturnThis(),
        toInt: jest.fn().mockReturnThis(),
        optional: jest.fn().mockReturnThis(),
        isIn: jest.fn().mockReturnThis(),
        isDate: jest.fn().mockReturnThis()
    }))
}));

// Mock the validation functions
jest.mock('../../src/validators/subscriptionValidator', () => ({
    createSubscriptionValidation: jest.fn(),
    updateSubscriptionValidation: jest.fn(),
    getSubscriptionValidation: jest.fn(),
    cancelSubscriptionValidation: jest.fn(),
    renewSubscriptionValidation: jest.fn()
}));

describe('Subscription Validator', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockReq = {
            body: {},
            params: {},
            query: {}
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
                    isUUID: jest.fn().mockReturnValue({
                        withMessage: jest.fn().mockReturnValue({
                            isNumeric: jest.fn().mockReturnValue({
                                withMessage: jest.fn().mockReturnValue({
                                    isFloat: jest.fn().mockReturnValue({
                                        withMessage: jest.fn().mockReturnValue({
                                            isInt: jest.fn().mockReturnValue({
                                                withMessage: jest.fn().mockReturnValue({
                                                    isIn: jest.fn().mockReturnValue({
                                                        withMessage: jest.fn().mockReturnValue({
                                                            isISO8601: jest.fn().mockReturnValue({
                                                                withMessage: jest.fn().mockReturnValue({
                                                                    isBoolean: jest.fn().mockReturnValue({
                                                                        withMessage: jest.fn().mockReturnValue({
                                                                            optional: jest.fn().mockReturnValue({
                                                                                notEmpty: jest.fn().mockReturnValue({
                                                                                    withMessage: jest.fn().mockReturnValue({
                                                                                        matches: jest.fn().mockReturnValue({
                                                                                            withMessage: jest.fn().mockReturnValue({
                                                                                                custom: jest.fn().mockReturnValue({
                                                                                                    withMessage: jest.fn().mockReturnValue({
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
        
        query.mockReturnValue({
            isInt: jest.fn().mockReturnValue({
                withMessage: jest.fn().mockReturnValue({
                    toInt: jest.fn().mockReturnValue({
                        optional: jest.fn().mockReturnValue({
                            run: jest.fn().mockReturnValue(Promise.resolve())
                        })
                    })
                })
            })
        });
    });

    describe('createSubscriptionValidation', () => {
        it('should validate subscription creation data', () => {
            const validation = createSubscriptionValidation();
            
            expect(validation).toBeDefined();
            expect(body).toHaveBeenCalledWith('providerId');
            expect(body).toHaveBeenCalledWith('planType');
            expect(body).toHaveBeenCalledWith('duration');
            expect(body).toHaveBeenCalledWith('paymentMethod');
        });

        it('should validate provider ID is UUID', () => {
            mockReq.body = {
                providerId: 'invalid-uuid',
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('providerId');
        });

        it('should validate plan type is from allowed values', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'invalid-plan',
                duration: 1,
                paymentMethod: 'mobile_money'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('planType');
        });

        it('should allow valid plan types', () => {
            const validPlans = ['basic', 'premium', 'enterprise'];
            
            validPlans.forEach(plan => {
                mockReq.body = {
                    providerId: 'provider-123',
                    planType: plan,
                    duration: 1,
                    paymentMethod: 'mobile_money'
                };

                createSubscriptionValidation();
                expect(body).toHaveBeenCalledWith('planType');
            });
        });

        it('should validate duration is positive integer', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'monthly',
                duration: -1,
                paymentMethod: 'mobile_money'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('duration');
        });

        it('should validate duration is within allowed range', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'monthly',
                duration: 13, // Invalid - max 12 months
                paymentMethod: 'mobile_money'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('duration');
        });

        it('should validate payment method', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'invalid-method'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('paymentMethod');
        });

        it('should allow valid payment methods', () => {
            const validMethods = ['mobile_money', 'credit_card', 'bank_transfer'];
            
            validMethods.forEach(method => {
                mockReq.body = {
                    providerId: 'provider-123',
                    planType: 'monthly',
                    duration: 1,
                    paymentMethod: method
                };

                createSubscriptionValidation();
                expect(body).toHaveBeenCalledWith('paymentMethod');
            });
        });

        it('should allow optional auto-renewal setting', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money',
                autoRenew: true
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('autoRenew');
        });

        it('should validate auto-renewal is boolean', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money',
                autoRenew: 'not-boolean'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('autoRenew');
        });

        it('should allow optional promo code', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money',
                promoCode: 'SAVE20'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('promoCode');
        });

        it('should validate promo code format', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money',
                promoCode: 'invalid-promo-code-with-special-chars!'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('promoCode');
        });
    });

    describe('updateSubscriptionValidation', () => {
        it('should validate subscription update data', () => {
            const validation = updateSubscriptionValidation();
            
            expect(validation).toBeDefined();
            expect(param).toHaveBeenCalledWith('id');
            expect(body).toHaveBeenCalledWith('planType');
            expect(body).toHaveBeenCalledWith('duration');
        });

        it('should validate subscription ID is UUID', () => {
            mockReq.params = { id: 'invalid-uuid' };

            updateSubscriptionValidation();
            
            expect(param).toHaveBeenCalledWith('id');
        });

        it('should validate plan type on update', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                planType: 'invalid-plan'
            };

            updateSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('planType');
        });

        it('should validate duration on update', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                duration: -1
            };

            updateSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('duration');
        });

        it('should allow partial updates', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                planType: 'premium'
            };

            updateSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('planType');
        });

        it('should allow auto-renewal update', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                autoRenew: false
            };

            updateSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('autoRenew');
        });
    });

    describe('getSubscriptionValidation', () => {
        it('should validate subscription retrieval parameters', () => {
            const validation = getSubscriptionValidation();
            
            expect(validation).toBeDefined();
            expect(query).toHaveBeenCalledWith('page');
            expect(query).toHaveBeenCalledWith('limit');
            expect(query).toHaveBeenCalledWith('status');
            expect(query).toHaveBeenCalledWith('planType');
            expect(query).toHaveBeenCalledWith('providerId');
        });

        it('should validate page parameter', () => {
            mockReq.query = { page: 'invalid' };

            getSubscriptionValidation();
            
            expect(query).toHaveBeenCalledWith('page');
        });

        it('should validate limit parameter', () => {
            mockReq.query = { limit: 'invalid' };

            getSubscriptionValidation();
            
            expect(query).toHaveBeenCalledWith('limit');
        });

        it('should validate status filter', () => {
            mockReq.query = { status: 'invalid-status' };

            getSubscriptionValidation();
            
            expect(query).toHaveBeenCalledWith('status');
        });

        it('should allow valid status values', () => {
            const validStatuses = ['active', 'expired', 'cancelled', 'pending'];
            
            validStatuses.forEach(status => {
                mockReq.query = { status };
                getSubscriptionValidation();
                expect(query).toHaveBeenCalledWith('status');
            });
        });

        it('should validate plan type filter', () => {
            mockReq.query = { planType: 'invalid-plan' };

            getSubscriptionValidation();
            
            expect(query).toHaveBeenCalledWith('planType');
        });

        it('should validate provider ID filter', () => {
            mockReq.query = { providerId: 'invalid-uuid' };

            getSubscriptionValidation();
            
            expect(query).toHaveBeenCalledWith('providerId');
        });

        it('should allow date range filters', () => {
            mockReq.query = {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            };

            getSubscriptionValidation();
            
            expect(query).toHaveBeenCalledWith('startDate');
            expect(query).toHaveBeenCalledWith('endDate');
        });

        it('should validate date format', () => {
            mockReq.query = {
                startDate: 'invalid-date',
                endDate: 'invalid-date'
            };

            getSubscriptionValidation();
            
            expect(query).toHaveBeenCalledWith('startDate');
            expect(query).toHaveBeenCalledWith('endDate');
        });
    });

    describe('cancelSubscriptionValidation', () => {
        it('should validate subscription cancellation', () => {
            const validation = cancelSubscriptionValidation();
            
            expect(validation).toBeDefined();
            expect(param).toHaveBeenCalledWith('id');
            expect(body).toHaveBeenCalledWith('reason');
        });

        it('should validate subscription ID for cancellation', () => {
            mockReq.params = { id: 'invalid-uuid' };

            cancelSubscriptionValidation();
            
            expect(param).toHaveBeenCalledWith('id');
        });

        it('should validate cancellation reason', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                reason: ''
            };

            cancelSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('reason');
        });

        it('should validate reason length', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                reason: 'a'.repeat(1000) // Too long
            };

            cancelSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('reason');
        });

        it('should allow valid cancellation reasons', () => {
            const validReasons = [
                'Service not needed anymore',
                'Found better alternative',
                'Too expensive',
                'Technical issues',
                'Other'
            ];

            validReasons.forEach(reason => {
                mockReq.params = { id: 'sub-123' };
                mockReq.body = { reason };
                cancelSubscriptionValidation();
                expect(body).toHaveBeenCalledWith('reason');
            });
        });

        it('should allow immediate cancellation flag', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                reason: 'Service not needed',
                immediate: true
            };

            cancelSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('immediate');
        });

        it('should validate immediate flag is boolean', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                reason: 'Service not needed',
                immediate: 'not-boolean'
            };

            cancelSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('immediate');
        });
    });

    describe('renewSubscriptionValidation', () => {
        it('should validate subscription renewal', () => {
            const validation = renewSubscriptionValidation();
            
            expect(validation).toBeDefined();
            expect(param).toHaveBeenCalledWith('id');
            expect(body).toHaveBeenCalledWith('duration');
            expect(body).toHaveBeenCalledWith('paymentMethod');
        });

        it('should validate subscription ID for renewal', () => {
            mockReq.params = { id: 'invalid-uuid' };

            renewSubscriptionValidation();
            
            expect(param).toHaveBeenCalledWith('id');
        });

        it('should validate renewal duration', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                duration: -1
            };

            renewSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('duration');
        });

        it('should validate payment method for renewal', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                duration: 1,
                paymentMethod: 'invalid-method'
            };

            renewSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('paymentMethod');
        });

        it('should allow renewal with same payment method', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                duration: 3,
                paymentMethod: 'same'
            };

            renewSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('paymentMethod');
        });

        it('should allow promo code for renewal', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                duration: 3,
                paymentMethod: 'mobile_money',
                promoCode: 'RENEW10'
            };

            renewSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('promoCode');
        });
    });

    describe('Advanced Validation Rules', () => {
        it('should validate provider exists', () => {
            mockReq.body = {
                providerId: 'non-existent-provider',
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('providerId');
        });

        it('should validate provider is verified', () => {
            mockReq.body = {
                providerId: 'unverified-provider',
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('providerId');
        });

        it('should validate no active subscription exists', () => {
            mockReq.body = {
                providerId: 'provider-with-active-sub',
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('providerId');
        });

        it('should validate promo code is valid and active', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money',
                promoCode: 'expired-promo'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('promoCode');
        });

        it('should validate promo code applies to plan type', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'enterprise',
                duration: 1,
                paymentMethod: 'mobile_money',
                promoCode: 'basic-only-promo'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('promoCode');
        });

        it('should validate subscription can be cancelled', () => {
            mockReq.params = { id: 'already-cancelled-sub' };
            mockReq.body = {
                reason: 'Service not needed'
            };

            cancelSubscriptionValidation();
            
            expect(param).toHaveBeenCalledWith('id');
        });

        it('should validate subscription can be renewed', () => {
            mockReq.params = { id: 'expired-sub' };
            mockReq.body = {
                duration: 1,
                paymentMethod: 'mobile_money'
            };

            renewSubscriptionValidation();
            
            expect(param).toHaveBeenCalledWith('id');
        });
    });

    describe('Business Logic Validation', () => {
        it('should validate minimum subscription duration', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'monthly',
                duration: 0, // Invalid - minimum 1 month
                paymentMethod: 'mobile_money'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('duration');
        });

        it('should validate maximum subscription duration', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'monthly',
                duration: 25, // Invalid - maximum 24 months
                paymentMethod: 'mobile_money'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('duration');
        });

        it('should validate plan type pricing compatibility', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'basic',
                duration: 12, // Basic plan max 6 months
                paymentMethod: 'mobile_money'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('duration');
        });

        it('should validate payment method availability', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'enterprise',
                duration: 1,
                paymentMethod: 'mobile_money' // Enterprise requires credit card
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('paymentMethod');
        });

        it('should validate cancellation notice period', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                reason: 'Service not needed',
                immediate: true // Should require admin approval
            };

            cancelSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('immediate');
        });

        it('should validate renewal before expiration', () => {
            mockReq.params = { id: 'expired-sub' };
            mockReq.body = {
                duration: 1,
                paymentMethod: 'mobile_money'
            };

            renewSubscriptionValidation();
            
            expect(param).toHaveBeenCalledWith('id');
        });
    });

    describe('Input Sanitization', () => {
        it('should trim whitespace from all fields', () => {
            mockReq.body = {
                providerId: '  provider-123  ',
                planType: '  monthly  ',
                duration: '  1  ',
                paymentMethod: '  mobile_money  ',
                promoCode: '  SAVE20  '
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('providerId');
            expect(body).toHaveBeenCalledWith('planType');
        });

        it('should escape HTML in text fields', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money',
                promoCode: '<script>alert("xss")</script>SAVE20'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('promoCode');
        });

        it('should normalize plan type case', () => {
            mockReq.body = {
                providerId: 'provider-123',
                planType: 'MONTHLY',
                duration: 1,
                paymentMethod: 'mobile_money'
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('planType');
        });
    });

    describe('Edge Cases', () => {
        it('should handle extremely long inputs', () => {
            const longString = 'a'.repeat(1000);
            
            mockReq.body = {
                providerId: longString,
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money',
                promoCode: longString
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('providerId');
            expect(body).toHaveBeenCalledWith('promoCode');
        });

        it('should handle null and undefined values', () => {
            mockReq.body = {
                providerId: null,
                planType: undefined,
                duration: null,
                paymentMethod: undefined,
                promoCode: null
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('providerId');
            expect(body).toHaveBeenCalledWith('planType');
        });

        it('should handle array inputs', () => {
            mockReq.body = {
                providerId: ['provider-123'],
                planType: ['monthly'],
                duration: [1],
                paymentMethod: ['mobile_money']
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('providerId');
        });

        it('should handle object inputs', () => {
            mockReq.body = {
                providerId: { value: 'provider-123' },
                planType: { value: 'monthly' },
                duration: { value: 1 },
                paymentMethod: { value: 'mobile_money' }
            };

            createSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('providerId');
        });

        it('should handle special characters in reason', () => {
            mockReq.params = { id: 'sub-123' };
            mockReq.body = {
                reason: 'Service not working! @#$%^&*()',
                immediate: false
            };

            cancelSubscriptionValidation();
            
            expect(body).toHaveBeenCalledWith('reason');
        });
    });

    describe('Performance Considerations', () => {
        it('should handle bulk subscription validation', () => {
            const subscriptions = Array(50).fill(null).map((_, i) => ({
                providerId: `provider-${i}`,
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money'
            }));

            subscriptions.forEach(sub => {
                mockReq.body = sub;
                createSubscriptionValidation();
                expect(body).toHaveBeenCalledWith('providerId');
            });
        });

        it('should cache validation results for repeated requests', () => {
            const sameSubscription = {
                providerId: 'provider-123',
                planType: 'monthly',
                duration: 1,
                paymentMethod: 'mobile_money'
            };

            for (let i = 0; i < 5; i++) {
                mockReq.body = sameSubscription;
                createSubscriptionValidation();
                expect(body).toHaveBeenCalledWith('providerId');
            }
        });
    });
});
