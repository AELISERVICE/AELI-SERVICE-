/**
 * User Model Unit Tests
 * Tests for User model methods and hooks
 */

const bcrypt = require('bcryptjs');
const { encryptIfNeeded, decrypt } = require('../../src/utils/encryption');

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('../../src/utils/encryption');

// Mock the User model
const mockUser = {
    comparePassword: jest.fn(),
    toPublicJSON: jest.fn(),
    changed: jest.fn().mockReturnValue(false),
    save: jest.fn().mockResolvedValue()
};

const MockUser = jest.fn().mockImplementation((data) => {
    return Object.assign({}, mockUser, data);
});

// Add hooks to the mock
MockUser.hooks = {
    beforeCreate: jest.fn(),
    beforeUpdate: jest.fn(),
    afterFind: jest.fn()
};

jest.mock('../../src/models', () => ({
    Contact: jest.fn((data) => ({ ...data })),
    Provider: jest.fn((data) => ({ ...data })),
    Payment: jest.fn((data) => ({ ...data })),
    User: MockUser
}));

const { User } = require('../../src/models');

describe('User Model', () => {
    let mockUser;

    beforeEach(() => {
        jest.clearAllMocks();

        mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            password: 'hashedpassword',
            firstName: 'John',
            lastName: 'Doe',
            phone: 'encryptedphone',
            country: 'Cameroun',
            gender: 'male',
            role: 'client',
            profilePhoto: 'photo.jpg',
            isActive: true,
            isEmailVerified: false,
            createdAt: new Date(),
            changed: jest.fn().mockReturnValue(false),
            save: jest.fn().mockResolvedValue()
        };

        // Setup encryption mocks
        encryptIfNeeded.mockImplementation((value) => `encrypted_${value}`);
        decrypt.mockImplementation((value) => value ? value.replace('encrypted_', '') : value);
    });

    describe('Hooks', () => {
        describe('beforeCreate', () => {
            it('should hash password and encrypt phone before create', async () => {
                const userData = {
                    email: 'test@example.com',
                    password: 'plainpassword',
                    phone: '123456789',
                    firstName: 'John',
                    lastName: 'Doe'
                };

                const user = new User(userData);

                User.hooks.beforeCreate = jest.fn(async (usr) => {
                    if (usr.password) {
                        const salt = await bcrypt.genSalt(10);
                        usr.password = await bcrypt.hash(usr.password, salt);
                    }
                    if (usr.phone) {
                        usr.phone = encryptIfNeeded(usr.phone);
                    }
                });

                await User.hooks.beforeCreate(user);

                expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
                expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 'salt');
                expect(user.password).toBe('hashedpassword');
                expect(encryptIfNeeded).toHaveBeenCalledWith('123456789');
                expect(user.phone).toBe('encrypted_123456789');
            });

            it('should handle user without phone', async () => {
                const userData = {
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    password: 'plainpassword'
                };

                const user = new User(userData);

                User.hooks.beforeCreate = jest.fn(async (usr) => {
                    if (usr.password) {
                        const salt = await bcrypt.genSalt(10);
                        usr.password = await bcrypt.hash(usr.password, salt);
                    }
                    if (usr.phone) {
                        usr.phone = encryptIfNeeded(usr.phone);
                    }
                });

                await User.hooks.beforeCreate(user);

                expect(user.password).toBe('hashedpassword');
                expect(encryptIfNeeded).not.toHaveBeenCalled();
            });

            it('should handle user without password', async () => {
                const userData = {
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '123456789'
                };

                const user = new User(userData);

                User.hooks.beforeCreate = jest.fn(async (usr) => {
                    if (usr.password) {
                        const salt = await bcrypt.genSalt(10);
                        usr.password = await bcrypt.hash(usr.password, salt);
                    }
                    if (usr.phone) {
                        usr.phone = encryptIfNeeded(usr.phone);
                    }
                });

                await User.hooks.beforeCreate(user);

                expect(bcrypt.genSalt).not.toHaveBeenCalled();
                expect(encryptIfNeeded).toHaveBeenCalledWith('123456789');
            });
        });

        describe('beforeUpdate', () => {
            it('should hash password if changed', async () => {
                const user = new User(mockUser);
                user.changed = jest.fn((field) => field === 'password');

                User.hooks.beforeUpdate = jest.fn(async (usr) => {
                    if (usr.changed('password') && usr.password) {
                        const salt = await bcrypt.genSalt(10);
                        usr.password = await bcrypt.hash(usr.password, salt);
                    }
                    if (usr.changed('phone') && usr.phone) {
                        usr.phone = encryptIfNeeded(usr.phone);
                    }
                });

                await User.hooks.beforeUpdate(user);

                expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
                expect(bcrypt.hash).toHaveBeenCalledWith(user.password, 'salt');
                expect(user.password).toBe('newhashedpassword');
            });

            it('should encrypt phone if changed', async () => {
                const user = new User(mockUser);
                user.changed = jest.fn((field) => field === 'phone');

                User.hooks.beforeUpdate = jest.fn(async (usr) => {
                    if (usr.changed('password') && usr.password) {
                        const salt = await bcrypt.genSalt(10);
                        usr.password = await bcrypt.hash(usr.password, salt);
                    }
                    if (usr.changed('phone') && usr.phone) {
                        usr.phone = encryptIfNeeded(usr.phone);
                    }
                });

                await User.hooks.beforeUpdate(user);

                expect(encryptIfNeeded).toHaveBeenCalledWith(user.phone);
                expect(user.phone).toBe('encrypted_encryptedphone');
            });

            it('should not hash password if not changed', async () => {
                const user = new User(mockUser);
                user.changed = jest.fn(() => false);

                User.hooks.beforeUpdate = jest.fn(async (usr) => {
                    if (usr.changed('password') && usr.password) {
                        const salt = await bcrypt.genSalt(10);
                        usr.password = await bcrypt.hash(usr.password, salt);
                    }
                    if (usr.changed('phone') && usr.phone) {
                        usr.phone = encryptIfNeeded(usr.phone);
                    }
                });

                await User.hooks.beforeUpdate(user);

                expect(bcrypt.genSalt).not.toHaveBeenCalled();
            });
        });

        describe('afterFind', () => {
            it('should decrypt phone for single user', () => {
                const user = new User(mockUser);

                User.hooks.afterFind = jest.fn((result) => {
                    if (!result) return;

                    if (Array.isArray(result)) {
                        result.forEach((usr) => {
                            if (usr && usr.phone) {
                                usr.phone = decrypt(usr.phone);
                            }
                        });
                    } else {
                        if (result && result.phone) {
                            result.phone = decrypt(result.phone);
                        }
                    }
                });

                User.hooks.afterFind(user);

                expect(decrypt).toHaveBeenCalledWith('encryptedphone');
                expect(user.phone).toBe('phone');
            });

            it('should decrypt phone for array of users', () => {
                const users = [
                    new User({ ...mockUser, phone: 'encryptedphone' }),
                    new User({ ...mockUser, id: 'user-456', phone: 'encryptedphone2' })
                ];

                User.hooks.afterFind = jest.fn((result) => {
                    if (!result) return;

                    if (Array.isArray(result)) {
                        result.forEach((usr) => {
                            if (usr && usr.phone) {
                                usr.phone = decrypt(usr.phone);
                            }
                        });
                    } else {
                        if (result && result.phone) {
                            result.phone = decrypt(result.phone);
                        }
                    }
                });

                User.hooks.afterFind(users);

                expect(decrypt).toHaveBeenCalledWith('encryptedphone');
                expect(decrypt).toHaveBeenCalledWith('encryptedphone2');
                expect(users[0].phone).toBe('phone');
                expect(users[1].phone).toBe('phone2');
            });

            it('should handle null result', () => {
                User.hooks.afterFind(null);

                expect(decrypt).not.toHaveBeenCalled();
            });

            it('should handle user without phone', () => {
                const user = new User({ ...mockUser, phone: null });

                User.hooks.afterFind(user);

                expect(decrypt).not.toHaveBeenCalled();
            });
        });
    });

    describe('Instance Methods', () => {
        describe('comparePassword', () => {
            it('should compare password successfully', async () => {
                const user = new User(mockUser);
                user.comparePassword = jest.fn().mockResolvedValue(true);

                const result = await user.comparePassword('candidatepassword');

                expect(result).toBe(true);
            });

            it('should return false for incorrect password', async () => {
                const user = new User(mockUser);
                user.comparePassword = jest.fn().mockResolvedValue(false);

                const result = await user.comparePassword('wrongpassword');

                expect(result).toBe(false);
            });
        });

        describe('toPublicJSON', () => {
            it('should return public user data', () => {
                const user = new User(mockUser);
                user.toPublicJSON = jest.fn().mockReturnValue({
                    id: 'user-123',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: 'phone', // decrypted
                    country: 'Cameroun',
                    gender: 'male',
                    role: 'client',
                    profilePhoto: 'photo.jpg',
                    isActive: true,
                    isEmailVerified: false,
                    createdAt: mockUser.createdAt
                });

                const result = user.toPublicJSON();

                expect(result).toEqual({
                    id: 'user-123',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: 'phone', // decrypted
                    country: 'Cameroun',
                    gender: 'male',
                    role: 'client',
                    profilePhoto: 'photo.jpg',
                    isActive: true,
                    isEmailVerified: false,
                    createdAt: mockUser.createdAt
                });
            });

            it('should handle user without phone', () => {
                const user = new User({ ...mockUser, phone: null });
                user.toPublicJSON = jest.fn().mockReturnValue({
                    id: 'user-123',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: null,
                    country: 'Cameroun',
                    gender: 'male',
                    role: 'client',
                    profilePhoto: 'photo.jpg',
                    isActive: true,
                    isEmailVerified: false,
                    createdAt: mockUser.createdAt
                });

                const result = user.toPublicJSON();

                expect(result.phone).toBeNull();
            });
        });
    });
});
