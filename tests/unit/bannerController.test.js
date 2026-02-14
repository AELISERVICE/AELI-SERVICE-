/**
 * Banner Controller Unit Tests
 * Tests for banner-related endpoints
 */

const {
    getActiveBanners,
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner
} = require('../../src/controllers/bannerController');

// Mock dependencies
jest.mock('../../src/models', () => ({
    Banner: {
        findByPk: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn()
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

jest.mock('../../src/middlewares/i18n', () => ({
    i18nResponse: jest.fn()
}));

jest.mock('../../src/config/cloudinary', () => ({
    deleteImage: jest.fn()
}));

jest.mock('../../src/config/redis', () => ({
    delByPattern: jest.fn()
}));

const { Banner } = require('../../src/models');
const { i18nResponse } = require('../../src/middlewares/i18n');
const { deleteImage } = require('../../src/config/cloudinary');
const { delByPattern } = require('../../src/config/redis');

describe('Banner Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            body: {},
            params: {},
            query: {},
            file: {
                path: 'uploads/banner-image.jpg',
                filename: 'banner-public-id'
            },
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
        deleteImage.mockResolvedValue('OK');
        delByPattern.mockResolvedValue(1);
    });

    describe('getActiveBanners', () => {
        it('should get active banners successfully', async () => {
            mockReq.query = { type: 'homepage' };

            const mockBanners = [
                { id: 'banner-1', title: 'Banner 1', type: 'homepage', isActive: true }
            ];

            Banner.findAll.mockResolvedValue(mockBanners);

            await getActiveBanners(mockReq, mockRes, mockNext);

            expect(Banner.findAll).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    isActive: true,
                    type: 'homepage'
                }),
                order: [['order', 'ASC'], ['created_at', 'DESC']]
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'success', { banners: mockBanners });
        });

        it('should get all active banners without type filter', async () => {
            const mockBanners = [
                { id: 'banner-1', title: 'Banner 1', isActive: true }
            ];

            Banner.findAll.mockResolvedValue(mockBanners);

            await getActiveBanners(mockReq, mockRes, mockNext);

            expect(Banner.findAll).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    isActive: true
                }),
                order: [['order', 'ASC'], ['created_at', 'DESC']]
            });
        });
    });

    describe('getAllBanners', () => {
        it('should get all banners successfully', async () => {
            const mockBanners = [
                { id: 'banner-1', title: 'Banner 1', isActive: true },
                { id: 'banner-2', title: 'Banner 2', isActive: false }
            ];

            Banner.findAll.mockResolvedValue(mockBanners);

            await getAllBanners(mockReq, mockRes, mockNext);

            expect(Banner.findAll).toHaveBeenCalledWith({
                order: [['order', 'ASC'], ['created_at', 'DESC']]
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'success', { banners: mockBanners });
        });
    });

    describe('createBanner', () => {
        it('should create banner successfully', async () => {
            const bannerData = {
                title: 'New Banner',
                description: 'Banner description',
                linkUrl: 'https://example.com',
                type: 'homepage',
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                order: 1,
                isActive: true
            };
            mockReq.body = bannerData;

            const mockBanner = {
                id: 'banner-123',
                ...bannerData,
                imageUrl: 'uploads/banner-image.jpg',
                publicId: 'banner-public-id'
            };

            Banner.create.mockResolvedValue(mockBanner);

            await createBanner(mockReq, mockRes, mockNext);

            expect(Banner.create).toHaveBeenCalledWith({
                title: 'New Banner',
                description: 'Banner description',
                linkUrl: 'https://example.com',
                type: 'homepage',
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                order: 1,
                isActive: true,
                imageUrl: 'uploads/banner-image.jpg',
                publicId: 'banner-public-id'
            });
            expect(delByPattern).toHaveBeenCalledWith('route:/api/banners*');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 201, 'banner.created', { banner: mockBanner });
        });

        it('should throw error if no file uploaded', async () => {
            mockReq.file = undefined;

            await expect(createBanner(mockReq, mockRes, mockNext)).rejects.toThrow('L\'illustration de la bannière est requise');
        });
    });

    describe('updateBanner', () => {
        it('should update banner successfully', async () => {
            mockReq.params = { id: 'banner-123' };
            mockReq.body = {
                title: 'Updated Banner',
                description: 'Updated description',
                isActive: false
            };
            mockReq.file = undefined; // No new image upload

            const mockBanner = {
                id: 'banner-123',
                title: 'Old Title',
                description: 'Old Description',
                linkUrl: 'old-url',
                type: 'old-type',
                startDate: null,
                endDate: null,
                order: 0,
                isActive: true,
                publicId: 'old-public-id',
                update: jest.fn().mockResolvedValue()
            };

            Banner.findByPk.mockResolvedValue(mockBanner);

            await updateBanner(mockReq, mockRes, mockNext);

            expect(mockBanner.update).toHaveBeenCalledWith({
                title: 'Updated Banner',
                description: 'Updated description',
                linkUrl: 'old-url',
                type: 'old-type',
                startDate: null,
                endDate: null,
                order: 0,
                isActive: false
            });
            expect(delByPattern).toHaveBeenCalledWith('route:/api/banners*');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'banner.updated', { banner: mockBanner });
        });

        it('should update banner with new image', async () => {
            mockReq.params = { id: 'banner-123' };
            mockReq.body = { title: 'New Title' };
            mockReq.file = {
                path: 'uploads/new-image.jpg',
                filename: 'new-public-id'
            };

            const mockBanner = {
                id: 'banner-123',
                title: 'Old Title',
                publicId: 'old-public-id',
                update: jest.fn().mockResolvedValue()
            };

            Banner.findByPk.mockResolvedValue(mockBanner);
            deleteImage.mockResolvedValue('OK');

            await updateBanner(mockReq, mockRes, mockNext);

            expect(deleteImage).toHaveBeenCalledWith('old-public-id');
            expect(mockBanner.update).toHaveBeenCalledWith({
                title: 'New Title',
                description: undefined,
                linkUrl: undefined,
                type: undefined,
                startDate: undefined,
                endDate: undefined,
                order: undefined,
                isActive: undefined,
                imageUrl: 'uploads/new-image.jpg',
                publicId: 'new-public-id'
            });
        });

        it('should throw error if banner not found', async () => {
            mockReq.params = { id: 'nonexistent' };

            Banner.findByPk.mockResolvedValue(null);

            await expect(updateBanner(mockReq, mockRes, mockNext)).rejects.toThrow('Bannière non trouvée');
        });
    });

    describe('deleteBanner', () => {
        it('should delete banner successfully', async () => {
            mockReq.params = { id: 'banner-123' };

            const mockBanner = {
                id: 'banner-123',
                publicId: 'banner-public-id',
                destroy: jest.fn().mockResolvedValue()
            };

            Banner.findByPk.mockResolvedValue(mockBanner);

            await deleteBanner(mockReq, mockRes, mockNext);

            expect(deleteImage).toHaveBeenCalledWith('banner-public-id');
            expect(mockBanner.destroy).toHaveBeenCalled();
            expect(delByPattern).toHaveBeenCalledWith('route:/api/banners*');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'banner.deleted');
        });

        it('should delete banner without image', async () => {
            mockReq.params = { id: 'banner-123' };

            const mockBanner = {
                id: 'banner-123',
                publicId: null,
                destroy: jest.fn().mockResolvedValue()
            };

            Banner.findByPk.mockResolvedValue(mockBanner);

            await deleteBanner(mockReq, mockRes, mockNext);

            expect(deleteImage).not.toHaveBeenCalled();
            expect(mockBanner.destroy).toHaveBeenCalled();
        });

        it('should throw error if banner not found', async () => {
            mockReq.params = { id: 'nonexistent' };

            Banner.findByPk.mockResolvedValue(null);

            await expect(deleteBanner(mockReq, mockRes, mockNext)).rejects.toThrow('Bannière non trouvée');
        });
    });
});
