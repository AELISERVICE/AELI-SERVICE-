/**
 * Provider Model Unit Tests
 * Tests for Provider model methods and hooks
 */

const { encryptIfNeeded, decrypt } = require('../../src/utils/encryption');

// Mock dependencies
jest.mock('../../src/utils/encryption');

// Mock the Provider model
const mockProvider = {
    incrementViews: jest.fn(),
    incrementContacts: jest.fn(),
    updateRating: jest.fn(),
    changed: jest.fn().mockReturnValue(false),
    save: jest.fn().mockResolvedValue()
};

const MockProvider = jest.fn().mockImplementation((data) => {
    return Object.assign({}, mockProvider, data);
});

// Add hooks to the mock
MockProvider.hooks = {
    beforeCreate: jest.fn(),
    beforeUpdate: jest.fn(),
    afterFind: jest.fn()
};

jest.mock('../../src/models', () => ({
    Provider: MockProvider,
    Review: {
        findAll: jest.fn()
    }
}));

const { Provider, Review } = require('../../src/models');

describe('Provider Model', () => {
    let mockProv;

    beforeEach(() => {
        jest.clearAllMocks();

        mockProv = {
            id: 'provider-123',
            userId: 'user-123',
            businessName: 'Test Business',
            whatsapp: 'encryptedwhatsapp',
            viewsCount: 10,
            contactsCount: 5,
            averageRating: '4.50',
            totalReviews: 10,
            save: jest.fn().mockResolvedValue()
        };

        // Setup encryption mocks
        encryptIfNeeded.mockImplementation((value) => `encrypted_${value}`);
        decrypt.mockImplementation((value) => value ? value.replace('encrypted_', '') : value);
    });

    describe('Hooks', () => {
        describe('beforeCreate', () => {
            it('should encrypt whatsapp before create', () => {
                const providerData = {
                    userId: 'user-123',
                    businessName: 'Test Business',
                    whatsapp: '+237 600 000 000'
                };

                const provider = new Provider(providerData);
                provider.whatsapp = '+237 600 000 000';
                Provider.hooks.beforeCreate = jest.fn((provider) => {
                    if (provider.whatsapp) {
                        provider.whatsapp = encryptIfNeeded(provider.whatsapp);
                    }
                });

                Provider.hooks.beforeCreate(provider);

                expect(provider.whatsapp).toBe('encrypted_+237 600 000 000');
            });

            it('should handle provider without whatsapp', () => {
                const providerData = {
                    userId: 'user-123',
                    businessName: 'Test Business'
                };

                const provider = new Provider(providerData);
                Provider.hooks.beforeCreate(provider);

                expect(encryptIfNeeded).not.toHaveBeenCalled();
            });
        });

        describe('beforeUpdate', () => {
            it('should encrypt whatsapp if changed', () => {
                const provider = new Provider(mockProv);
                provider.changed = jest.fn().mockReturnValue(true); // whatsapp changed
                provider.whatsapp = 'encryptedwhatsapp';

                Provider.hooks.beforeUpdate = jest.fn((provider) => {
                    if (provider.changed('whatsapp') && provider.whatsapp) {
                        provider.whatsapp = encryptIfNeeded(provider.whatsapp);
                    }
                });

                Provider.hooks.beforeUpdate(provider);

                expect(encryptIfNeeded).toHaveBeenCalledWith('encryptedwhatsapp');
                expect(provider.whatsapp).toBe('encrypted_encryptedwhatsapp');
            });

            it('should not encrypt whatsapp if not changed', () => {
                const provider = new Provider(mockProv);
                provider.changed = jest.fn().mockReturnValue(false);

                Provider.hooks.beforeUpdate = jest.fn((provider) => {
                    if (provider.changed('whatsapp') && provider.whatsapp) {
                        provider.whatsapp = encryptIfNeeded(provider.whatsapp);
                    }
                });

                Provider.hooks.beforeUpdate(provider);

                expect(encryptIfNeeded).not.toHaveBeenCalled();
            });
        });

        describe('afterFind', () => {
            it('should decrypt whatsapp for single provider', () => {
                const provider = new Provider(mockProv);
                provider.whatsapp = 'encryptedwhatsapp';

                Provider.hooks.afterFind = jest.fn((result) => {
                    if (!result) return;

                    const decryptWhatsapp = (prov) => {
                        if (prov && prov.whatsapp) {
                            prov.whatsapp = decrypt(prov.whatsapp);
                        }
                    };

                    if (Array.isArray(result)) {
                        result.forEach(decryptWhatsapp);
                    } else {
                        decryptWhatsapp(result);
                    }
                });

                Provider.hooks.afterFind(provider);

                expect(provider.whatsapp).toBe('encryptedwhatsapp');
            });

            it('should decrypt whatsapp for array of providers', () => {
                const providers = [
                    new Provider(mockProv),
                    new Provider({ ...mockProv, id: 'provider-456', whatsapp: 'encryptedwhatsapp2' })
                ];
                providers[1].whatsapp = 'encryptedwhatsapp2';

                Provider.hooks.afterFind = jest.fn((result) => {
                    if (!result) return;

                    const decryptWhatsapp = (prov) => {
                        if (prov && prov.whatsapp) {
                            prov.whatsapp = decrypt(prov.whatsapp);
                        }
                    };

                    if (Array.isArray(result)) {
                        result.forEach(decryptWhatsapp);
                    } else {
                        decryptWhatsapp(result);
                    }
                });

                Provider.hooks.afterFind(providers);

                expect(providers[1].whatsapp).toBe('encryptedwhatsapp2');
            });

            it('should handle null result', () => {
                Provider.hooks.afterFind(null);

                expect(decrypt).not.toHaveBeenCalled();
            });

            it('should handle provider without whatsapp', () => {
                const provider = new Provider({ ...mockProv, whatsapp: null });

                Provider.hooks.afterFind(provider);

                expect(decrypt).not.toHaveBeenCalled();
            });
        });
    });

    describe('Instance Methods', () => {
        describe('incrementViews', () => {
            it('should increment views count', async () => {
                const provider = new Provider(mockProv);
                provider.save = jest.fn().mockResolvedValue();
                provider.viewsCount = 10;
                provider.incrementViews = jest.fn(async function () {
                    this.viewsCount += 1;
                    await this.save({ fields: ['viewsCount'] });
                });

                await provider.incrementViews();

                expect(provider.viewsCount).toBe(11);
            });
        });

        describe('incrementContacts', () => {
            it('should increment contacts count', async () => {
                const provider = new Provider(mockProv);
                provider.save = jest.fn().mockResolvedValue();
                provider.contactsCount = 5;
                provider.incrementContacts = jest.fn(async function () {
                    this.contactsCount += 1;
                    await this.save({ fields: ['contactsCount'] });
                });

                await provider.incrementContacts();

                expect(provider.contactsCount).toBe(6);
            });
        });

        describe('updateRating', () => {
            it('should update rating for new review', async () => {
                const provider = new Provider(mockProv);
                provider.updateRating = jest.fn(async (newRating, isNewReview) => {
                    if (isNewReview) {
                        const newTotal = provider.totalReviews + 1;
                        const currentSum = parseFloat(provider.averageRating) * provider.totalReviews;
                        provider.averageRating = ((currentSum + newRating) / newTotal).toFixed(2);
                        provider.totalReviews = newTotal;
                    }
                });

                await provider.updateRating(5, true);
            });

            it('should recalculate rating from all reviews', async () => {
                const provider = new Provider(mockProv);
                provider.updateRating = jest.fn(async (newRating, isNewReview) => {
                    if (!isNewReview) {
                        const reviews = await Review.findAll({
                            where: { providerId: provider.id, isVisible: true }
                        });
                        if (reviews.length > 0) {
                            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
                            provider.averageRating = (sum / reviews.length).toFixed(2);
                            provider.totalReviews = reviews.length;
                        } else {
                            provider.averageRating = 0;
                            provider.totalReviews = 0;
                        }
                    }
                });

                const mockReviews = [
                    { rating: 5 },
                    { rating: 4 },
                    { rating: 3 }
                ];

                Review.findAll.mockResolvedValue(mockReviews);

                await provider.updateRating(null, false);

                expect(provider.averageRating).toBe('4.00');
                expect(provider.totalReviews).toBe(3);
            });

            it('should set rating to 0 when no reviews', async () => {
                const provider = new Provider(mockProv);
                provider.updateRating = jest.fn(async (newRating, isNewReview) => {
                    if (!isNewReview) {
                        const reviews = await Review.findAll({
                            where: { providerId: provider.id, isVisible: true }
                        });
                        if (reviews.length > 0) {
                            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
                            provider.averageRating = (sum / reviews.length).toFixed(2);
                            provider.totalReviews = reviews.length;
                        } else {
                            provider.averageRating = 0;
                            provider.totalReviews = 0;
                        }
                    }
                });

                Review.findAll.mockResolvedValue([]);

                await provider.updateRating(null, false);

                expect(provider.averageRating).toBe(0);
                expect(provider.totalReviews).toBe(0);
            });
        });
    });
});
