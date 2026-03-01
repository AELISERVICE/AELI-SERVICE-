/**
 * Provider Controller Unit Tests
 * Tests for provider-related endpoints
 */

const { Op } = require('sequelize');
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
    },
    ProviderApplication: {
        findByPk: jest.fn(),
        findOne: jest.fn()
    }
}));

jest.mock('../../src/utils/logger', () => ({
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
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
    extractPhotoUrls: jest.fn(),
    sendEmailSafely: jest.fn().mockResolvedValue({})
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

const { Provider, User, Service, Subscription, Review, Contact, ProviderApplication } = require('../../src/models');
const { i18nResponse, getPaginationParams, getPaginationData, buildSortOrder, extractPhotoUrls, sendEmailSafely } = require('../../src/utils/helpers');
const cache = require('../../src/config/redis');
const { deleteImage, getPublicIdFromUrl, uploadDocument } = require('../../src/config/cloudinary');
const { documentsReceivedEmail } = require('../../src/utils/emailTemplates');

jest.mock('../../src/utils/emailTemplates', () => ({
    documentsReceivedEmail: jest.fn().mockReturnValue({ subject: 'test', html: 'test' })
}));

// Already mocked above

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
        i18nResponse.mockImplementation(() => { });
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
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 201, 'provider.created', expect.anything());
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
                rows: [
                    { id: 'provider-1', toJSON: function () { return { id: this.id }; } },
                    { id: 'provider-2', toJSON: function () { return { id: this.id }; } }
                ]
            };

            Provider.findAndCountAll.mockResolvedValue(mockProviders);

            await getProviders(mockReq, mockRes, mockNext);

            expect(Provider.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: { isVerified: true, isActive: true },
                include: expect.anything(),
                order: [['createdAt', 'DESC']],
                limit: 12,
                offset: 0,
                distinct: true
            }));
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'provider.list', expect.anything());
        });

        it('should filter providers by category, search, and location', async () => {
            mockReq.query = {
                category: 'cat-123',
                search: 'plumber',
                location: 'Yaoundé',
                verified: 'true',
                featured: 'true'
            };

            Provider.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });

            Provider.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });

            await getProviders(mockReq, mockRes, mockNext);

            expect(Provider.findAndCountAll).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalled();
        });

        it('should handle sorting', async () => {
            mockReq.query = { sort: 'rating', order: 'asc' };
            buildSortOrder.mockReturnValue([['averageRating', 'ASC']]);
            Provider.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

            await getProviders(mockReq, mockRes, mockNext);

            expect(buildSortOrder).toHaveBeenCalled();
            expect(Provider.findAndCountAll).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalled();
        });

        it('should filter providers by price range', async () => {
            mockReq.query = {
                minPrice: '1000',
                maxPrice: '5000'
            };
            Provider.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });

            await getProviders(mockReq, mockRes, mockNext);

            expect(Provider.findAndCountAll).toHaveBeenCalled();
            // Verify that at least one of the calls to Provider.findAndCountAll includes the price subquery
            const lastCallArgs = Provider.findAndCountAll.mock.calls[Provider.findAndCountAll.mock.calls.length - 1][0];
            expect(lastCallArgs.where[Op.and]).toBeDefined();
        });

        it('should handle price sorting', async () => {
            mockReq.query = { sort: 'price_asc' };
            buildSortOrder.mockReturnValue([['min_price', 'ASC']]);
            Provider.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });

            await getProviders(mockReq, mockRes, mockNext);

            expect(buildSortOrder).toHaveBeenCalledWith('price_asc');
            expect(Provider.findAndCountAll).toHaveBeenCalled();
            const lastCallArgs = Provider.findAndCountAll.mock.calls[Provider.findAndCountAll.mock.calls.length - 1][0];
            expect(lastCallArgs.attributes.include).toBeDefined();
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

            expect(Provider.findByPk).toHaveBeenCalledWith('provider-123', expect.anything());
            expect(Service.findAll).toHaveBeenCalled();
            expect(Review.findAll).toHaveBeenCalled();
            expect(Subscription.getStatus).toHaveBeenCalledWith('provider-123');
            expect(mockProvider.incrementViews).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'provider.details', expect.anything());
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

        it('should handle photo upload and respect limit', async () => {
            mockReq.params = { id: 'provider-123' };
            mockReq.files = [{}, {}]; // 2 new photos
            const mockProvider = {
                id: 'provider-123',
                userId: 'user-123',
                photos: ['p1.jpg', 'p2.jpg', 'p3.jpg', 'p4.jpg'], // 4 existing
                save: jest.fn().mockResolvedValue()
            };

            Provider.findByPk.mockResolvedValue(mockProvider);
            extractPhotoUrls.mockReturnValue(['p5.jpg', 'p6.jpg']);

            await expect(updateProvider(mockReq, mockRes, mockNext)).rejects.toThrow('documents.maxDocuments');
        });

        it('should handle logo update and delete old one', async () => {
            mockReq.params = { id: 'provider-123' };
            mockReq.file = { path: 'new-logo.png' };
            const mockProvider = {
                id: 'provider-123',
                userId: 'user-123',
                profilePhoto: 'old-logo.png',
                save: jest.fn().mockResolvedValue()
            };

            Provider.findByPk.mockResolvedValue(mockProvider);
            getPublicIdFromUrl.mockReturnValue('old-logo-id');
            deleteImage.mockResolvedValue();

            await updateProvider(mockReq, mockRes, mockNext);

            expect(deleteImage).toHaveBeenCalledWith('old-logo-id');
            expect(mockProvider.profilePhoto).toBe('new-logo.png');
            expect(mockProvider.save).toHaveBeenCalled();
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
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'provider.dashboard', expect.anything());
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

    describe('deleteProviderPhoto', () => {
        it('should delete a photo successfully', async () => {
            mockReq.params = { id: 'provider-123', photoIndex: '0' };
            const mockProvider = {
                id: 'provider-123',
                userId: 'user-123',
                photos: ['photo1.jpg', 'photo2.jpg'],
                save: jest.fn().mockResolvedValue()
            };

            Provider.findByPk.mockResolvedValue(mockProvider);
            getPublicIdFromUrl.mockReturnValue('photo1');
            deleteImage.mockResolvedValue();

            await deleteProviderPhoto(mockReq, mockRes, mockNext);

            expect(mockProvider.photos).toHaveLength(1);
            expect(mockProvider.photos[0]).toBe('photo2.jpg');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'provider.photoDeleted', expect.anything());
        });
    });

    describe('getMyProfile', () => {
        it('should get own profile successfully', async () => {
            const mockProvider = {
                id: 'provider-123',
                userId: 'user-123',
                businessName: 'My Business'
            };

            Provider.findOne.mockResolvedValue(mockProvider);

            await getMyProfile(mockReq, mockRes, mockNext);

            expect(Provider.findOne).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'user.profile', { provider: mockProvider });
        });
    });

    describe('Document Management', () => {
        describe('uploadDocuments', () => {
            it('should upload documents successfully', async () => {
                mockReq.params = { id: 'provider-123' };
                mockReq.body = { documentType: 'cni' };
                mockReq.files = [{ path: 'doc1.pdf', originalname: 'doc1.pdf' }];

                const mockProvider = {
                    id: 'provider-123',
                    userId: 'user-123',
                    isVerified: false,
                    documents: [],
                    save: jest.fn().mockResolvedValue()
                };
                Provider.findByPk.mockResolvedValue(mockProvider);
                uploadDocument.mockResolvedValue({ url: 'cloudinary-url', publicId: 'pid', format: 'pdf' });
                User.findByPk.mockResolvedValue({ id: 'user-123', email: 'test@example.com', firstName: 'Test' });

                await uploadDocuments(mockReq, mockRes, mockNext);

                expect(mockProvider.documents).toHaveLength(1);
                expect(mockProvider.verificationStatus).toBe('under_review');
                expect(mockProvider.save).toHaveBeenCalled();
                expect(i18nResponse).toHaveBeenCalled();
                const lastCall = i18nResponse.mock.calls[i18nResponse.mock.calls.length - 1];
                expect(lastCall[2]).toBe(201);
                expect(lastCall[3]).toBe('documents.submitted');
            });
        });

        describe('getDocuments', () => {
            it('should get provider documents', async () => {
                mockReq.params = { id: 'provider-123' };
                const mockProvider = {
                    id: 'provider-123',
                    userId: 'user-123',
                    documents: [{ type: 'cni', url: 'url' }]
                };
                Provider.findByPk.mockResolvedValue(mockProvider);

                await getDocuments(mockReq, mockRes, mockNext);

                expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'documents.list', expect.anything());
            });
        });

        describe('deleteDocument', () => {
            it('should delete a document', async () => {
                mockReq.params = { id: 'provider-123', docIndex: '0' };
                const mockProvider = {
                    id: 'provider-123',
                    userId: 'user-123',
                    isVerified: false,
                    documents: [{ publicId: 'doc-id', type: 'cni' }],
                    save: jest.fn().mockResolvedValue()
                };
                Provider.findByPk.mockResolvedValue(mockProvider);
                deleteImage.mockResolvedValue();

                await deleteDocument(mockReq, mockRes, mockNext);

                expect(mockProvider.documents).toHaveLength(0);
                expect(mockProvider.verificationStatus).toBe('pending');
                expect(deleteImage).toHaveBeenCalledWith('doc-id');
                expect(mockProvider.save).toHaveBeenCalled();
            });
        });
    });
});
