/**
 * Provider Application Controller Unit Tests
 * Tests for provider application-related endpoints
 */

const {
    applyToBeProvider,
    getMyApplication,
    getApplications,
    reviewApplication,
    getApplicationDetails
} = require('../../src/controllers/providerApplicationController');

// Mock dependencies
jest.mock('../../src/models', () => ({
    User: {
        update: jest.fn(),
        findByPk: jest.fn()
    },
    Provider: {
        create: jest.fn(),
        findByPk: jest.fn()
    },
    ProviderApplication: {
        findOne: jest.fn(),
        findByPk: jest.fn(),
        findAndCountAll: jest.fn(),
        create: jest.fn()
    },
    Subscription: {
        create: jest.fn()
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

jest.mock('../../src/middlewares/audit', () => ({
    auditLogger: {
        documentsReviewed: jest.fn()
    }
}));

jest.mock('../../src/utils/helpers', () => ({
    i18nResponse: jest.fn(),
    extractPhotoUrls: jest.fn(),
    sendEmailSafely: jest.fn()
}));

jest.mock('../../src/utils/dbHelpers', () => ({
    withTransaction: jest.fn()
}));

jest.mock('../../src/config/cloudinary', () => ({
    uploadImage: jest.fn(),
    uploadDocument: jest.fn()
}));

jest.mock('../../src/config/email', () => ({
    sendEmail: jest.fn()
}));

jest.mock('../../src/utils/emailTemplates', () => ({
    applicationReceivedEmail: jest.fn(),
    providerApprovedEmail: jest.fn(),
    providerRejectedEmail: jest.fn()
}));

jest.mock('../../src/config/redis', () => ({
    delByPattern: jest.fn()
}));

const { ProviderApplication, User, Provider, Subscription } = require('../../src/models');
const { i18nResponse, extractPhotoUrls, sendEmailSafely } = require('../../src/utils/helpers');
const { withTransaction } = require('../../src/utils/dbHelpers');
const { uploadDocument } = require('../../src/config/cloudinary');
const { sendEmail } = require('../../src/config/email');
const cache = require('../../src/config/redis');

describe('Provider Application Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            body: {},
            params: {},
            query: {},
            user: { id: 'user-123', role: 'client', email: 'user@example.com', firstName: 'John' },
            files: {},
            t: jest.fn((key) => key)
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        mockNext = jest.fn();

        // Setup default mocks
        i18nResponse.mockImplementation(() => {});
        extractPhotoUrls.mockReturnValue([]);
        sendEmailSafely.mockImplementation((emailData) => sendEmail(emailData));
        uploadDocument.mockResolvedValue({ url: 'doc-url', publicId: 'doc-public-id' });
        sendEmail.mockResolvedValue({});
        cache.delByPattern.mockResolvedValue(1);
    });

    describe('applyToBeProvider', () => {
        it('should apply to become provider successfully', async () => {
            mockReq.body = {
                firstName: 'John',
                lastName: 'Doe',
                businessName: 'Test Business',
                description: 'Test description',
                location: 'Douala',
                cniNumber: '123456789'
            };
            mockReq.files = {
                imgcnirecto: [{ path: 'path1', originalname: 'cni1.jpg', fieldname: 'imgcnirecto' }]
            };

            const mockApplication = {
                id: 'app-123',
                businessName: 'Test Business',
                status: 'pending',
                createdAt: new Date()
            };

            ProviderApplication.findOne.mockResolvedValue(null); // No existing pending
            ProviderApplication.create.mockResolvedValue(mockApplication);

            await applyToBeProvider(mockReq, mockRes, mockNext);

            expect(ProviderApplication.findOne).toHaveBeenCalledWith({
                where: { userId: 'user-123', status: 'pending' }
            });
            expect(uploadDocument).toHaveBeenCalledWith('path1', 'aeli-services/applications');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 201, 'provider.applicationSubmitted', expect.any(Object));
        });

        it('should throw error if user is already provider', async () => {
            mockReq.user.role = 'provider';

            await expect(applyToBeProvider(mockReq, mockRes, mockNext)).rejects.toThrow('provider.alreadyProvider');
        });

        it('should throw error if pending application exists', async () => {
            const mockExistingApp = { id: 'existing-app' };

            ProviderApplication.findOne.mockResolvedValue(mockExistingApp);

            await expect(applyToBeProvider(mockReq, mockRes, mockNext)).rejects.toThrow('provider.applicationPending');
        });

        it('should throw error if CNI not provided', async () => {
            mockReq.files = {}; // No files

            ProviderApplication.findOne.mockResolvedValue(null);

            await expect(applyToBeProvider(mockReq, mockRes, mockNext)).rejects.toThrow('documents.cniRequired');
        });
    });

    describe('getMyApplication', () => {
        it('should get my application successfully', async () => {
            const mockApplication = {
                id: 'app-123',
                businessName: 'Test Business',
                status: 'pending'
            };

            ProviderApplication.findOne.mockResolvedValue(mockApplication);

            await getMyApplication(mockReq, mockRes, mockNext);

            expect(ProviderApplication.findOne).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                order: [['createdAt', 'DESC']]
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'provider.applicationStatus', { application: mockApplication });
        });

        it('should throw error if no application found', async () => {
            ProviderApplication.findOne.mockResolvedValue(null);

            await expect(getMyApplication(mockReq, mockRes, mockNext)).rejects.toThrow('provider.noApplication');
        });
    });

    describe('getApplications', () => {
        it('should get applications successfully', async () => {
            mockReq.query = { page: 1, limit: 20, status: 'pending' };

            const mockApplications = {
                count: 5,
                rows: [{ id: 'app-1', status: 'pending' }]
            };

            ProviderApplication.findAndCountAll.mockResolvedValue(mockApplications);

            await getApplications(mockReq, mockRes, mockNext);

            expect(ProviderApplication.findAndCountAll).toHaveBeenCalledWith({
                where: { status: 'pending' },
                include: expect.any(Array),
                order: [['createdAt', 'DESC']],
                limit: 20,
                offset: 0
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'admin.applicationsList', expect.any(Object));
        });
    });

    describe('reviewApplication', () => {
        it('should approve application successfully', async () => {
            mockReq.params = { id: 'app-123' };
            mockReq.body = { decision: 'approved', adminNotes: 'Approved' };

            const mockApplication = {
                id: 'app-123',
                status: 'pending',
                businessName: 'Test Business',
                save: jest.fn().mockResolvedValue(),
                user: { id: 'user-123', email: 'user@example.com', firstName: 'John' }
            };

            const mockProvider = { id: 'provider-123' };

            ProviderApplication.findByPk.mockResolvedValue(mockApplication);
            withTransaction.mockResolvedValue({ provider: mockProvider });

            await reviewApplication(mockReq, mockRes, mockNext);

            expect(ProviderApplication.findByPk).toHaveBeenCalledWith('app-123', {
                include: [{ model: User, as: 'user' }]
            });
            expect(withTransaction).toHaveBeenCalled();
            expect(sendEmail).toHaveBeenCalled();
            expect(cache.delByPattern).toHaveBeenCalledWith('route:/api/providers*');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'admin.applicationApproved', expect.any(Object));
        });

        it('should reject application successfully', async () => {
            mockReq.params = { id: 'app-123' };
            mockReq.body = { decision: 'rejected', rejectionReason: 'Invalid documents', adminNotes: 'Rejected' };

            const mockApplication = {
                id: 'app-123',
                status: 'pending',
                save: jest.fn().mockResolvedValue(),
                user: { id: 'user-123', email: 'user@example.com', firstName: 'John' }
            };

            ProviderApplication.findByPk.mockResolvedValue(mockApplication);

            await reviewApplication(mockReq, mockRes, mockNext);

            expect(mockApplication.status).toBe('rejected');
            expect(mockApplication.rejectionReason).toBe('Invalid documents');
            expect(mockApplication.save).toHaveBeenCalled();
            expect(sendEmail).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'admin.applicationRejected', { application: mockApplication });
        });

        it('should throw error if application not found', async () => {
            mockReq.params = { id: 'nonexistent' };
            mockReq.body = { decision: 'approved' };

            ProviderApplication.findByPk.mockResolvedValue(null);

            await expect(reviewApplication(mockReq, mockRes, mockNext)).rejects.toThrow('provider.applicationNotFound');
        });

        it('should throw error if invalid decision', async () => {
            mockReq.body = { decision: 'invalid' };

            await expect(reviewApplication(mockReq, mockRes, mockNext)).rejects.toThrow('common.invalidDecision');
        });
    });

    describe('getApplicationDetails', () => {
        it('should get application details successfully', async () => {
            mockReq.params = { id: 'app-123' };

            const mockApplication = {
                id: 'app-123',
                businessName: 'Test Business',
                status: 'pending'
            };

            ProviderApplication.findByPk.mockResolvedValue(mockApplication);

            await getApplicationDetails(mockReq, mockRes, mockNext);

            expect(ProviderApplication.findByPk).toHaveBeenCalledWith('app-123', {
                include: expect.any(Array)
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'admin.applicationDetails', { application: mockApplication });
        });

        it('should throw error if application not found', async () => {
            mockReq.params = { id: 'nonexistent' };

            ProviderApplication.findByPk.mockResolvedValue(null);

            await expect(getApplicationDetails(mockReq, mockRes, mockNext)).rejects.toThrow('provider.applicationNotFound');
        });
    });
});
