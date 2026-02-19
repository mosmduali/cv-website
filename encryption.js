const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

// Use environment variable or fallback to development key
// IMPORTANT: In production, use a strong random key from environment
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-change-in-production-32b';

// Generate a proper 32-byte key from the string
function getKey() {
    return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

/**
 * Encrypt a string value
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in base64 format
 */
function encrypt(text) {
    if (!text || text === '') {
        return null;
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = getKey();

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypt an encrypted string
 * @param {string} encryptedText - Encrypted text in base64 format
 * @returns {string} - Decrypted plain text
 */
function decrypt(encryptedText) {
    if (!encryptedText || encryptedText === '') {
        return null;
    }

    try {
        const stringValue = Buffer.from(String(encryptedText), 'base64');
        const salt = stringValue.slice(0, SALT_LENGTH);
        const iv = stringValue.slice(SALT_LENGTH, TAG_POSITION);
        const tag = stringValue.slice(TAG_POSITION, ENCRYPTED_POSITION);
        const encrypted = stringValue.slice(ENCRYPTED_POSITION);

        const key = getKey();
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        return decipher.update(encrypted) + decipher.final('utf8');
    } catch (error) {
        console.error('Decryption error:', error.message);
        return null;
    }
}

module.exports = {
    encrypt,
    decrypt
};
