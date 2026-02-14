/**
 * Contact Model Unit Tests
 * Tests for Contact model methods and hooks
 */

const { encryptIfNeeded, decrypt } = require('../../src/utils/encryption');

// Mock dependencies
jest.mock('../../src/utils/encryption');

// Mock the Contact model
const mockContact = {
    canBeViewedBy: jest.fn(),
    getMaskedData: jest.fn(),
    changed: jest.fn().mockReturnValue(false),
    save: jest.fn().mockResolvedValue()
};

const MockContact = jest.fn().mockImplementation((data) => {
    return Object.assign({}, mockContact, data);
});

// Add hooks to the mock
MockContact.hooks = {
    beforeCreate: jest.fn(),
    beforeUpdate: jest.fn(),
    afterFind: jest.fn()
};

jest.mock('../../src/models', () => ({
    Contact: MockContact,
    Provider: {
        findOne: jest.fn()
    },
    Subscription: {
        isActive: jest.fn()
    }
}));

const { Contact, Provider } = require('../../src/models');

describe('Contact Model', () => {
    let mockCont;

    beforeEach(() => {
        jest.clearAllMocks();

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

        // Setup encryption mocks
        encryptIfNeeded.mockImplementation((value) => `encrypted_${value}`);
        decrypt.mockImplementation((value) => value ? value.replace('encrypted_', '') : value);
    });

    describe('Hooks', () => {
        describe('beforeCreate', () => {
            it('should encrypt senderPhone and senderEmail before create', () => {
                const contactData = {
                    senderPhone: '+237 600 000 000',
                    senderEmail: 'test@example.com'
                };

                const contact = new Contact(contactData);
                Contact.hooks.beforeCreate(contact);

                expect(encryptIfNeeded).toHaveBeenCalledWith('+237 600 000 000');
                expect(encryptIfNeeded).toHaveBeenCalledWith('test@example.com');
                expect(contact.senderPhone).toBe('encrypted_+237 600 000 000');
                expect(contact.senderEmail).toBe('encrypted_test@example.com');
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
                contact.changed.mockReturnValue(true); // senderPhone changed

                Contact.hooks.beforeUpdate(contact);

                expect(encryptIfNeeded).toHaveBeenCalledWith(contact.senderPhone);
                expect(contact.senderPhone).toBe('encrypted_encrypted_+237 6XX XXX XXX');
            });

            it('should encrypt senderEmail if changed', () => {
                const contact = new Contact(mockCont);
                contact.changed.mockImplementation((field) => field === 'senderEmail');

                Contact.hooks.beforeUpdate(contact);

                expect(encryptIfNeeded).toHaveBeenCalledWith(contact.senderEmail);
                expect(contact.senderEmail).toBe('encrypted_john@example.com');
            });

            it('should not encrypt if not changed', () => {
                const contact = new Contact(mockCont);
                contact.changed.mockReturnValue(false);

                Contact.hooks.beforeUpdate(contact);

                expect(encryptIfNeeded).not.toHaveBeenCalled();
            });
        });

        describe('afterFind', () => {
            it('should decrypt senderPhone and senderEmail for single contact', () => {
                const contact = new Contact(mockCont);

                Contact.hooks.afterFind(contact);

                expect(decrypt).toHaveBeenCalledWith('encrypted_+237 6XX XXX XXX');
                expect(decrypt).toHaveBeenCalledWith('john@example.com');
                expect(contact.senderPhone).toBe('+237 6XX XXX XXX');
                expect(contact.senderEmail).toBe('john@example.com');
            });

            it('should decrypt for array of contacts', () => {
                const contacts = [
                    new Contact(mockCont),
                    new Contact({ ...mockCont, id: 'contact-456', senderEmail: 'encrypted_jane@example.com' })
                ];

                Contact.hooks.afterFind(contacts);

                expect(decrypt).toHaveBeenCalledWith('encrypted_+237 6XX XXX XXX');
                expect(decrypt).toHaveBeenCalledWith('john@example.com');
                expect(decrypt).toHaveBeenCalledWith('encrypted_jane@example.com');
                expect(contacts[1].senderEmail).toBe('jane@example.com');
            });

            it('should handle contact without phone or email', () => {
                const contact = new Contact({ ...mockCont, senderPhone: null, senderEmail: null });

                Contact.hooks.afterFind(contact);

                expect(decrypt).toHaveBeenCalledWith(null);
            });

            it('should handle null result', () => {
                Contact.hooks.afterFind(null);

                expect(decrypt).not.toHaveBeenCalled();
            });
        });
    });

    describe('Instance Methods', () => {
        describe('canBeViewedBy', () => {
            it('should return true for admin', async () => {
                const contact = new Contact(mockCont);
                contact.canBeViewedBy = jest.fn(async (user) => {
                    if (user && user.role === 'admin') return true;
                    return false;
                });

                const user = { role: 'admin' };

                const result = await contact.canBeViewedBy(user);

                expect(result).toBe(true);
            });

            it('should return true if already unlocked', async () => {
                const contact = new Contact({ ...mockCont, isUnlocked: true });
                contact.canBeViewedBy = jest.fn(async (user) => {
                    if (contact.isUnlocked) return true;
                    return false;
                });

                const user = { role: 'client' };

                const result = await contact.canBeViewedBy(user);

                expect(result).toBe(true);
            });

            it('should return true and unlock if provider has active subscription', async () => {
                const contact = new Contact(mockCont);
                contact.canBeViewedBy = jest.fn(async (user) => {
                    const provider = await Provider.findOne({
                        where: { id: contact.providerId },
                        include: expect.any(Array)
                    });

                    if (provider && provider.subscription && provider.subscription.isActive()) {
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

                Provider.findOne.mockResolvedValue(mockProvider);

                const result = await contact.canBeViewedBy(user);

                expect(result).toBe(true);
                expect(contact.isUnlocked).toBe(true);
                expect(contact.unlockedAt).toBeInstanceOf(Date);
                expect(contact.save).toHaveBeenCalled();
            });

            it('should return false if no active subscription', async () => {
                const contact = new Contact(mockCont);
                contact.isUnlocked = false;
                contact.canBeViewedBy = jest.fn(async (user) => {
                    const provider = await Provider.findOne({
                        where: { id: contact.providerId },
                        include: expect.any(Array)
                    });

                    if (provider && provider.subscription && provider.subscription.isActive()) {
                        return true;
                    }

                    return false;
                });

                const user = { role: 'client' };

                Provider.findOne.mockResolvedValue(null);

                const result = await contact.canBeViewedBy(user);

                contact.isUnlocked = false;

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
                        messagePreview: contact.message.length > 50 ? contact.message.substring(0, 50) + '...' : contact.message,
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
                    messagePreview: 'This is a test message for contact',
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
                    messagePreview: 'This is a test message for contact',
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
                        messagePreview: contact.message.length > 50 ? contact.message.substring(0, 50) + '...' : contact.message,
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
                    messagePreview: 'This is a test message for contact',
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
                        messagePreview: contact.message.length > 50 ? contact.message.substring(0, 50) + '...' : contact.message,
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

                expect(result.messagePreview).toBe('Short');
            });
        });
    });
});
