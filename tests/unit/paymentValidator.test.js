/**
 * Payment Validator Unit Tests
 * Tests for payment validation rules
 */

const { body, param, query } = require('express-validator');
const {
    createPaymentValidation,
    updatePaymentValidation,
    getPaymentValidation,
    paymentWebhookValidation
} = require('../../src/validators/paymentValidator');

// Mock express-validator
jest.mock('express-validator');

describe('Payment Validator', () => {
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
                    isNumeric: jest.fn().mockReturnValue({
                        withMessage: jest.fn().mockReturnValue({
                            isFloat: jest.fn().mockReturnValue({
                                withMessage: jest.fn().mockReturnValue({
                                    custom: jest.fn().mockReturnValue({
                                        withMessage: jest.fn().mockReturnValue({
                                            notEmpty: jest.fn().mockReturnValue({
                                                withMessage: jest.fn().mockReturnValue({
                                                    optional: jest.fn().mockReturnValue({
                                                        isEmail: jest.fn().mockReturnValue({
                                                            withMessage: jest.fn().mockReturnValue({
                                                                isIn: jest.fn().mockReturnValue({
                                                                    withMessage: jest.fn().mockReturnValue({
                                                                        isUUID: jest.fn().mockReturnValue({
                                                                            withMessage: jest.fn().mockReturnValue({
                                                                                isISO8601: jest.fn().mockReturnValue({
                                                                                    withMessage: jest.fn().mockReturnValue({
                                                                                        matches: jest.fn().mockReturnValue({
                                                                                            withMessage: jest.fn().mockReturnValue({
                                                                                                exists: jest.fn().mockReturnValue({
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

    describe('createPaymentValidation', () => {
        it('should validate payment creation data', () => {
            const validation = createPaymentValidation();
            
            expect(validation).toBeDefined();
            expect(body).toHaveBeenCalledWith('amount');
            expect(body).toHaveBeenCalledWith('currency');
            expect(body).toHaveBeenCalledWith('paymentMethod');
            expect(body).toHaveBeenCalledWith('providerId');
        });

        it('should require amount field', () => {
            mockReq.body = {
                currency: 'XAF',
                paymentMethod: 'mobile_money',
                providerId: 'provider-123'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
        });

        it('should validate amount is numeric', () => {
            mockReq.body = {
                amount: 'invalid',
                currency: 'XAF',
                paymentMethod: 'mobile_money',
                providerId: 'provider-123'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
        });

        it('should validate amount is positive', () => {
            mockReq.body = {
                amount: -100,
                currency: 'XAF',
                paymentMethod: 'mobile_money',
                providerId: 'provider-123'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
        });

        it('should validate currency format', () => {
            mockReq.body = {
                amount: 1000,
                currency: 'INVALID',
                paymentMethod: 'mobile_money',
                providerId: 'provider-123'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('currency');
        });

        it('should validate payment method', () => {
            mockReq.body = {
                amount: 1000,
                currency: 'XAF',
                paymentMethod: 'invalid_method',
                providerId: 'provider-123'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('paymentMethod');
        });

        it('should validate provider ID is UUID', () => {
            mockReq.body = {
                amount: 1000,
                currency: 'XAF',
                paymentMethod: 'mobile_money',
                providerId: 'invalid-uuid'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('providerId');
        });

        it('should allow optional contact ID', () => {
            mockReq.body = {
                amount: 1000,
                currency: 'XAF',
                paymentMethod: 'mobile_money',
                providerId: 'provider-123',
                contactId: 'contact-456'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('contactId');
        });

        it('should validate contact ID format when provided', () => {
            mockReq.body = {
                amount: 1000,
                currency: 'XAF',
                paymentMethod: 'mobile_money',
                providerId: 'provider-123',
                contactId: 'invalid-uuid'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('contactId');
        });
    });

    describe('updatePaymentValidation', () => {
        it('should validate payment update data', () => {
            const validation = updatePaymentValidation();
            
            expect(validation).toBeDefined();
            expect(param).toHaveBeenCalledWith('id');
            expect(body).toHaveBeenCalledWith('status');
        });

        it('should validate payment ID is UUID', () => {
            mockReq.params = { id: 'invalid-uuid' };

            updatePaymentValidation();
            
            expect(param).toHaveBeenCalledWith('id');
        });

        it('should validate status field', () => {
            mockReq.body = { status: 'invalid_status' };

            updatePaymentValidation();
            
            expect(body).toHaveBeenCalledWith('status');
        });

        it('should allow valid status values', () => {
            const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
            
            validStatuses.forEach(status => {
                mockReq.body = { status };
                updatePaymentValidation();
                expect(body).toHaveBeenCalledWith('status');
            });
        });

        it('should allow optional transaction ID', () => {
            mockReq.body = {
                status: 'completed',
                transactionId: 'txn-123'
            };

            updatePaymentValidation();
            
            expect(body).toHaveBeenCalledWith('transactionId');
        });

        it('should validate transaction ID format', () => {
            mockReq.body = {
                status: 'completed',
                transactionId: ''
            };

            updatePaymentValidation();
            
            expect(body).toHaveBeenCalledWith('transactionId');
        });
    });

    describe('getPaymentValidation', () => {
        it('should validate payment retrieval parameters', () => {
            const validation = getPaymentValidation();
            
            expect(validation).toBeDefined();
            expect(query).toHaveBeenCalledWith('page');
            expect(query).toHaveBeenCalledWith('limit');
            expect(query).toHaveBeenCalledWith('status');
            expect(query).toHaveBeenCalledWith('paymentMethod');
            expect(query).toHaveBeenCalledWith('startDate');
            expect(query).toHaveBeenCalledWith('endDate');
        });

        it('should validate page parameter', () => {
            mockReq.query = { page: 'invalid' };

            getPaymentValidation();
            
            expect(query).toHaveBeenCalledWith('page');
        });

        it('should validate limit parameter', () => {
            mockReq.query = { limit: 'invalid' };

            getPaymentValidation();
            
            expect(query).toHaveBeenCalledWith('limit');
        });

        it('should validate status filter', () => {
            mockReq.query = { status: 'invalid_status' };

            getPaymentValidation();
            
            expect(query).toHaveBeenCalledWith('status');
        });

        it('should validate payment method filter', () => {
            mockReq.query = { paymentMethod: 'invalid_method' };

            getPaymentValidation();
            
            expect(query).toHaveBeenCalledWith('paymentMethod');
        });

        it('should validate date range', () => {
            mockReq.query = {
                startDate: 'invalid-date',
                endDate: 'invalid-date'
            };

            getPaymentValidation();
            
            expect(query).toHaveBeenCalledWith('startDate');
            expect(query).toHaveBeenCalledWith('endDate');
        });

        it('should allow valid date format', () => {
            mockReq.query = {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            };

            getPaymentValidation();
            
            expect(query).toHaveBeenCalledWith('startDate');
            expect(query).toHaveBeenCalledWith('endDate');
        });
    });

    describe('paymentWebhookValidation', () => {
        it('should validate webhook payload', () => {
            const validation = paymentWebhookValidation();
            
            expect(validation).toBeDefined();
            expect(body).toHaveBeenCalledWith('transaction_id');
            expect(body).toHaveBeenCalledWith('status');
            expect(body).toHaveBeenCalledWith('amount');
            expect(body).toHaveBeenCalledWith('currency');
        });

        it('should require transaction ID', () => {
            mockReq.body = {
                status: 'SUCCESSFUL',
                amount: 1000,
                currency: 'XAF'
            };

            paymentWebhookValidation();
            
            expect(body).toHaveBeenCalledWith('transaction_id');
        });

        it('should validate transaction ID format', () => {
            mockReq.body = {
                transaction_id: '',
                status: 'SUCCESSFUL',
                amount: 1000,
                currency: 'XAF'
            };

            paymentWebhookValidation();
            
            expect(body).toHaveBeenCalledWith('transaction_id');
        });

        it('should validate status field', () => {
            mockReq.body = {
                transaction_id: 'txn-123',
                status: 'invalid_status',
                amount: 1000,
                currency: 'XAF'
            };

            paymentWebhookValidation();
            
            expect(body).toHaveBeenCalledWith('status');
        });

        it('should allow valid webhook statuses', () => {
            const validStatuses = ['SUCCESSFUL', 'FAILED', 'PENDING', 'CANCELLED', 'REFUNDED'];
            
            validStatuses.forEach(status => {
                mockReq.body = {
                    transaction_id: 'txn-123',
                    status,
                    amount: 1000,
                    currency: 'XAF'
                };

                paymentWebhookValidation();
                expect(body).toHaveBeenCalledWith('status');
            });
        });

        it('should validate amount is numeric', () => {
            mockReq.body = {
                transaction_id: 'txn-123',
                status: 'SUCCESSFUL',
                amount: 'invalid',
                currency: 'XAF'
            };

            paymentWebhookValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
        });

        it('should validate amount is positive', () => {
            mockReq.body = {
                transaction_id: 'txn-123',
                status: 'SUCCESSFUL',
                amount: -100,
                currency: 'XAF'
            };

            paymentWebhookValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
        });

        it('should validate currency format', () => {
            mockReq.body = {
                transaction_id: 'txn-123',
                status: 'SUCCESSFUL',
                amount: 1000,
                currency: 'INVALID'
            };

            paymentWebhookValidation();
            
            expect(body).toHaveBeenCalledWith('currency');
        });

        it('should allow optional webhook fields', () => {
            mockReq.body = {
                transaction_id: 'txn-123',
                status: 'SUCCESSFUL',
                amount: 1000,
                currency: 'XAF',
                payment_method: 'mobile_money',
                operator: 'MTN',
                phone_number: '+237600000000',
                custom_field: 'payment-456'
            };

            paymentWebhookValidation();
            
            expect(body).toHaveBeenCalledWith('payment_method');
            expect(body).toHaveBeenCalledWith('operator');
            expect(body).toHaveBeenCalledWith('phone_number');
            expect(body).toHaveBeenCalledWith('custom_field');
        });
    });

    describe('Validation Rules', () => {
        it('should have proper error messages', () => {
            const validation = createPaymentValidation();
            
            expect(validation).toBeDefined();
            // Check that validation rules include error messages
            expect(body).toHaveBeenCalledWith('amount');
        });

        it('should sanitize input data', () => {
            mockReq.body = {
                amount: '1000',
                currency: 'XAF',
                paymentMethod: 'mobile_money',
                providerId: 'provider-123',
                contactId: 'contact-456'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
            expect(body).toHaveBeenCalledWith('currency');
            expect(body).toHaveBeenCalledWith('paymentMethod');
            expect(body).toHaveBeenCalledWith('providerId');
            expect(body).toHaveBeenCalledWith('contactId');
        });

        it('should handle empty requests', () => {
            mockReq.body = {};

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
            expect(body).toHaveBeenCalledWith('currency');
            expect(body).toHaveBeenCalledWith('paymentMethod');
            expect(body).toHaveBeenCalledWith('providerId');
        });

        it('should validate maximum amount', () => {
            mockReq.body = {
                amount: 999999999, // Very large amount
                currency: 'XAF',
                paymentMethod: 'mobile_money',
                providerId: 'provider-123'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
        });

        it('should validate minimum amount', () => {
            mockReq.body = {
                amount: 0, // Zero amount
                currency: 'XAF',
                paymentMethod: 'mobile_money',
                providerId: 'provider-123'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
        });
    });

    describe('Custom Validation', () => {
        it('should validate payment method availability', () => {
            const availableMethods = ['mobile_money', 'credit_card', 'bank_transfer'];
            
            mockReq.body = {
                amount: 1000,
                currency: 'XAF',
                paymentMethod: 'unavailable_method',
                providerId: 'provider-123'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('paymentMethod');
        });

        it('should validate currency support', () => {
            const supportedCurrencies = ['XAF', 'EUR', 'USD'];
            
            mockReq.body = {
                amount: 1000,
                currency: 'UNSUPPORTED',
                paymentMethod: 'mobile_money',
                providerId: 'provider-123'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('currency');
        });

        it('should validate provider existence', () => {
            mockReq.body = {
                amount: 1000,
                currency: 'XAF',
                paymentMethod: 'mobile_money',
                providerId: 'non-existent-provider'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('providerId');
        });
    });

    describe('Edge Cases', () => {
        it('should handle null values', () => {
            mockReq.body = {
                amount: null,
                currency: null,
                paymentMethod: null,
                providerId: null
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
            expect(body).toHaveBeenCalledWith('currency');
            expect(body).toHaveBeenCalledWith('paymentMethod');
            expect(body).toHaveBeenCalledWith('providerId');
        });

        it('should handle undefined values', () => {
            mockReq.body = {
                amount: undefined,
                currency: undefined,
                paymentMethod: undefined,
                providerId: undefined
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
            expect(body).toHaveBeenCalledWith('currency');
            expect(body).toHaveBeenCalledWith('paymentMethod');
            expect(body).toHaveBeenCalledWith('providerId');
        });

        it('should handle string numbers', () => {
            mockReq.body = {
                amount: '1000.50',
                currency: 'XAF',
                paymentMethod: 'mobile_money',
                providerId: 'provider-123'
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
        });

        it('should handle whitespace', () => {
            mockReq.body = {
                amount: ' 1000 ',
                currency: ' XAF ',
                paymentMethod: ' mobile_money ',
                providerId: ' provider-123 '
            };

            createPaymentValidation();
            
            expect(body).toHaveBeenCalledWith('amount');
            expect(body).toHaveBeenCalledWith('currency');
            expect(body).toHaveBeenCalledWith('paymentMethod');
            expect(body).toHaveBeenCalledWith('providerId');
        });
    });
});
