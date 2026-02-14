/**
 * Service Controller Unit Tests
 * Tests for service-related endpoints
 */

const {
    getCategories,
    createCategory,
    updateCategory,
    createService,
    getServicesByProvider,
    updateService,
    deleteService
} = require('../../src/controllers/serviceController');

// Mock dependencies
jest.mock('../../src/models', () => ({
    Service: {
        findByPk: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn()
    },
    Provider: {
        findOne: jest.fn(),
        findByPk: jest.fn()
    },
    Category: {
        findByPk: jest.fn(),
        findAll: jest.fn(),
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

jest.mock('../../src/utils/helpers', () => ({
    i18nResponse: jest.fn(),
    successResponse: jest.fn()
}));

jest.mock('../../src/config/redis', () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    cacheKeys: {
        categories: jest.fn(),
        services: jest.fn()
    }
}));

const { Service, Provider, Category } = require('../../src/models');
const { i18nResponse, successResponse } = require('../../src/utils/helpers');
const cache = require('../../src/config/redis');

describe('Service Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            body: {},
            params: {},
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
        successResponse.mockImplementation(() => {});
        cache.get.mockResolvedValue(null);
        cache.set.mockResolvedValue('OK');
        cache.del.mockResolvedValue(1);
        cache.cacheKeys.categories.mockReturnValue('categories');
        cache.cacheKeys.services.mockReturnValue('services:provider-123');
    });

    describe('getCategories', () => {
        it('should return cached categories if available', async () => {
            const cachedData = { categories: [] };
            cache.get.mockResolvedValue(cachedData);

            await getCategories(mockReq, mockRes, mockNext);

            expect(cache.get).toHaveBeenCalledWith('categories');
            expect(successResponse).toHaveBeenCalledWith(mockRes, 200, 'category.list', cachedData);
            expect(i18nResponse).not.toHaveBeenCalled();
        });

        it('should fetch categories from database if not cached', async () => {
            const mockCategories = [
                { id: 'category-1', name: 'Test Category' }
            ];

            cache.get.mockResolvedValue(null);
            Category.findAll.mockResolvedValue(mockCategories);

            await getCategories(mockReq, mockRes, mockNext);

            expect(Category.findAll).toHaveBeenCalledWith({
                where: { isActive: true },
                order: [['order', 'ASC'], ['name', 'ASC']]
            });
            expect(cache.set).toHaveBeenCalledWith('categories', { categories: mockCategories }, 3600);
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'category.list', { categories: mockCategories });
        });
    });

    describe('createCategory', () => {
        it('should create category successfully', async () => {
            const categoryData = {
                name: 'New Category',
                description: 'Description',
                icon: 'icon.png',
                order: 1
            };
            mockReq.body = categoryData;

            const mockCategory = { id: 'category-123', ...categoryData };

            Category.create.mockResolvedValue(mockCategory);

            await createCategory(mockReq, mockRes, mockNext);

            expect(Category.create).toHaveBeenCalledWith({
                name: 'New Category',
                description: 'Description',
                icon: 'icon.png',
                order: 1
            });
            expect(cache.del).toHaveBeenCalledWith('categories');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 201, 'category.created', { category: mockCategory });
        });
    });

    describe('updateCategory', () => {
        it('should update category successfully', async () => {
            mockReq.params = { id: 'category-123' };
            mockReq.body = {
                name: 'Updated Name',
                description: 'Updated Description',
                isActive: false
            };

            const mockCategory = {
                id: 'category-123',
                name: 'Old Name',
                description: 'Old Description',
                icon: 'old-icon.png',
                order: 0,
                isActive: true,
                save: jest.fn().mockResolvedValue()
            };

            Category.findByPk.mockResolvedValue(mockCategory);

            await updateCategory(mockReq, mockRes, mockNext);

            expect(mockCategory.name).toBe('Updated Name');
            expect(mockCategory.description).toBe('Updated Description');
            expect(mockCategory.isActive).toBe(false);
            expect(mockCategory.save).toHaveBeenCalled();
            expect(cache.del).toHaveBeenCalledWith('categories');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'category.updated', { category: mockCategory });
        });

        it('should throw error if category not found', async () => {
            mockReq.params = { id: 'nonexistent' };

            Category.findByPk.mockResolvedValue(null);

            await expect(updateCategory(mockReq, mockRes, mockNext)).rejects.toThrow('category.notFound');
        });
    });

    describe('createService', () => {
        it('should create service successfully', async () => {
            const serviceData = {
                categoryId: 'category-123',
                name: 'New Service',
                description: 'Service description',
                price: 100,
                priceType: 'fixed',
                duration: 60,
                tags: ['tag1', 'tag2']
            };
            mockReq.body = serviceData;

            const mockProvider = { id: 'provider-123', userId: 'user-123' };
            const mockCategory = { id: 'category-123', name: 'Test Category' };
            const mockService = {
                id: 'service-123',
                providerId: 'provider-123',
                ...serviceData
            };

            Provider.findOne.mockResolvedValue(mockProvider);
            Category.findByPk.mockResolvedValue(mockCategory);
            Service.create.mockResolvedValue(mockService);

            await createService(mockReq, mockRes, mockNext);

            expect(Provider.findOne).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
            expect(Category.findByPk).toHaveBeenCalledWith('category-123');
            expect(Service.create).toHaveBeenCalledWith({
                providerId: 'provider-123',
                categoryId: 'category-123',
                name: 'New Service',
                description: 'Service description',
                price: 100,
                priceType: 'fixed',
                duration: 60,
                tags: ['tag1', 'tag2']
            });
            expect(cache.del).toHaveBeenCalledWith('services:provider-123');
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 201, 'service.created', { service: mockService });
        });

        it('should throw error if provider not found', async () => {
            mockReq.body = { categoryId: 'category-123' };

            Provider.findOne.mockResolvedValue(null);

            await expect(createService(mockReq, mockRes, mockNext)).rejects.toThrow('provider.notFound');
        });

        it('should throw error if category not found', async () => {
            mockReq.body = { categoryId: 'category-123' };

            const mockProvider = { id: 'provider-123', userId: 'user-123' };

            Provider.findOne.mockResolvedValue(mockProvider);
            Category.findByPk.mockResolvedValue(null);

            await expect(createService(mockReq, mockRes, mockNext)).rejects.toThrow('category.notFound');
        });
    });

    describe('getServicesByProvider', () => {
        it('should return cached services if available', async () => {
            mockReq.params = { providerId: 'provider-123' };

            const cachedData = { services: [] };
            cache.get.mockResolvedValue(cachedData);

            await getServicesByProvider(mockReq, mockRes, mockNext);

            expect(cache.get).toHaveBeenCalledWith('services:provider-123');
            expect(successResponse).toHaveBeenCalledWith(mockRes, 200, 'service.list', cachedData);
            expect(i18nResponse).not.toHaveBeenCalled();
        });

        it('should fetch services from database if not cached', async () => {
            mockReq.params = { providerId: 'provider-123' };

            const mockServices = [
                { id: 'service-1', name: 'Test Service', category: { id: 'category-1', name: 'Category' } }
            ];

            cache.get.mockResolvedValue(null);
            Service.findAll.mockResolvedValue(mockServices);

            await getServicesByProvider(mockReq, mockRes, mockNext);

            expect(Service.findAll).toHaveBeenCalledWith({
                where: {
                    providerId: 'provider-123',
                    isActive: true
                },
                include: expect.any(Array),
                order: [['createdAt', 'DESC']]
            });
            expect(cache.set).toHaveBeenCalledWith('services:provider-123', { services: mockServices }, 600);
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'service.list', { services: mockServices });
        });
    });

    describe('updateService', () => {
        it('should update service successfully', async () => {
            mockReq.params = { id: 'service-123' };
            mockReq.body = {
                name: 'Updated Service',
                price: 150,
                isActive: false
            };

            const mockService = {
                id: 'service-123',
                providerId: 'provider-123',
                provider: { userId: 'user-123' },
                name: 'Old Service',
                price: 100,
                save: jest.fn().mockResolvedValue()
            };

            Service.findByPk.mockResolvedValue(mockService);

            await updateService(mockReq, mockRes, mockNext);

            expect(mockService.name).toBe('Updated Service');
            expect(mockService.price).toBe(150);
            expect(mockService.isActive).toBe(false);
            expect(mockService.save).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'service.updated', { service: mockService });
        });

        it('should throw error if service not found', async () => {
            mockReq.params = { id: 'nonexistent' };

            Service.findByPk.mockResolvedValue(null);

            await expect(updateService(mockReq, mockRes, mockNext)).rejects.toThrow('service.notFound');
        });

        it('should throw error if not owner', async () => {
            mockReq.params = { id: 'service-123' };

            const mockService = {
                id: 'service-123',
                provider: { userId: 'other-user-123' } // Not the same as req.user.id
            };

            Service.findByPk.mockResolvedValue(mockService);

            await expect(updateService(mockReq, mockRes, mockNext)).rejects.toThrow('service.unauthorized');
        });
    });

    describe('deleteService', () => {
        it('should delete service successfully', async () => {
            mockReq.params = { id: 'service-123' };

            const mockService = {
                id: 'service-123',
                provider: { userId: 'user-123' },
                isActive: true,
                save: jest.fn().mockResolvedValue()
            };

            Service.findByPk.mockResolvedValue(mockService);

            await deleteService(mockReq, mockRes, mockNext);

            expect(mockService.isActive).toBe(false);
            expect(mockService.save).toHaveBeenCalledWith({ fields: ['isActive'] });
            expect(i18nResponse).toHaveBeenCalledWith(mockReq, mockRes, 200, 'service.deleted');
        });

        it('should throw error if service not found', async () => {
            mockReq.params = { id: 'nonexistent' };

            Service.findByPk.mockResolvedValue(null);

            await expect(deleteService(mockReq, mockRes, mockNext)).rejects.toThrow('service.notFound');
        });

        it('should throw error if not owner', async () => {
            mockReq.params = { id: 'service-123' };

            const mockService = {
                id: 'service-123',
                provider: { userId: 'other-user-123' }
            };

            Service.findByPk.mockResolvedValue(mockService);

            await expect(deleteService(mockReq, mockRes, mockNext)).rejects.toThrow('service.unauthorized');
        });
    });
});
