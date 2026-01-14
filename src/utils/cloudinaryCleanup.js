const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null
 */
const extractPublicId = (url) => {
    if (!url || typeof url !== 'string') return null;

    try {
        // Match pattern: /upload/v{version}/{folder}/{public_id}.{ext}
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
        if (match) {
            return match[1];
        }
        return null;
    } catch (error) {
        logger.error('Error extracting public ID:', error);
        return null;
    }
};

/**
 * Delete a single image from Cloudinary
 * @param {string} url - Cloudinary URL
 * @returns {Promise<boolean>} Success status
 */
const deleteImage = async (url) => {
    const publicId = extractPublicId(url);
    if (!publicId) {
        logger.warn('Could not extract public ID from URL:', url);
        return false;
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === 'ok') {
            logger.info(`Deleted image from Cloudinary: ${publicId}`);
            return true;
        } else {
            logger.warn(`Failed to delete image: ${publicId}`, result);
            return false;
        }
    } catch (error) {
        logger.error(`Error deleting image ${publicId}:`, error);
        return false;
    }
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} urls - Array of Cloudinary URLs
 * @returns {Promise<{deleted: number, failed: number}>} Result summary
 */
const deleteImages = async (urls) => {
    if (!Array.isArray(urls) || urls.length === 0) {
        return { deleted: 0, failed: 0 };
    }

    const results = await Promise.allSettled(urls.map(url => deleteImage(url)));

    const deleted = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    const failed = results.length - deleted;

    logger.info(`Cloudinary cleanup: ${deleted} deleted, ${failed} failed`);

    return { deleted, failed };
};

/**
 * Setup model hooks for automatic Cloudinary cleanup
 * Call this function after models are initialized
 */
const setupCleanupHooks = () => {
    try {
        const { Provider } = require('../models');

        // Cleanup provider photos on destroy
        Provider.addHook('beforeDestroy', async (provider, options) => {
            if (provider.photos && provider.photos.length > 0) {
                logger.info(`Cleaning up ${provider.photos.length} photos for provider ${provider.id}`);
                await deleteImages(provider.photos);
            }
        });

        logger.info('Cloudinary cleanup hooks registered');
    } catch (error) {
        logger.error('Failed to setup Cloudinary cleanup hooks:', error);
    }
};

module.exports = {
    extractPublicId,
    deleteImage,
    deleteImages,
    setupCleanupHooks
};
