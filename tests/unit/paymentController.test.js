const { initializePayment, handleWebhook } = require('../../src/controllers/paymentController');
const Payment = require('../../src/models/Payment');
const { User, Provider } = require('../../src/models');
const axios = require('axios');
const { AppError } = require('../../src/middlewares/errorHandler');
const { CINETPAY_CONFIG } = require('../../src/config/cinetpay');

// Mock helpers
jest.mock('../../src/utils/helpers', () => ({
    i18nResponse: jest.fn(),
    getPaginationParams: jest.fn().mockReturnValue({ limit: 10, offset: 0 }),
    getPaginationData: jest.fn().mockReturnValue({}),
}));

// Mock logger
jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
}));

// Mock axios
jest.mock('axios');

// Mock Models
jest.mock('../../src/models/Payment');
jest.mock('../../src/models', () => {
    const mockModels = {
        User: { findByPk: jest.fn() },
        Provider: { update: jest.fn(), increment: jest.fn() },
        sequelize: {
            fn: jest.fn(),
            col: jest.fn(),
            sync: jest.fn().mockResolvedValue(true),
            authenticate: jest.fn().mockResolvedValue(true),
            close: jest.fn().mockResolvedValue(true)
        }
    };
    return mockModels;
});

// Mock errorHandler and asyncHandler
jest.mock('../../src/middlewares/errorHandler', () => {
    return {
        asyncHandler: (fn) => (req, res, next) => fn(req, res, next), // Pass through
        AppError: class extends Error {
            constructor(message, statusCode) {
                super(message);
                this.statusCode = statusCode;
            }
        }
    };
});

// Mock email
jest.mock('../../src/config/email', () => ({
    sendEmail: jest.fn().mockResolvedValue(true)
}));

describe('PaymentController Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            user: { id: 'user-123' },
            t: jest.fn((key) => key),
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
        next = jest.fn();

        // Ensure siteId is set for tests
        CINETPAY_CONFIG.siteId = '789456';
        CINETPAY_CONFIG.apiKey = 'api-key-test';

        jest.clearAllMocks();
    });

    describe('initializePayment', () => {
        it('should initialize payment for subscription', async () => {
            req.body = {
                amount: 5000,
                type: 'subscription',
                description: 'Monthly sub'
            };

            const mockUser = { id: 'user-123', email: 'test@aeli.com', lastName: 'Doe' };
            User.findByPk.mockResolvedValue(mockUser);

            Payment.generateTransactionId.mockReturnValue('AELI_TX_123');
            const mockPayment = {
                id: 'pay-uuid',
                transactionId: 'AELI_TX_123',
                save: jest.fn().mockResolvedValue(true)
            };
            Payment.create.mockResolvedValue(mockPayment);

            axios.post.mockResolvedValue({
                data: {
                    code: '201',
                    data: { payment_token: 'tok-123', payment_url: 'http://pay.me' }
                }
            });

            await initializePayment(req, res, next);

            expect(Payment.create).toHaveBeenCalled();
            expect(mockPayment.paymentToken).toBe('tok-123');
            expect(mockPayment.save).toHaveBeenCalled();
        });

        it('should throw error for invalid amount', async () => {
            req.body = { amount: 50, type: 'subscription' };
            await expect(initializePayment(req, res, next)).rejects.toThrow('common.badRequest');
        });
    });

    describe('handleWebhook', () => {
        it('should accept payment and trigger business logic', async () => {
            req.body = {
                cpm_trans_id: 'AELI_TX_123',
                cpm_site_id: '789456',
                cpm_amount: 5000
            };

            const mockPayment = {
                transactionId: 'AELI_TX_123',
                status: 'PENDING',
                type: 'boost',
                providerId: 'prov-1',
                updateFromCinetPay: jest.fn().mockResolvedValue(true),
                save: jest.fn()
            };
            Payment.findByTransactionId.mockResolvedValue(mockPayment);

            axios.post.mockResolvedValue({
                data: {
                    code: '00',
                    data: { status: 'ACCEPTED', payment_date: '2023-01-01' }
                }
            });

            await handleWebhook(req, res, next);

            expect(mockPayment.updateFromCinetPay).toHaveBeenCalled();
            expect(Provider.increment).toHaveBeenCalledWith('viewsCount', expect.anything());
            expect(res.send).toHaveBeenCalledWith('OK');
        });

        it('should handle refused payment from CinetPay', async () => {
            req.body = {
                cpm_trans_id: 'AELI_TX_123',
                cpm_site_id: '789456'
            };

            const mockPayment = {
                transactionId: 'AELI_TX_123',
                status: 'PENDING',
                save: jest.fn()
            };
            Payment.findByTransactionId.mockResolvedValue(mockPayment);

            axios.post.mockResolvedValue({
                data: {
                    code: '600',
                    data: { status: 'REFUSED' },
                    message: 'Refusé'
                }
            });

            await handleWebhook(req, res, next);

            expect(mockPayment.status).toBe('REFUSED');
            expect(mockPayment.save).toHaveBeenCalled();
        });
    });
});
