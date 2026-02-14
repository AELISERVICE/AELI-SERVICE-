/**
 * Contact Controller Unit Tests
 * Tests for contact-related endpoints
 */

const {
    createContact,
    getReceivedContacts,
    getSentContacts,
    updateContactStatus,
    getDailyContactStats,
    getContactsByDate,
    initiateContactUnlock,
    confirmContactUnlock
} = require('../../src/controllers/contactController');

// Mock dependencies
jest.mock('../../src/models', () => ({
    Contact: {
        findByPk: jest.fn(),
        findAll: jest.fn(),
        findAndCountAll: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        findByTransactionId: jest.fn()
    },
    Provider: {
        findByPk: jest.fn(),
        findOne: jest.fn()
    },
    User: {
        findByPk: jest.fn()
    },
    Payment: {
        generateTransactionId: jest.fn(),
        create: jest.fn(),
        findByTransactionId: jest.fn()
    },
    Subscription: {
        findOne: jest.fn()
    }
}));

jest.mock('../../src/middlewares/errorHandler', () => ({
    asyncHandler: (fn) => (req, res, next) => fn(req, res, next),
    AppError: class extends Error {
        constructor(message, statusCode) {
            super(message);
            this.statusCode = statusCode;
        }
    }
}));

jest.mock('../../src/utils/helpers', () => ({
    i18nResponse: jest.fn(),
    getPaginationParams: jest.fn(),
    getPaginationData: jest.fn()
}));

jest.mock('../../src/config/email', () => ({
    sendEmail: jest.fn()
}));

jest.mock('../../src/utils/emailTemplates', () => ({
    newContactEmail: jest.fn(),
    contactStatusChangedEmail: jest.fn()
}));

jest.mock('../../src/config/socket', () => ({
    emitNewContact: jest.fn(),
    emitContactStatusChange: jest.fn()
}));

jest.mock('../../src/utils/paymentGateway', () => ({
    initializeCinetPayPayment: jest.fn()
}));

const { Contact, Provider, User, Payment, Subscription } = require('../../src/models');
const { i18nResponse, getPaginationParams, getPaginationData } = require('../../src/utils/helpers');
const { sendEmail } = require('../../src/config/email');
const { emitNewContact, emitContactStatusChange } = require('../../src/config/socket');
const { initializeCinetPayPayment } = require('../../src/utils/paymentGateway');

describe('Contact Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            body: {},
            params: {},
            query: {},
            user: { id: 'user-123', role: 'provider' },
            t: jest.fn((key) => key)
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        mockNext = jest.fn();

        // Setup default mocks
        i18nResponse.mockImplementation(() => {});
        getPaginationParams.mockReturnValue({ limit: 10, offset: 0 });
        getPaginationData.mockReturnValue({ page: 1, totalPages: 1 });
        Payment.generateTransactionId.mockReturnValue('txn-123');
        sendEmail.mockResolvedValue({});
    });

    describe('createContact', () => {
        it('should create contact successfully', async () => {
            const contactData = {
                providerId: 'provider-123',
                message: 'Hello',
                senderName: 'John Doe',
                senderEmail: 'john@example.com',
                senderPhone: '+1234567890'
            };
            mockReq.body = contactData;

            const mockProvider = {
                id: 'provider-123',
                businessName: 'Test Provider',
                incrementContacts: jest.fn().mockResolvedValue(),
                user: { email: 'provider@example.com' }
            };

            const mockContact = {
                id: 'contact-123',
                ...contactData,
                isUnlocked: false,
                save: jest.fn().mockResolvedValue()
            };

            Provider.findByPk.mockResolvedValue(mockProvider);
            Contact.create.mockResolvedValue(mockContact);
            Subscription.findOne.mockResolvedValue(null); // No active subscription

            await createContact(mockReq, mockRes, mockNext);

            expect(Provider.findByPk).toHaveBeenCalledWith('provider-123', expect.any(Object));
            expect(Contact.create).toHaveBeenCalledWith({
                userId: 'user-123',
                providerId: 'provider-123',
                message: 'Hello',
                senderName: 'John Doe',
                senderEmail: 'john@example.com',
                senderPhone: '+1234567890',
                isUnlocked: false
            });
            expect(mockProvider.incrementContacts).toHaveBeenCalled();
            expect(emitNewContact).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 201, 'contact.sent', { contact: mockContact });
        });

        it('should throw error if provider not found', async () => {
            mockReq.body = { providerId: 'nonexistent' };

            Provider.findByPk.mockResolvedValue(null);

            await expect(createContact(mockReq, mockRes, mockNext)).rejects.toThrow('provider.notFound');
        });
    });

    describe('getReceivedContacts', () => {
        it('should get received contacts successfully', async () => {
            mockReq.query = { page: 1, limit: 10 };

            const mockProvider = { id: 'provider-123' };
            const mockContacts = {
                count: 5,
                rows: [
                    { id: 'contact-1', canBeViewedBy: jest.fn().mockResolvedValue(true), getMaskedData: jest.fn() },
                    { id: 'contact-2', canBeViewedBy: jest.fn().mockResolvedValue(false), getMaskedData: jest.fn().mockReturnValue({ id: 'contact-2', masked: true }) }
                ]
            };

            Provider.findOne.mockResolvedValue(mockProvider);
            Contact.findAndCountAll.mockResolvedValue(mockContacts);

            await getReceivedContacts(mockReq, mockRes, mockNext);

            expect(Provider.findOne).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
            expect(Contact.findAndCountAll).toHaveBeenCalledWith({
                where: { providerId: 'provider-123' },
                include: expect.any(Array),
                order: [['createdAt', 'DESC']],
                limit: 10,
                offset: 0
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'contact.list', expect.any(Object));
        });

        it('should throw error if provider not found', async () => {
            Provider.findOne.mockResolvedValue(null);

            await expect(getReceivedContacts(mockReq, mockRes, mockNext)).rejects.toThrow('provider.notFound');
        });
    });

    describe('getSentContacts', () => {
        it('should get sent contacts successfully', async () => {
            mockReq.query = { page: 1, limit: 10 };

            const mockContacts = {
                count: 3,
                rows: [{ id: 'contact-1' }]
            };

            Contact.findAndCountAll.mockResolvedValue(mockContacts);

            await getSentContacts(mockReq, mockRes, mockNext);

            expect(Contact.findAndCountAll).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                include: expect.any(Array),
                order: [['createdAt', 'DESC']],
                limit: 10,
                offset: 0
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'contact.list', expect.any(Object));
        });
    });

    describe('updateContactStatus', () => {
        it('should update contact status successfully', async () => {
            mockReq.params = { id: 'contact-123' };
            mockReq.body = { status: 'read' };

            const mockContact = {
                id: 'contact-123',
                provider: { userId: 'user-123' },
                userId: 'sender-123',
                senderEmail: 'sender@example.com',
                senderName: 'John Doe',
                save: jest.fn().mockResolvedValue()
            };

            Contact.findByPk.mockResolvedValue(mockContact);

            await updateContactStatus(mockReq, mockRes, mockNext);

            expect(mockContact.status).toBe('read');
            expect(mockContact.save).toHaveBeenCalledWith({ fields: ['status'] });
            expect(emitContactStatusChange).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'contact.statusUpdated', { contact: mockContact });
        });

        it('should throw error if contact not found', async () => {
            mockReq.params = { id: 'nonexistent' };
            mockReq.body = { status: 'read' };

            Contact.findByPk.mockResolvedValue(null);

            await expect(updateContactStatus(mockReq, mockRes, mockNext)).rejects.toThrow('contact.notFound');
        });
    });

    describe('getDailyContactStats', () => {
        it('should get daily contact stats successfully', async () => {
            const mockProvider = { id: 'provider-123' };
            const mockStats = [{ date: '2024-01-01', count: '5' }];

            Provider.findOne.mockResolvedValue(mockProvider);
            Contact.findAll.mockResolvedValue(mockStats);

            await getDailyContactStats(mockReq, mockRes, mockNext);

            expect(Provider.findOne).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
            expect(Contact.findAll).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'contact.list', expect.any(Object));
        });

        it('should throw error if provider not found', async () => {
            Provider.findOne.mockResolvedValue(null);

            await expect(getDailyContactStats(mockReq, mockRes, mockNext)).rejects.toThrow('provider.notFound');
        });
    });

    describe('initiateContactUnlock', () => {
        it('should initiate contact unlock successfully', async () => {
            mockReq.params = { id: 'contact-123' };

            const mockContact = {
                id: 'contact-123',
                provider: { userId: 'user-123' },
                senderName: 'John Doe',
                canBeViewedBy: jest.fn().mockResolvedValue(false)
            };

            const mockPayment = {
                id: 'payment-123',
                transactionId: 'txn-123',
                save: jest.fn().mockResolvedValue()
            };

            Contact.findByPk.mockResolvedValue(mockContact);
            Payment.create.mockResolvedValue(mockPayment);
            initializeCinetPayPayment.mockResolvedValue({
                data: { payment_url: 'http://pay.com', payment_token: 'token' }
            });

            await initiateContactUnlock(mockReq, mockRes, mockNext);

            expect(Contact.findByPk).toHaveBeenCalledWith('contact-123', expect.any(Object));
            expect(Payment.create).toHaveBeenCalled();
            expect(initializeCinetPayPayment).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'payment.initialized', expect.any(Object));
        });

        it('should throw error if contact already unlocked', async () => {
            mockReq.params = { id: 'contact-123' };

            const mockContact = {
                id: 'contact-123',
                provider: { userId: 'user-123' },
                canBeViewedBy: jest.fn().mockResolvedValue(true)
            };

            Contact.findByPk.mockResolvedValue(mockContact);

            await expect(initiateContactUnlock(mockReq, mockRes, mockNext)).rejects.toThrow('contact.alreadyUnlocked');
        });
    });

    describe('confirmContactUnlock', () => {
        it('should confirm contact unlock successfully', async () => {
            mockReq.params = { id: 'contact-123' };
            mockReq.body = { transactionId: 'txn-123' };

            const mockPayment = {
                id: 'payment-123',
                status: 'ACCEPTED'
            };

            const mockContact = {
                id: 'contact-123',
                save: jest.fn().mockResolvedValue()
            };

            Payment.findByTransactionId.mockResolvedValue(mockPayment);
            Contact.findByPk.mockResolvedValueOnce(mockContact).mockResolvedValueOnce(mockContact);

            await confirmContactUnlock(mockReq, mockRes, mockNext);

            expect(mockContact.isUnlocked).toBe(true);
            expect(mockContact.save).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'contact.unlocked', expect.any(Object));
        });

        it('should throw error if payment not confirmed', async () => {
            mockReq.body = { transactionId: 'txn-123' };

            const mockPayment = {
                status: 'PENDING'
            };

            Payment.findByTransactionId.mockResolvedValue(mockPayment);

            await expect(confirmContactUnlock(mockReq, mockRes, mockNext)).rejects.toThrow('payment.notConfirmed');
        });
    });
});
