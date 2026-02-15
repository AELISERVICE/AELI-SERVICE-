/**
 * Admin Controller Unit Tests
 * Tests for admin-related endpoints
 */

const {
    getStats,
    getPendingProviders,
    verifyProvider,
    featureProvider,
    updateUserStatus,
    getAllReviews,
    updateReviewVisibility,
    getAllUsers,
    getProvidersUnderReview,
    reviewProviderDocuments
} = require('../../src/controllers/adminController');

// Mock dependencies
jest.mock('../../src/models', () => ({
    User: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        findAndCountAll: jest.fn()
    },
    Provider: {
        findOne: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn(),
        findAndCountAll: jest.fn()
    },
    Service: {
        count: jest.fn()
    },
    Review: {
        findOne: jest.fn(),
        findByPk: jest.fn(),
        findAndCountAll: jest.fn()
    },
    Contact: {
        findAll: jest.fn()
    },
    Category: {
        findAll: jest.fn()
    },
    Payment: {
        findAll: jest.fn()
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
        providerVerified: jest.fn(),
        userStatusChanged: jest.fn(),
        reviewModerated: jest.fn(),
        documentsReviewed: jest.fn()
    }
}));

jest.mock('../../src/utils/helpers', () => ({
    i18nResponse: jest.fn(),
    getPaginationParams: jest.fn(),
    getPaginationData: jest.fn(),
    sendEmailSafely: jest.fn()
}));

jest.mock('../../src/config/email', () => ({
    sendEmail: jest.fn()
}));

jest.mock('../../src/utils/emailTemplates', () => ({
    accountVerifiedEmail: jest.fn(),
    providerFeaturedEmail: jest.fn(),
    documentsRejectedEmail: jest.fn()
}));

jest.mock('../../src/config/redis', () => ({
    delByPattern: jest.fn()
}));

const { User, Provider, Service, Review, Contact, Payment } = require('../../src/models');
const { i18nResponse, getPaginationParams, getPaginationData, sendEmailSafely } = require('../../src/utils/helpers');
const { sendEmail } = require('../../src/config/email');
const { delByPattern } = require('../../src/config/redis');

describe('Admin Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            body: {},
            params: {},
            query: {},
            user: { id: 'admin-123', role: 'admin' },
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
        sendEmailSafely.mockImplementation((emailData) => sendEmail(emailData));
        sendEmail.mockResolvedValue({});
        delByPattern.mockResolvedValue(1);
    });

    describe('getStats', () => {
        it('should get platform statistics successfully', async () => {
            const mockUserStats = [
                { role: 'client', count: '5' },
                { role: 'provider', count: '3' }
            ];
            const mockProviderStats = {
                total: '8',
                active: '6',
                pending: '2',
                featured: '1'
            };
            const mockReviewStats = {
                total: '25',
                avgRating: '4.2'
            };
            const mockContactStats = [
                { status: 'pending', count: '10' },
                { status: 'read', count: '15' }
            ];
            const mockPaymentStats = [
                { status: 'accepted', count: '20', totalAmount: '50000' }
            ];

            User.findAll.mockResolvedValue(mockUserStats);
            Provider.findOne.mockResolvedValue(mockProviderStats);
            Service.count.mockResolvedValue(12);
            Review.findOne.mockResolvedValue(mockReviewStats);
            Contact.findAll.mockResolvedValue(mockContactStats);
            Payment.findAll.mockResolvedValue(mockPaymentStats);
            User.findAll.mockResolvedValueOnce([]).mockResolvedValueOnce([]); // Recent users and providers

            await getStats(mockReq, mockRes, mockNext);

            expect(User.findAll).toHaveBeenCalledWith({
                attributes: expect.any(Array),
                group: ['role'],
                raw: true
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'admin.stats', expect.any(Object));
        });
    });

    describe('getPendingProviders', () => {
        it('should get pending providers successfully', async () => {
            mockReq.query = { page: 1, limit: 10 };

            const mockProviders = {
                count: 5,
                rows: [{ id: 'provider-1', businessName: 'Provider 1' }]
            };

            Provider.findAndCountAll.mockResolvedValue(mockProviders);

            await getPendingProviders(mockReq, mockRes, mockNext);

            expect(Provider.findAndCountAll).toHaveBeenCalledWith({
                where: { isVerified: false },
                include: expect.any(Array),
                order: [['createdAt', 'ASC']],
                limit: 10,
                offset: 0
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'admin.providersUnderReview', expect.any(Object));
        });
    });

    describe('verifyProvider', () => {
        it('should verify provider successfully', async () => {
            mockReq.params = { id: 'provider-123' };
            mockReq.body = { isVerified: true };

            const mockProvider = {
                id: 'provider-123',
                businessName: 'Test Provider',
                isVerified: false,
                save: jest.fn().mockResolvedValue(),
                user: { email: 'provider@example.com', firstName: 'John' }
            };

            Provider.findByPk.mockResolvedValue(mockProvider);

            await verifyProvider(mockReq, mockRes, mockNext);

            expect(mockProvider.isVerified).toBe(true);
            expect(mockProvider.save).toHaveBeenCalledWith({ fields: ['isVerified'] });
            expect(delByPattern).toHaveBeenCalledWith('route:/api/providers*');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'provider.verified', { provider: mockProvider });
        });

        it('should throw error if provider not found', async () => {
            mockReq.params = { id: 'nonexistent' };

            Provider.findByPk.mockResolvedValue(null);

            await expect(verifyProvider(mockReq, mockRes, mockNext)).rejects.toThrow('provider.notFound');
        });
    });

    describe('featureProvider', () => {
        it('should feature provider successfully', async () => {
            mockReq.params = { id: 'provider-123' };
            mockReq.body = { isFeatured: true };

            const mockProvider = {
                id: 'provider-123',
                businessName: 'Test Provider',
                isFeatured: false,
                save: jest.fn().mockResolvedValue(),
                user: { email: 'provider@example.com', firstName: 'John' }
            };

            Provider.findByPk.mockResolvedValue(mockProvider);

            await featureProvider(mockReq, mockRes, mockNext);

            expect(mockProvider.isFeatured).toBe(true);
            expect(mockProvider.save).toHaveBeenCalledWith({ fields: ['isFeatured'] });
            expect(delByPattern).toHaveBeenCalledWith('route:/api/providers*');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'provider.featured', { provider: mockProvider });
        });
    });

    describe('updateUserStatus', () => {
        it('should update user status successfully', async () => {
            mockReq.params = { id: 'user-123' };
            mockReq.body = { isActive: false };

            const mockUser = {
                id: 'user-123',
                firstName: 'John',
                isActive: true,
                save: jest.fn().mockResolvedValue(),
                toPublicJSON: jest.fn().mockReturnValue({ id: 'user-123', firstName: 'John' })
            };

            User.findByPk.mockResolvedValue(mockUser);

            await updateUserStatus(mockReq, mockRes, mockNext);

            expect(mockUser.isActive).toBe(false);
            expect(mockUser.save).toHaveBeenCalledWith({ fields: ['isActive'] });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'admin.userDeactivated', expect.any(Object));
        });

        it('should throw error if user not found', async () => {
            mockReq.params = { id: 'nonexistent' };

            User.findByPk.mockResolvedValue(null);

            await expect(updateUserStatus(mockReq, mockRes, mockNext)).rejects.toThrow('user.notFound');
        });

        it('should throw error if admin tries to deactivate themselves', async () => {
            mockReq.params = { id: 'admin-123' }; // Same as req.user.id
            mockReq.body = { isActive: false };

            const mockUser = {
                id: 'admin-123',
                isActive: true
            };

            User.findByPk.mockResolvedValue(mockUser);

            await expect(updateUserStatus(mockReq, mockRes, mockNext)).rejects.toThrow('admin.cannotDeactivateSelf');
        });
    });

    describe('getAllReviews', () => {
        it('should get all reviews successfully', async () => {
            mockReq.query = { page: 1, limit: 20, visible: 'true' };

            const mockReviews = {
                count: 25,
                rows: [{ id: 'review-1', rating: 5 }]
            };

            Review.findAndCountAll.mockResolvedValue(mockReviews);

            await getAllReviews(mockReq, mockRes, mockNext);

            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'review.list', expect.any(Object));
        });
    });

    describe('updateReviewVisibility', () => {
        it('should update review visibility successfully', async () => {
            mockReq.params = { id: 'review-123' };
            mockReq.body = { isVisible: false };

            const mockReview = {
                id: 'review-123',
                providerId: 'provider-123',
                isVisible: true,
                save: jest.fn().mockResolvedValue()
            };

            const mockProvider = {
                id: 'provider-123',
                updateRating: jest.fn().mockResolvedValue()
            };

            Review.findByPk.mockResolvedValue(mockReview);
            Provider.findByPk.mockResolvedValue(mockProvider);

            await updateReviewVisibility(mockReq, mockRes, mockNext);

            expect(mockReview.isVisible).toBe(false);
            expect(mockReview.save).toHaveBeenCalledWith({ fields: ['isVisible'] });
            expect(mockProvider.updateRating).toHaveBeenCalledWith(null, false);
            expect(delByPattern).toHaveBeenCalledWith('route:/api/providers*');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'review.hidden', { review: mockReview });
        });

        it('should throw error if review not found', async () => {
            mockReq.params = { id: 'nonexistent' };

            Review.findByPk.mockResolvedValue(null);

            await expect(updateReviewVisibility(mockReq, mockRes, mockNext)).rejects.toThrow('review.notFound');
        });
    });

    describe('getAllUsers', () => {
        it('should get all users successfully', async () => {
            mockReq.query = { page: 1, limit: 20, role: 'client', search: 'john' };

            const mockUsers = {
                count: 50,
                rows: [{ id: 'user-1', firstName: 'John' }]
            };

            User.findAndCountAll.mockResolvedValue(mockUsers);

            await getAllUsers(mockReq, mockRes, mockNext);

            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'common.list', expect.any(Object));
        });
    });

    describe('getProvidersUnderReview', () => {
        it('should get providers under review successfully', async () => {
            mockReq.query = { page: 1, limit: 10 };

            const mockProviders = {
                count: 3,
                rows: [{ id: 'provider-1', verificationStatus: 'under_review' }]
            };

            Provider.findAndCountAll.mockResolvedValue(mockProviders);

            await getProvidersUnderReview(mockReq, mockRes, mockNext);

            expect(Provider.findAndCountAll).toHaveBeenCalledWith({
                where: { verificationStatus: 'under_review' },
                include: expect.any(Array),
                order: [['createdAt', 'ASC']],
                limit: 10,
                offset: 0
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'admin.providersUnderReview', expect.any(Object));
        });
    });

    describe('reviewProviderDocuments', () => {
        it('should approve provider documents successfully', async () => {
            mockReq.params = { id: 'provider-123' };
            mockReq.body = {
                decision: 'approved',
                approvedDocuments: [0, 1],
                notes: 'All documents approved'
            };

            const mockProvider = {
                id: 'provider-123',
                businessName: 'Test Provider',
                verificationStatus: 'under_review',
                documents: [
                    { type: 'id', status: 'pending' },
                    { type: 'license', status: 'pending' }
                ],
                save: jest.fn().mockResolvedValue(),
                user: { email: 'provider@example.com', firstName: 'John' }
            };

            Provider.findByPk.mockResolvedValue(mockProvider);

            await reviewProviderDocuments(mockReq, mockRes, mockNext);

            expect(mockProvider.verificationStatus).toBe('approved');
            expect(mockProvider.isVerified).toBe(true);
            expect(mockProvider.documents[0].status).toBe('approved');
            expect(mockProvider.documents[1].status).toBe('approved');
            expect(mockProvider.save).toHaveBeenCalled();
            expect(delByPattern).toHaveBeenCalledWith('route:/api/providers*');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'documents.approved', expect.any(Object));
        });

        it('should reject provider documents successfully', async () => {
            mockReq.params = { id: 'provider-123' };
            mockReq.body = {
                decision: 'rejected',
                rejectedDocuments: [
                    { index: 0, reason: 'Invalid document' }
                ],
                notes: 'Document rejected'
            };

            const mockProvider = {
                id: 'provider-123',
                businessName: 'Test Provider',
                verificationStatus: 'under_review',
                documents: [
                    { type: 'id', status: 'pending' }
                ],
                save: jest.fn().mockResolvedValue(),
                user: { email: 'provider@example.com', firstName: 'John' }
            };

            Provider.findByPk.mockResolvedValue(mockProvider);

            await reviewProviderDocuments(mockReq, mockRes, mockNext);

            expect(mockProvider.verificationStatus).toBe('rejected');
            expect(mockProvider.isVerified).toBe(false);
            expect(mockProvider.documents[0].status).toBe('rejected');
            expect(mockProvider.documents[0].rejectionReason).toBe('Invalid document');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'documents.rejected', expect.any(Object));
        });

        it('should throw error if provider not found', async () => {
            mockReq.params = { id: 'nonexistent' };

            Provider.findByPk.mockResolvedValue(null);

            await expect(reviewProviderDocuments(mockReq, mockRes, mockNext)).rejects.toThrow('provider.notFound');
        });
    });
});
