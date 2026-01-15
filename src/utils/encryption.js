/**
 * Encryption Utility for Sensitive Data
 * Uses AES-256-GCM for authenticated encryption
 */

const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const ENCODING = 'hex';

/**
 * Get encryption key from environment
 * Must be exactly 32 characters (256 bits)
 */
const getEncryptionKey = () => {
    let key = process.env.ENCRYPTION_KEY;

    // Fallback for test environment
    if (!key && process.env.NODE_ENV === 'test') {
        key = 'test-encryption-key-32-chars!!!!';
    }

    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    if (key.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
    }

    return Buffer.from(key, 'utf8');
};

/**
 * Encrypt a string using AES-256-GCM
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted text (iv:authTag:ciphertext)
 */
const encrypt = (text) => {
    if (!text || typeof text !== 'string') {
        return text;
    }

    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', ENCODING);
        encrypted += cipher.final(ENCODING);

        const authTag = cipher.getAuthTag();

        // Format: iv:authTag:ciphertext
        return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error.message);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypt a string using AES-256-GCM
 * @param {string} encryptedText - Encrypted text (iv:authTag:ciphertext)
 * @returns {string} Decrypted plain text
 */
const decrypt = (encryptedText) => {
    if (!encryptedText || typeof encryptedText !== 'string') {
        return encryptedText;
    }

    // Check if it's actually encrypted (contains the separator pattern)
    if (!encryptedText.includes(':')) {
        return encryptedText; // Return as-is if not encrypted
    }

    try {
        const key = getEncryptionKey();
        const parts = encryptedText.split(':');

        if (parts.length !== 3) {
            return encryptedText; // Not in expected format, return as-is
        }

        const iv = Buffer.from(parts[0], ENCODING);
        const authTag = Buffer.from(parts[1], ENCODING);
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        // Return original if decryption fails (might be plain text)
        return encryptedText;
    }
};

/**
 * Create a blind index for searchable encryption
 * Uses HMAC-SHA256 for deterministic hashing
 * @param {string} text - Text to hash
 * @returns {string} Hex hash for searching
 */
const createBlindIndex = (text) => {
    if (!text || typeof text !== 'string') {
        return null;
    }

    try {
        const key = getEncryptionKey();
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(text.toLowerCase().trim());
        return hmac.digest('hex');
    } catch (error) {
        console.error('Blind index error:', error.message);
        return null;
    }
};

/**
 * Check if a value is already encrypted
 * @param {string} value - Value to check
 * @returns {boolean} True if encrypted
 */
const isEncrypted = (value) => {
    if (!value || typeof value !== 'string') {
        return false;
    }

    const parts = value.split(':');
    if (parts.length !== 3) {
        return false;
    }

    // Check if parts look like hex values
    const hexRegex = /^[0-9a-f]+$/i;
    return parts.every(part => hexRegex.test(part));
};

/**
 * Encrypt field if not already encrypted
 * @param {string} value - Value to encrypt
 * @returns {string} Encrypted value
 */
const encryptIfNeeded = (value) => {
    if (!value || isEncrypted(value)) {
        return value;
    }
    return encrypt(value);
};

/**
 * Generate a random encryption key (for setup)
 * @returns {string} 32-character random key
 */
const generateEncryptionKey = () => {
    return crypto.randomBytes(16).toString('hex');
};

module.exports = {
    encrypt,
    decrypt,
    createBlindIndex,
    isEncrypted,
    encryptIfNeeded,
    generateEncryptionKey
};
