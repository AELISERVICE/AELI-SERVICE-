/**
 * Favorite Controller Unit Tests
 * Tests for favorite-related endpoints
 */

const {
    addFavorite,
    getFavorites,
    removeFavorite,
    checkFavorite
} = require('../../src/controllers/favoriteController');

// Mock dependencies
jest.mock('../../src/models', () => ({
    Favorite: {
        findOne: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        destroy: jest.fn()
    },
    Provider: {
        findByPk: jest.fn()
    },
    User: {
        findByPk: jest.fn()
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
    successResponse: jest.fn()
}));

jest.mock('../../src/config/redis', () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    cacheKeys: {
        userFavorites: jest.fn()
    }
}));

const { Favorite, Provider } = require('../../src/models');
const { i18nResponse, successResponse } = require('../../src/utils/helpers');
const cache = require('../../src/config/redis');

describe('Favorite Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            body: {},
            params: {},
            user: { id: 'user-123' },
            t: jest.fn((key) => key)
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        mockNext = jest.fn();

        // Setup default mocks
        i18nResponse.mockImplementation(() => {});
        successResponse.mockImplementation(() => {});
        cache.get.mockResolvedValue(null);
        cache.set.mockResolvedValue('OK');
        cache.del.mockResolvedValue(1);
        cache.cacheKeys.userFavorites.mockReturnValue('favorites:user-123');
    });

    describe('addFavorite', () => {
        it('should add favorite successfully', async () => {
            const favoriteData = { providerId: 'provider-123' };
            mockReq.body = favoriteData;

            const mockProvider = { id: 'provider-123', businessName: 'Test Provider' };
            const mockFavorite = { id: 'favorite-123', ...favoriteData, userId: 'user-123' };

            Provider.findByPk.mockResolvedValue(mockProvider);
            Favorite.findOne.mockResolvedValue(null);
            Favorite.create.mockResolvedValue(mockFavorite);

            await addFavorite(mockReq, mockRes, mockNext);

            expect(Provider.findByPk).toHaveBeenCalledWith('provider-123');
            expect(Favorite.findOne).toHaveBeenCalledWith({
                where: { userId: 'user-123', providerId: 'provider-123' }
            });
            expect(Favorite.create).toHaveBeenCalledWith({
                userId: 'user-123',
                providerId: 'provider-123'
            });
            expect(cache.del).toHaveBeenCalledWith('favorites:user-123');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 201, 'favorite.added', { favorite: mockFavorite });
        });

        it('should throw error if provider not found', async () => {
            mockReq.body = { providerId: 'nonexistent' };

            Provider.findByPk.mockResolvedValue(null);

            await expect(addFavorite(mockReq, mockRes, mockNext)).rejects.toThrow('provider.notFound');
        });

        it('should throw error if already favorited', async () => {
            mockReq.body = { providerId: 'provider-123' };

            const mockProvider = { id: 'provider-123' };
            const mockExistingFavorite = { id: 'existing-favorite' };

            Provider.findByPk.mockResolvedValue(mockProvider);
            Favorite.findOne.mockResolvedValue(mockExistingFavorite);

            await expect(addFavorite(mockReq, mockRes, mockNext)).rejects.toThrow('favorite.alreadyFavorite');
        });
    });

    describe('getFavorites', () => {
        it('should return cached favorites if available', async () => {
            const cachedData = { favorites: [] };
            cache.get.mockResolvedValue(cachedData);

            await getFavorites(mockReq, mockRes, mockNext);

            expect(cache.get).toHaveBeenCalledWith('favorites:user-123');
            expect(successResponse).toHaveBeenCalledWith(mockRes, 200, 'favorite.list', cachedData);
            expect(i18nResponse).not.toHaveBeenCalled();
        });

        it('should fetch favorites from database if not cached', async () => {
            const mockFavorites = [
                { id: 'favorite-1', provider: { id: 'provider-1' } }
            ];

            cache.get.mockResolvedValue(null);
            Favorite.findAll.mockResolvedValue(mockFavorites);

            await getFavorites(mockReq, mockRes, mockNext);

            expect(Favorite.findAll).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                include: expect.any(Array),
                order: [['createdAt', 'DESC']]
            });
            expect(cache.set).toHaveBeenCalledWith('favorites:user-123', { favorites: mockFavorites }, 300);
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'favorite.list', { favorites: mockFavorites });
        });
    });

    describe('removeFavorite', () => {
        it('should remove favorite successfully', async () => {
            mockReq.params = { providerId: 'provider-123' };

            const mockFavorite = {
                id: 'favorite-123',
                destroy: jest.fn().mockResolvedValue()
            };

            Favorite.findOne.mockResolvedValue(mockFavorite);

            await removeFavorite(mockReq, mockRes, mockNext);

            expect(Favorite.findOne).toHaveBeenCalledWith({
                where: { userId: 'user-123', providerId: 'provider-123' }
            });
            expect(mockFavorite.destroy).toHaveBeenCalled();
            expect(cache.del).toHaveBeenCalledWith('favorites:user-123');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'favorite.removed');
        });

        it('should throw error if favorite not found', async () => {
            mockReq.params = { providerId: 'provider-123' };

            Favorite.findOne.mockResolvedValue(null);

            await expect(removeFavorite(mockReq, mockRes, mockNext)).rejects.toThrow('common.notFound');
        });
    });

    describe('checkFavorite', () => {
        it('should return true if provider is favorited', async () => {
            mockReq.params = { providerId: 'provider-123' };

            const mockFavorite = { id: 'favorite-123' };

            Favorite.findOne.mockResolvedValue(mockFavorite);

            await checkFavorite(mockReq, mockRes, mockNext);

            expect(Favorite.findOne).toHaveBeenCalledWith({
                where: { userId: 'user-123', providerId: 'provider-123' }
            });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'favorite.check', {
                isFavorite: true
            });
        });

        it('should return false if provider is not favorited', async () => {
            mockReq.params = { providerId: 'provider-123' };

            Favorite.findOne.mockResolvedValue(null);

            await checkFavorite(mockReq, mockRes, mockNext);

            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'favorite.check', {
                isFavorite: false
            });
        });
    });
});
