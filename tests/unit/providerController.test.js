/**
 * Provider Controller Unit Tests
 * Tests for provider-related endpoints
 */

const {
    createProvider,
    getProviders,
    getProviderById,
    updateProvider,
    deleteProviderPhoto,
    getMyProfile,
    getMyDashboard,
    uploadDocuments,
    getDocuments,
    deleteDocument
} = require('../../src/controllers/providerController');

// Mock dependencies
jest.mock('../../src/models', () => ({
    sequelize: {},
    User: {
        findByPk: jest.fn(),
        findOne: jest.fn()
    },
    Provider: {
        findOne: jest.fn(),
        findByPk: jest.fn(),
        findAndCountAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn()
    },
    Service: {
        findAll: jest.fn()
    },
    Category: {},
    Subscription: {
        createTrial: jest.fn(),
        getStatus: jest.fn()
    },
    Review: {
        findAll: jest.fn()
    },
    Contact: {
        findAll: jest.fn(),
        count: jest.fn()
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
    successResponse: jest.fn(),
    i18nResponse: jest.fn(),
    getPaginationParams: jest.fn(),
    getPaginationData: jest.fn(),
    buildSortOrder: jest.fn(),
    extractPhotoUrls: jest.fn()
}));

jest.mock('../../src/config/cloudinary', () => ({
    deleteImage: jest.fn(),
    getPublicIdFromUrl: jest.fn(),
    uploadDocument: jest.fn()
}));

jest.mock('../../src/config/redis', () => ({
    delByPattern: jest.fn()
}));

jest.mock('sequelize', () => ({
    Op: {
        iLike: Symbol('iLike'),
        gte: Symbol('gte'),
        or: Symbol('or'),
        and: Symbol('and'),
        in: Symbol('in')
    },
    fn: jest.fn(),
    col: jest.fn(),
    literal: jest.fn()
}));

const { Provider, User, Service, Subscription, Review, Contact } = require('../../src/models');
const { i18nResponse, getPaginationParams, getPaginationData, buildSortOrder, extractPhotoUrls } = require('../../src/utils/helpers');
const cache = require('../../src/config/redis');
const { deleteImage, getPublicIdFromUrl, uploadDocument } = require('../../src/config/cloudinary');

describe('Provider Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            body: {},
            params: {},
            query: {},
            user: { id: 'user-123', role: 'provider' },
            files: [],
            t: jest.fn((key) => key)
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        mockNext = jest.fn();

        // Setup default mocks
        i18nResponse.mockImplementation(() => {});
        getPaginationParams.mockReturnValue({ limit: 12, offset: 0 });
        getPaginationData.mockReturnValue({ page: 1, totalPages: 1 });
        buildSortOrder.mockReturnValue([['createdAt', 'DESC']]);
        extractPhotoUrls.mockReturnValue(['photo1.jpg', 'photo2.jpg']);
        Subscription.getStatus.mockResolvedValue({ isActive: true });
    });

    describe('createProvider', () => {
        it('should create provider successfully', async () => {
            const providerData = {
                businessName: 'Test Business',
                description: 'Test Description',
                location: 'Yaoundé',
                address: 'Test Address',
                whatsapp: '+237699123456',
                facebook: 'https://facebook.com/test',
                instagram: 'https://instagram.com/test'
            };
            mockReq.body = providerData;
            mockReq.files = [{}, {}]; // Mock files

            const mockProvider = {
                id: 'provider-123',
                ...providerData,
                photos: ['photo1.jpg', 'photo2.jpg'],
                save: jest.fn().mockResolvedValue()
            };

            Provider.findOne.mockResolvedValue(null);
            Provider.create.mockResolvedValue(mockProvider);
            Subscription.createTrial.mockResolvedValue();
            cache.delByPattern.mockResolvedValue();

            await createProvider(mockReq, mockRes, mockNext);

            expect(Provider.findOne).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
            expect(Provider.create).toHaveBeenCalledWith({
                userId: 'user-123',
                ...providerData,
                photos: ['photo1.jpg', 'photo2.jpg']
            });
            expect(Subscription.createTrial).toHaveBeenCalledWith('provider-123');
            expect(cache.delByPattern).toHaveBeenCalledWith('providers:list:*');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 201, 'provider.created', expect.any(Object));
        });

        it('should throw error if provider already exists', async () => {
            Provider.findOne.mockResolvedValue({ id: 'existing-provider' });

            await expect(createProvider(mockReq, mockRes, mockNext)).rejects.toThrow('provider.alreadyExists');
        });
    });

    describe('getProviders', () => {
        it('should get providers successfully', async () => {
            mockReq.query = { page: 1, limit: 12 };

            const mockProviders = {
                count: 5,
                rows: [{ id: 'provider-1' }, { id: 'provider-2' }]
            };

            Provider.findAndCountAll.mockResolvedValue(mockProviders);

            await getProviders(mockReq, mockRes, mockNext);

            expect(Provider.findAndCountAll).toHaveBeenCalledWith({
                where: { isVerified: true },
                include: expect.any(Array),
                order: [['createdAt', 'DESC']],
                limit: 12,
                offset: 0,
                distinct: true
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'provider.list', expect.any(Object));
        });
    });

    describe('getProviderById', () => {
        it('should get provider by id successfully', async () => {
            mockReq.params = { id: 'provider-123' };

            const mockProvider = {
                id: 'provider-123',
                toJSON: jest.fn().mockReturnValue({ id: 'provider-123' }),
                incrementViews: jest.fn().mockResolvedValue()
            };

            Provider.findByPk.mockResolvedValue(mockProvider);
            Service.findAll.mockResolvedValue([]);
            Review.findAll.mockResolvedValue([]);

            await getProviderById(mockReq, mockRes, mockNext);

            expect(Provider.findByPk).toHaveBeenCalledWith('provider-123', expect.any(Object));
            expect(Service.findAll).toHaveBeenCalled();
            expect(Review.findAll).toHaveBeenCalled();
            expect(Subscription.getStatus).toHaveBeenCalledWith('provider-123');
            expect(mockProvider.incrementViews).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'provider.details', expect.any(Object));
        });

        it('should throw error if provider not found', async () => {
            mockReq.params = { id: 'nonexistent' };

            Provider.findByPk.mockResolvedValue(null);

            await expect(getProviderById(mockReq, mockRes, mockNext)).rejects.toThrow('provider.notFound');
        });
    });

    describe('updateProvider', () => {
        it('should update provider successfully', async () => {
            mockReq.params = { id: 'provider-123' };
            mockReq.body = { businessName: 'Updated Business' };

            const mockProvider = {
                id: 'provider-123',
                userId: 'user-123',
                businessName: 'Old Business',
                save: jest.fn().mockResolvedValue()
            };

            Provider.findByPk.mockResolvedValue(mockProvider);
            cache.delByPattern.mockResolvedValue();

            await updateProvider(mockReq, mockRes, mockNext);

            expect(mockProvider.businessName).toBe('Updated Business');
            expect(mockProvider.save).toHaveBeenCalled();
            expect(cache.delByPattern).toHaveBeenCalledWith('route:/api/providers*');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'provider.updated', { provider: mockProvider });
        });

        it('should throw error if provider not found', async () => {
            mockReq.params = { id: 'nonexistent' };

            Provider.findByPk.mockResolvedValue(null);

            await expect(updateProvider(mockReq, mockRes, mockNext)).rejects.toThrow('provider.notFound');
        });
    });

    describe('getMyDashboard', () => {
        it('should get dashboard successfully', async () => {
            const mockProvider = {
                id: 'provider-123',
                viewsCount: 100,
                contactsCount: 50,
                totalReviews: 10,
                averageRating: 4.5,
                isVerified: true,
                isFeatured: false,
                verificationStatus: 'approved'
            };

            Provider.findOne.mockResolvedValue(mockProvider);
            Contact.findAll.mockResolvedValue([]);
            Review.findAll.mockResolvedValue([]);
            Contact.count.mockResolvedValue(5);

            await getMyDashboard(mockReq, mockRes, mockNext);

            expect(Provider.findOne).toHaveBeenCalledWith({
                where: { userId: 'user-123' }
            });
            expect(Contact.findAll).toHaveBeenCalled();
            expect(Review.findAll).toHaveBeenCalled();
            expect(Contact.count).toHaveBeenCalledWith({
                where: { providerId: 'provider-123', status: 'pending' }
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'provider.dashboard', expect.any(Object));
        });

        it('should throw error if user not authenticated', async () => {
            mockReq.user = null;

            await expect(getMyDashboard(mockReq, mockRes, mockNext)).rejects.toThrow('Authentication required.');
        });

        it('should throw error if user not provider', async () => {
            mockReq.user.role = 'client';

            await expect(getMyDashboard(mockReq, mockRes, mockNext)).rejects.toThrow('Access denied. Provider role required.');
        });

        it('should throw error if provider not found', async () => {
            Provider.findOne.mockResolvedValue(null);

            await expect(getMyDashboard(mockReq, mockRes, mockNext)).rejects.toThrow('provider.notFound');
        });
    });
});
