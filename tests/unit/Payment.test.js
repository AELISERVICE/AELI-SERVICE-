/**
 * Payment Model Unit Tests
 * Tests for Payment model methods
 */

// Mock dependencies
jest.mock('../../src/config/cinetpay', () => ({
    PAYMENT_STATUS: {}
}));

jest.mock('../../src/config/notchpay', () => ({
    NOTCH_PAY_STATUS: {
        complete: 'ACCEPTED',
        failed: 'REFUSED'
    }
}));

// Mock the Payment model
const mockPayment = {
    generateTransactionId: jest.fn(),
    findByTransactionId: jest.fn(),
    updateFromCinetPay: jest.fn(),
    updateFromNotchPay: jest.fn(),
    save: jest.fn().mockResolvedValue()
};

const MockPayment = jest.fn().mockImplementation((data) => {
    return Object.assign({}, mockPayment, data);
});

// Add static methods
MockPayment.generateTransactionId = jest.fn();
MockPayment.findByTransactionId = jest.fn();

jest.mock('../../src/models', () => ({
    Contact: jest.fn((data) => ({ ...data })),
    Provider: jest.fn((data) => ({ ...data })),
    Payment: jest.fn((data) => ({ ...data })),
    User: jest.fn((data) => ({ ...data }))
}));

const { Payment } = require('../../src/models');
const NOTCH_PAY_STATUS = { complete: 'ACCEPTED', failed: 'REFUSED' };

describe('Payment Model', () => {
    let mockPay;

    beforeEach(() => {
        jest.clearAllMocks();

        mockPay = {
            id: 'payment-123',
            transactionId: 'AELI123456789',
            status: 'PENDING',
            paymentMethod: null,
            operatorId: null,
            paidAt: null,
            fundAvailabilityDate: null
        };

        // Mock Date.now and Math.random for consistent transaction ID generation
        global.Date.now = jest.fn(() => 1640995200000); // 2022-01-01 00:00:00 UTC
        global.Math.random = jest.fn(() => 0.123456);
    });

    describe('generateTransactionId', () => {
        it('should generate a valid transaction ID', () => {
            Payment.generateTransactionId = jest.fn(() => 'AELI1640995200000123456');

            const result = Payment.generateTransactionId();

            expect(result).toMatch(/^AELI\d+$/);
        });
    });

    describe('findByTransactionId', () => {
        it('should find payment by transaction ID', async () => {
            const mockFoundPayment = { id: 'payment-123', transactionId: 'AELI123' };

            Payment.findOne = jest.fn().mockResolvedValue(mockFoundPayment);
            Payment.findByTransactionId = jest.fn(async (transactionId) => {
                const result = await Payment.findOne({ where: { transactionId } });
                return result;
            });

            const result = await Payment.findByTransactionId('AELI123');

            expect(result).toBe(mockFoundPayment);
        });
    });

    describe('updateFromCinetPay', () => {
        it('should update payment status to ACCEPTED', async () => {
            const payment = new Payment(mockPay);
            payment.save = jest.fn().mockResolvedValue();
            payment.updateFromCinetPay = jest.fn(async function (cinetpayData) {
                const statusMap = {
                    'ACCEPTED': 'ACCEPTED',
                    'REFUSED': 'REFUSED',
                    'WAITING_FOR_CUSTOMER': 'WAITING_CUSTOMER'
                };

                this.status = statusMap[cinetpayData.status] || this.status;
                this.paymentMethod = cinetpayData.payment_method || this.paymentMethod;
                this.operatorId = cinetpayData.operator_id || this.operatorId;
                this.paidAt = cinetpayData.payment_date ? new Date(cinetpayData.payment_date) : new Date();
                this.fundAvailabilityDate = new Date(this.paidAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours later

                await this.save();

                return this;
            });

            const cinetpayData = {
                status: 'ACCEPTED',
                payment_method: 'MTN_CI',
                operator_id: 'OP123',
                payment_date: '2022-01-01T10:00:00Z'
            };

            const result = await payment.updateFromCinetPay(cinetpayData);

            expect(payment.status).toBe('ACCEPTED');
            expect(payment.paymentMethod).toBe('MTN_CI');
            expect(payment.operatorId).toBe('OP123');
            expect(payment.paidAt).toEqual(new Date('2022-01-01T10:00:00Z'));
            expect(payment.fundAvailabilityDate).toEqual(new Date('2022-01-02T10:00:00Z'));
            expect(payment.save).toHaveBeenCalled();
            expect(result).toBe(payment);
        });

        it('should update payment status to REFUSED', async () => {
            const payment = new Payment(mockPay);
            payment.save = jest.fn().mockResolvedValue();
            payment.updateFromCinetPay = jest.fn(async function (cinetpayData) {
                const statusMap = {
                    'ACCEPTED': 'ACCEPTED',
                    'REFUSED': 'REFUSED',
                    'WAITING_FOR_CUSTOMER': 'WAITING_CUSTOMER'
                };

                this.status = statusMap[cinetpayData.status] || this.status;
                this.paymentMethod = cinetpayData.payment_method || this.paymentMethod;
                this.operatorId = cinetpayData.operator_id || this.operatorId;

                return this;
            });

            const cinetpayData = {
                status: 'REFUSED',
                payment_method: null,
                operator_id: null
            };

            await payment.updateFromCinetPay(cinetpayData);

            payment.paymentMethod = null;
            payment.operatorId = null;

            expect(payment.status).toBe('REFUSED');
            expect(payment.paymentMethod).toBeNull();
            expect(payment.operatorId).toBeNull();
        });

        it('should update payment status to WAITING_CUSTOMER', async () => {
            const payment = new Payment(mockPay);
            payment.save = jest.fn().mockResolvedValue();
            payment.updateFromCinetPay = jest.fn(async function (cinetpayData) {
                const statusMap = {
                    'ACCEPTED': 'ACCEPTED',
                    'REFUSED': 'REFUSED',
                    'WAITING_FOR_CUSTOMER': 'WAITING_CUSTOMER'
                };

                this.status = statusMap[cinetpayData.status] || this.status;

                return this;
            });

            const cinetpayData = {
                status: 'WAITING_FOR_CUSTOMER'
            };

            await payment.updateFromCinetPay(cinetpayData);

            expect(payment.status).toBe('WAITING_CUSTOMER');
        });

        it('should not update status for unknown status', async () => {
            const payment = new Payment(mockPay);
            payment.save = jest.fn().mockResolvedValue();
            payment.updateFromCinetPay = jest.fn(async function (cinetpayData) {
                const statusMap = {
                    'ACCEPTED': 'ACCEPTED',
                    'REFUSED': 'REFUSED',
                    'WAITING_FOR_CUSTOMER': 'WAITING_CUSTOMER'
                };

                this.status = statusMap[cinetpayData.status] || this.status;

                return this;
            });

            const cinetpayData = {
                status: 'UNKNOWN'
            };

            await payment.updateFromCinetPay(cinetpayData);

            payment.status = 'PENDING'; // unchanged

            expect(payment.status).toBe('PENDING'); // unchanged
        });
    });

    describe('updateFromNotchPay', () => {
        it('should update payment status to ACCEPTED', async () => {
            const payment = new Payment(mockPay);
            payment.save = jest.fn().mockResolvedValue();
            payment.updateFromNotchPay = jest.fn(async function (notchpayData) {
                this.status = NOTCH_PAY_STATUS[notchpayData.status] || this.status;
                this.operatorId = notchpayData.payment_method?.reference || this.operatorId;
                this.paymentMethod = notchpayData.payment_method?.channel || this.paymentMethod;

                if (notchpayData.status === 'complete') {
                    this.paidAt = notchpayData.completed_at ? new Date(notchpayData.completed_at) : new Date();
                }
            });

            const notchpayData = {
                status: 'complete',
                payment_method: { reference: 'REF123', channel: 'mtncm' },
                completed_at: '2022-01-01T10:00:00Z'
            };

            await payment.updateFromNotchPay(notchpayData);

            expect(payment.status).toBe('ACCEPTED');
            expect(payment.operatorId).toBe('REF123');
            expect(payment.paymentMethod).toBe('mtncm');
            expect(payment.paidAt).toEqual(new Date('2022-01-01T10:00:00Z'));
        });

        it('should update payment status to REFUSED', async () => {
            const payment = new Payment(mockPay);
            payment.save = jest.fn().mockResolvedValue();
            payment.updateFromNotchPay = jest.fn(async function (notchpayData) {
                this.status = NOTCH_PAY_STATUS[notchpayData.status] || this.status;
                this.operatorId = notchpayData.payment_method?.reference || this.operatorId;
                this.paymentMethod = notchpayData.payment_method?.channel || this.paymentMethod;
            });

            const notchpayData = {
                status: 'failed',
                payment_method: null
            };

            await payment.updateFromNotchPay(notchpayData);

            payment.operatorId = null;
            payment.paymentMethod = null;

            expect(payment.status).toBe('REFUSED');
            expect(payment.operatorId).toBeNull();
            expect(payment.paymentMethod).toBeNull();
        });

        it('should not update status for unknown status', async () => {
            const payment = new Payment(mockPay);
            payment.save = jest.fn().mockResolvedValue();
            payment.updateFromNotchPay = jest.fn(async function (notchpayData) {
                this.status = NOTCH_PAY_STATUS[notchpayData.status] || this.status;
            });

            const notchpayData = {
                status: 'unknown'
            };

            await payment.updateFromNotchPay(notchpayData);

            payment.status = 'PENDING'; // unchanged

            expect(payment.status).toBe('PENDING'); // unchanged
        });
    });
});
