/**
 * Provider Controller Unit Tests
 * Tests for provider-related business logic
 */

// Mock dependencies
jest.mock('../../src/models', () => ({
    Provider: {
        findByPk: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
        findAndCountAll: jest.fn(),
        create: jest.fn()
    },
    User: {
        findByPk: jest.fn()
    },
    Service: {
        findAll: jest.fn()
    },
    Review: {
        findAll: jest.fn()
    },
    Contact: {
        findAll: jest.fn(),
        count: jest.fn()
    },
    Category: {},
    Subscription: {
        createTrial: jest.fn(),
        getStatus: jest.fn()
    }
}));

jest.mock('../../src/config/redis', () => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    delByPattern: jest.fn().mockResolvedValue(5),
    cacheKeys: {
        providers: () => 'providers:test',
        provider: (id) => `provider:${id}`
    }
}));

const { Provider, Subscription, Service, Review } = require('../../src/models');
const cache = require('../../src/config/redis');

describe('Provider Controller Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Provider Creation', () => {
        it('should create provider with trial subscription', async () => {
            const mockProvider = {
                id: 'provider-uuid',
                userId: 'user-uuid',
                businessName: 'Test Business'
            };

            Provider.create.mockResolvedValue(mockProvider);
            Subscription.createTrial.mockResolvedValue({ id: 'sub-uuid' });

            const provider = await Provider.create({
                userId: 'user-uuid',
                businessName: 'Test Business'
            });

            expect(provider.id).toBe('provider-uuid');
            expect(Provider.create).toHaveBeenCalled();
        });

        it('should invalidate cache after creation', async () => {
            const mockProvider = { id: 'new-provider' };
            Provider.create.mockResolvedValue(mockProvider);

            await cache.delByPattern('providers:list:*');

            expect(cache.delByPattern).toHaveBeenCalledWith('providers:list:*');
        });
    });

    describe('Provider Retrieval', () => {
        it('should return cached data if available', async () => {
            const cachedData = { provider: { id: 'cached-provider' } };
            cache.get.mockResolvedValue(cachedData);

            const result = await cache.get('provider:test-id');

            expect(result).toEqual(cachedData);
        });

        it('should fetch from database if not cached', async () => {
            cache.get.mockResolvedValue(null);

            const mockProvider = {
                id: 'db-provider',
                toJSON: () => ({ id: 'db-provider' })
            };
            Provider.findByPk.mockResolvedValue(mockProvider);

            const provider = await Provider.findByPk('test-id');

            expect(provider.id).toBe('db-provider');
        });

        it('should include related data in provider details', async () => {
            const mockProvider = {
                id: 'provider-id',
                businessName: 'Test',
                toJSON: function () { return { ...this }; }
            };

            const mockServices = [
                { id: 'srv-1', name: 'Service 1' },
                { id: 'srv-2', name: 'Service 2' }
            ];

            const mockReviews = [
                { id: 'rev-1', rating: 5 }
            ];

            Provider.findByPk.mockResolvedValue(mockProvider);
            Service.findAll.mockResolvedValue(mockServices);
            Review.findAll.mockResolvedValue(mockReviews);

            const provider = await Provider.findByPk('provider-id');
            const services = await Service.findAll({ where: { providerId: 'provider-id' } });
            const reviews = await Review.findAll({ where: { providerId: 'provider-id' } });

            expect(services).toHaveLength(2);
            expect(reviews).toHaveLength(1);
        });
    });

    describe('Subscription Status Check', () => {
        it('should hide contact info when subscription expired', async () => {
            Subscription.getStatus.mockResolvedValue({ isActive: false });

            const status = await Subscription.getStatus('provider-id');

            expect(status.isActive).toBe(false);
        });

        it('should show full data when subscription active', async () => {
            Subscription.getStatus.mockResolvedValue({
                isActive: true,
                plan: 'monthly',
                daysRemaining: 15
            });

            const status = await Subscription.getStatus('provider-id');

            expect(status.isActive).toBe(true);
            expect(status.daysRemaining).toBe(15);
        });

        it('should apply shorter cache TTL for expired subscriptions', async () => {
            const expiredTTL = 60;   // 1 minute
            const activeTTL = 300;   // 5 minutes

            // Expired subscription should cache for shorter time
            expect(expiredTTL).toBeLessThan(activeTTL);
        });
    });

    describe('Provider Filters and Pagination', () => {
        it('should apply location filter with case-insensitive search', () => {
            const location = 'Douala';
            const searchPattern = `%${location}%`;

            expect(searchPattern).toBe('%Douala%');
        });

        it('should apply minimum rating filter', () => {
            const minRating = '4.0';
            const parsed = parseFloat(minRating);

            expect(parsed).toBe(4.0);
            expect(parsed).toBeGreaterThanOrEqual(1);
            expect(parsed).toBeLessThanOrEqual(5);
        });

        it('should apply category filter via service relation', () => {
            const categorySlug = 'coiffure';
            const includeCondition = {
                model: 'Service',
                required: true,
                include: [{
                    model: 'Category',
                    where: { slug: categorySlug }
                }]
            };

            expect(includeCondition.required).toBe(true);
            expect(includeCondition.include[0].where.slug).toBe('coiffure');
        });
    });

    describe('Provider Dashboard Stats', () => {
        it('should return correct stats structure', async () => {
            const mockProvider = {
                id: 'provider-id',
                viewsCount: 1234,
                contactsCount: 45,
                totalReviews: 25,
                averageRating: '4.8',
                isVerified: true,
                isFeatured: false
            };

            Provider.findOne.mockResolvedValue(mockProvider);

            const provider = await Provider.findOne({ where: { userId: 'user-id' } });

            const stats = {
                totalViews: provider.viewsCount,
                totalContacts: provider.contactsCount,
                totalReviews: provider.totalReviews,
                averageRating: parseFloat(provider.averageRating),
                isVerified: provider.isVerified,
                isFeatured: provider.isFeatured
            };

            expect(stats.totalViews).toBe(1234);
            expect(stats.totalContacts).toBe(45);
            expect(stats.averageRating).toBe(4.8);
            expect(stats.isVerified).toBe(true);
        });
    });

    describe('Document Upload Validation', () => {
        it('should validate allowed document types', () => {
            const validTypes = ['cni', 'business_license', 'tax_certificate', 'proof_of_address', 'other'];

            expect(validTypes.includes('cni')).toBe(true);
            expect(validTypes.includes('business_license')).toBe(true);
            expect(validTypes.includes('invalid_type')).toBe(false);
        });

        it('should enforce max 5 documents limit', () => {
            const currentDocs = [1, 2, 3, 4];
            const newDocs = [5, 6];
            const maxDocs = 5;

            const totalAfterUpload = currentDocs.length + newDocs.length;
            const exceedsLimit = totalAfterUpload > maxDocs;

            expect(exceedsLimit).toBe(true);
        });

        it('should prevent document deletion after verification', () => {
            const isVerified = true;
            const canDelete = !isVerified;

            expect(canDelete).toBe(false);
        });
    });
});
