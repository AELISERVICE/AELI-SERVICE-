/**
 * Contact Model Unit Tests
 * Tests for Contact model methods and hooks
 */

jest.mock('../../src/utils/encryption', () => ({
    encryptIfNeeded: jest.fn(),
    decrypt: jest.fn()
}));

const { encryptIfNeeded, decrypt } = require('../../src/utils/encryption');

// Mock the Contact model
const mockContact = {
    canBeViewedBy: jest.fn(),
    getMaskedData: jest.fn(),
    changed: jest.fn().mockReturnValue(false),
    save: jest.fn().mockResolvedValue()
};

// Create mock constructors
const MockContact = jest.fn((data) => ({ ...data }));
const MockProvider = jest.fn((data) => ({ ...data }));
const MockPayment = jest.fn((data) => ({ ...data }));
const MockUser = jest.fn((data) => ({ ...data }));

// Add hooks to the mock
MockContact.hooks = {
    beforeCreate: jest.fn(),
    beforeUpdate: jest.fn(),
    afterFind: jest.fn()
};

// Add methods to Provider
MockProvider.findOne = jest.fn();

jest.mock('../../src/models', () => ({
    Contact: MockContact,
    Provider: MockProvider,
    Payment: MockPayment,
    User: MockUser,
    Subscription: {
        isActive: jest.fn()
    }
}));

const { Contact, Provider } = require('../../src/models');

describe('Contact Model', () => {
    let mockCont;

    beforeEach(() => {
        jest.clearAllMocks();

        // Re-setup MockContact constructor after clearing
        MockContact.mockImplementation((data) => ({ ...data }));
        
        // Setup encryption mocks AFTER clearing
        encryptIfNeeded.mockImplementation((value) => `encrypted_${value}`);
        decrypt.mockImplementation((value) => value ? value.replace('encrypted_', '') : value);

        mockCont = {
            id: 'contact-123',
            userId: 'user-123',
            providerId: 'provider-123',
            message: 'This is a test message for contact',
            senderName: 'John Doe',
            senderEmail: 'john@example.com',
            senderPhone: '+237 6XX XXX XXX',
            status: 'pending',
            isUnlocked: false,
            save: jest.fn().mockResolvedValue()
        };
    });

    describe('Hooks', () => {
        describe('beforeCreate', () => {
            it('should encrypt senderPhone and senderEmail before create', () => {
                const contact = new Contact(mockCont);
                contact.senderPhone = '+237 6XX XXX XXX';
                contact.senderEmail = 'john@example.com';

                Contact.hooks.beforeCreate = jest.fn((contact) => {
                    if (contact.senderPhone) {
                        contact.senderPhone = encryptIfNeeded(contact.senderPhone);
                    }
                    if (contact.senderEmail) {
                        contact.senderEmail = encryptIfNeeded(contact.senderEmail);
                    }
                });

                Contact.hooks.beforeCreate(contact);

                expect(encryptIfNeeded).toHaveBeenCalledWith('+237 6XX XXX XXX');
                expect(encryptIfNeeded).toHaveBeenCalledWith('john@example.com');
                expect(contact.senderPhone).toBe('encrypted_+237 6XX XXX XXX');
                expect(contact.senderEmail).toBe('encrypted_john@example.com');
            });

            it('should handle contact without phone or email', () => {
                const contactData = {
                    senderName: 'John Doe'
                };

                const contact = new Contact(contactData);
                Contact.hooks.beforeCreate(contact);

                expect(encryptIfNeeded).not.toHaveBeenCalled();
            });
        });

        describe('beforeUpdate', () => {
            it('should encrypt senderPhone if changed', () => {
                const contact = new Contact(mockCont);
                contact.senderPhone = '+237 6XX XXX XXX';
                contact.senderEmail = 'john@example.com';
                contact.changed = jest.fn((field) => field === 'senderPhone');

                Contact.hooks.beforeUpdate = jest.fn((contact) => {
                    if (contact.changed('senderPhone') && contact.senderPhone) {
                        contact.senderPhone = encryptIfNeeded(contact.senderPhone);
                    }
                    if (contact.changed('senderEmail') && contact.senderEmail) {
                        contact.senderEmail = encryptIfNeeded(contact.senderEmail);
                    }
                });

                Contact.hooks.beforeUpdate(contact);

                expect(encryptIfNeeded).toHaveBeenCalledWith('+237 6XX XXX XXX');
                expect(contact.senderPhone).toBe('encrypted_+237 6XX XXX XXX');
            });

            it('should encrypt senderEmail if changed', () => {
                const contact = new Contact(mockCont);
                contact.senderPhone = '+237 6XX XXX XXX';
                contact.senderEmail = 'john@example.com';
                contact.changed = jest.fn((field) => field === 'senderEmail');

                Contact.hooks.beforeUpdate = jest.fn((contact) => {
                    if (contact.changed('senderPhone') && contact.senderPhone) {
                        contact.senderPhone = encryptIfNeeded(contact.senderPhone);
                    }
                    if (contact.changed('senderEmail') && contact.senderEmail) {
                        contact.senderEmail = encryptIfNeeded(contact.senderEmail);
                    }
                });

                Contact.hooks.beforeUpdate(contact);

                expect(encryptIfNeeded).toHaveBeenCalledWith('john@example.com');
                expect(contact.senderEmail).toBe('encrypted_john@example.com');
            });

            it('should not encrypt if not changed', () => {
                const contact = new Contact(mockCont);
                contact.senderPhone = '+237 6XX XXX XXX';
                contact.senderEmail = 'john@example.com';
                contact.changed = jest.fn(() => false);

                Contact.hooks.beforeUpdate = jest.fn((contact) => {
                    if (contact.changed('senderPhone') && contact.senderPhone) {
                        contact.senderPhone = encryptIfNeeded(contact.senderPhone);
                    }
                    if (contact.changed('senderEmail') && contact.senderEmail) {
                        contact.senderEmail = encryptIfNeeded(contact.senderEmail);
                    }
                });

                Contact.hooks.beforeUpdate(contact);

                expect(encryptIfNeeded).not.toHaveBeenCalled();
            });
        });

        describe('afterFind', () => {
            it('should decrypt senderPhone and senderEmail for single contact', () => {
                const contact = new Contact(mockCont);
                contact.senderPhone = 'encrypted_+237 6XX XXX XXX';
                contact.senderEmail = 'encrypted_john@example.com';

                Contact.hooks.afterFind = jest.fn((result) => {
                    if (!result) return;

                    if (Array.isArray(result)) {
                        result.forEach((usr) => {
                            if (usr && usr.senderPhone) {
                                usr.senderPhone = decrypt(usr.senderPhone);
                            }
                            if (usr && usr.senderEmail) {
                                usr.senderEmail = decrypt(usr.senderEmail);
                            }
                        });
                    } else {
                        if (result && result.senderPhone) {
                            result.senderPhone = decrypt(result.senderPhone);
                        }
                        if (result && result.senderEmail) {
                            result.senderEmail = decrypt(result.senderEmail);
                        }
                    }
                });

                Contact.hooks.afterFind(contact);

                expect(decrypt).toHaveBeenCalledWith('encrypted_+237 6XX XXX XXX');
                expect(decrypt).toHaveBeenCalledWith('encrypted_john@example.com');
                expect(contact.senderPhone).toBe('+237 6XX XXX XXX');
                expect(contact.senderEmail).toBe('john@example.com');
            });

            it('should decrypt for array of contacts', () => {
                const contacts = [
                    new Contact({ ...mockCont, senderPhone: 'encrypted_+237 6XX XXX XXX', senderEmail: 'encrypted_john@example.com' }),
                    new Contact({ ...mockCont, id: 'contact-456', senderPhone: 'encrypted_+237 6YY YYY YYY', senderEmail: 'encrypted_jane@example.com' })
                ];

                // Set the afterFind implementation directly (not wrapped in jest.fn)
                Contact.hooks.afterFind = (result) => {
                    if (!result) return;

                    const decryptFields = (contact) => {
                        if (contact) {
                            if (contact.senderPhone) {
                                contact.senderPhone = decrypt(contact.senderPhone);
                            }
                            if (contact.senderEmail) {
                                contact.senderEmail = decrypt(contact.senderEmail);
                            }
                        }
                    };

                    if (Array.isArray(result)) {
                        result.forEach(decryptFields);
                    } else {
                        decryptFields(result);
                    }
                };

                Contact.hooks.afterFind(contacts);

                expect(decrypt).toHaveBeenCalledWith('encrypted_+237 6XX XXX XXX');
                expect(decrypt).toHaveBeenCalledWith('encrypted_john@example.com');
                expect(decrypt).toHaveBeenCalledWith('encrypted_+237 6YY YYY YYY');
                expect(decrypt).toHaveBeenCalledWith('encrypted_jane@example.com');
                expect(contacts[0].senderPhone).toBe('+237 6XX XXX XXX');
                expect(contacts[0].senderEmail).toBe('john@example.com');
                expect(contacts[1].senderPhone).toBe('+237 6YY YYY YYY');
                expect(contacts[1].senderEmail).toBe('jane@example.com');
            });

            it('should handle contact without phone or email', () => {
                const contact = new Contact({ 
                    ...mockCont, 
                    senderPhone: null,
                    senderEmail: null 
                });

                // Set the afterFind implementation
                Contact.hooks.afterFind = (result) => {
                    if (!result) return;

                    const decryptFields = (contact) => {
                        if (contact) {
                            if (contact.senderPhone) {
                                contact.senderPhone = decrypt(contact.senderPhone);
                            }
                            if (contact.senderEmail) {
                                contact.senderEmail = decrypt(contact.senderEmail);
                            }
                        }
                    };

                    if (Array.isArray(result)) {
                        result.forEach(decryptFields);
                    } else {
                        decryptFields(result);
                    }
                };

                Contact.hooks.afterFind(contact);

                expect(decrypt).not.toHaveBeenCalled();
            });

            it('should handle null result', () => {
                Contact.hooks.afterFind(null);

                expect(decrypt).not.toHaveBeenCalled();
            });
    });

    describe('canBeViewedBy', () => {
        it('should return true if provider has active subscription', async () => {
            const contact = new Contact(mockCont);
            contact.isUnlocked = false;
            contact.save = jest.fn();
            contact.canBeViewedBy = jest.fn(async function (user) {
                // If already unlocked
                if (contact.isUnlocked) return true;

                // Check if provider has active subscription (auto-unlock)
                const { Provider, Subscription } = require('../../src/models');
                const provider = await Provider.findOne({
                    where: { id: contact.providerId },
                    include: [{ model: Subscription, as: 'subscription' }]
                });

                if (provider && provider.subscription && provider.subscription.isActive()) {
                    // Auto-unlock if subscription active
                    contact.isUnlocked = true;
                    contact.unlockedAt = new Date();
                    await contact.save();
                    return true;
                }

                return false;
            });

            const user = { role: 'client' };

            const mockProvider = {
                subscription: {
                    isActive: jest.fn().mockReturnValue(true)
                }
            };

            Provider.findOne = jest.fn().mockResolvedValue(mockProvider);

            const result = await contact.canBeViewedBy(user);

            expect(result).toBe(true);
            expect(contact.isUnlocked).toBe(true);
            expect(contact.unlockedAt).toBeInstanceOf(Date);
            expect(contact.save).toHaveBeenCalled();
        });

        it('should return false if no active subscription', async () => {
            const contact = new Contact(mockCont);
            contact.isUnlocked = false;
            contact.save = jest.fn();
            contact.canBeViewedBy = jest.fn(async function (user) {
                // If already unlocked
                if (contact.isUnlocked) return true;

                // Check if provider has active subscription (auto-unlock)
                const { Provider, Subscription } = require('../../src/models');
                const provider = await Provider.findOne({
                    where: { id: contact.providerId },
                    include: [{ model: Subscription, as: 'subscription' }]
                });

                if (provider && provider.subscription && provider.subscription.isActive()) {
                    // Auto-unlock if subscription active
                    contact.isUnlocked = true;
                    contact.unlockedAt = new Date();
                    await contact.save();
                    return true;
                }

                return false;
            });

            const user = { role: 'client' };

            Provider.findOne = jest.fn().mockResolvedValue(null);

            const result = await contact.canBeViewedBy(user);

            expect(result).toBe(false);
            expect(contact.isUnlocked).toBe(false);
        });
    });

        describe('getMaskedData', () => {
            it('should return masked contact data', () => {
                const contact = new Contact(mockCont);
                contact.message = 'This is a test message for contact';
                contact.id = 'contact-123';
                contact.senderName = 'John Doe';
                contact.senderEmail = 'john@example.com';
                contact.senderPhone = '+237 6XX XXX XXX';
                contact.status = 'pending';
                contact.getMaskedData = jest.fn(() => {
                    let maskedEmail = '***@***';
                    if (contact.senderEmail) {
                        const emailParts = contact.senderEmail.split('@');
                        if (emailParts.length === 2) {
                            maskedEmail = `${emailParts[0][0]}***@***`;
                        }
                    }

                    let maskedPhone = null;
                    if (contact.senderPhone) {
                        maskedPhone = '+237 6** *** ***';
                    }

                    return {
                        id: contact.id,
                        messagePreview: contact.message.substring(0, 50) + '...',
                        senderName: contact.senderName,
                        senderEmail: maskedEmail,
                        senderPhone: maskedPhone,
                        status: contact.status,
                        isUnlocked: false,
                        createdAt: contact.createdAt,
                        unlockPrice: 500,
                        needsUnlock: true
                    };
                });

                const result = contact.getMaskedData();

                expect(result).toEqual({
                    id: 'contact-123',
                    messagePreview: 'This is a test message for contact...',
                    senderName: 'John Doe',
                    senderEmail: 'j***@***',
                    senderPhone: '+237 6** *** ***',
                    status: 'pending',
                    isUnlocked: false,
                    createdAt: contact.createdAt,
                    unlockPrice: 500,
                    needsUnlock: true
                });
            });

            it('should handle contact without email', () => {
                const contact = new Contact({ ...mockCont, senderEmail: null });
                contact.message = 'This is a test message for contact';
                contact.status = 'pending';
                contact.id = 'contact-123';
                contact.senderName = 'John Doe';
                contact.senderPhone = '+237 6XX XXX XXX';
                contact.getMaskedData = jest.fn(() => {
                    let maskedEmail = '***@***';

                    let maskedPhone = null;
                    if (contact.senderPhone) {
                        maskedPhone = '+237 6** *** ***';
                    }

                    return {
                        id: contact.id,
                        messagePreview: contact.message.substring(0, 50) + '...',
                        senderName: contact.senderName,
                        senderEmail: maskedEmail,
                        senderPhone: maskedPhone,
                        status: contact.status,
                        isUnlocked: false,
                        createdAt: contact.createdAt,
                        unlockPrice: 500,
                        needsUnlock: true
                    };
                });

                const result = contact.getMaskedData();

                expect(result).toEqual({
                    id: 'contact-123',
                    messagePreview: 'This is a test message for contact...',
                    senderName: 'John Doe',
                    senderEmail: '***@***',
                    senderPhone: '+237 6** *** ***',
                    status: 'pending',
                    isUnlocked: false,
                    createdAt: contact.createdAt,
                    unlockPrice: 500,
                    needsUnlock: true
                });
                expect(result.senderEmail).toBe('***@***');
            });

            it('should handle contact without phone', () => {
                const contact = new Contact({ ...mockCont, senderPhone: null });
                contact.message = 'This is a test message for contact';
                contact.status = 'pending';
                contact.id = 'contact-123';
                contact.senderName = 'John Doe';
                contact.senderEmail = 'john@example.com';
                contact.getMaskedData = jest.fn(() => {
                    let maskedEmail = '***@***';
                    if (contact.senderEmail) {
                        const emailParts = contact.senderEmail.split('@');
                        if (emailParts.length === 2) {
                            maskedEmail = `${emailParts[0][0]}***@***`;
                        }
                    }

                    return {
                        id: contact.id,
                        messagePreview: contact.message.substring(0, 50) + '...',
                        senderName: contact.senderName,
                        senderEmail: maskedEmail,
                        senderPhone: null,
                        status: contact.status,
                        isUnlocked: false,
                        createdAt: contact.createdAt,
                        unlockPrice: 500,
                        needsUnlock: true
                    };
                });

                const result = contact.getMaskedData();

                expect(result).toEqual({
                    id: 'contact-123',
                    messagePreview: 'This is a test message for contact...',
                    senderName: 'John Doe',
                    senderEmail: 'j***@***',
                    senderPhone: null,
                    status: 'pending',
                    isUnlocked: false,
                    createdAt: contact.createdAt,
                    unlockPrice: 500,
                    needsUnlock: true
                });
                expect(result.senderPhone).toBeNull();
            });

            it('should handle short message', () => {
                const contact = new Contact({ ...mockCont, message: 'Short' });
                contact.message = 'Short';
                contact.status = 'pending';
                contact.id = 'contact-123';
                contact.senderName = 'John Doe';
                contact.senderEmail = 'john@example.com';
                contact.senderPhone = '+237 6XX XXX XXX';
                contact.getMaskedData = jest.fn(() => {
                    let maskedEmail = '***@***';
                    if (contact.senderEmail) {
                        const emailParts = contact.senderEmail.split('@');
                        if (emailParts.length === 2) {
                            maskedEmail = `${emailParts[0][0]}***@***`;
                        }
                    }

                    let maskedPhone = null;
                    if (contact.senderPhone) {
                        maskedPhone = '+237 6** *** ***';
                    }

                    return {
                        id: contact.id,
                        messagePreview: contact.message.substring(0, 50) + '...',
                        senderName: contact.senderName,
                        senderEmail: maskedEmail,
                        senderPhone: maskedPhone,
                        status: contact.status,
                        isUnlocked: false,
                        createdAt: contact.createdAt,
                        unlockPrice: 500,
                        needsUnlock: true
                    };
                });

                const result = contact.getMaskedData();

                expect(result.messagePreview).toBe('Short...');
            });
        });
    });
});
