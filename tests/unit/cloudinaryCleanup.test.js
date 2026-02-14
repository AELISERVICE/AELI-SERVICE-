/**
 * Cloudinary Cleanup Unit Tests
 * Tests for Cloudinary image management utilities
 */

const { extractPublicId, deleteImage, deleteImages, setupCleanupHooks } = require('../../src/utils/cloudinaryCleanup');

// Mock cloudinary
jest.mock('cloudinary', () => ({
    v2: {
        uploader: {
            destroy: jest.fn()
        }
    }
}));

// Mock logger
jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));

// Mock models
jest.mock('../../src/models', () => ({
    Provider: {
        addHook: jest.fn()
    }
}));

const cloudinary = require('cloudinary').v2;
const logger = require('../../src/utils/logger');

describe('Cloudinary Cleanup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('extractPublicId', () => {
        it('should extract public ID from standard Cloudinary URL', () => {
            const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg';
            const result = extractPublicId(url);

            expect(result).toBe('folder/image');
        });

        it('should extract public ID without version', () => {
            const url = 'https://res.cloudinary.com/demo/image/upload/folder/image.png';
            const result = extractPublicId(url);

            expect(result).toBe('folder/image');
        });

        it('should handle different file extensions', () => {
            const url = 'https://res.cloudinary.com/demo/image/upload/v1/test/image.jpeg';
            const result = extractPublicId(url);

            expect(result).toBe('test/image');
        });

        it('should return null for invalid URL', () => {
            expect(extractPublicId('invalid-url')).toBeNull();
            expect(extractPublicId('')).toBeNull();
            expect(extractPublicId(null)).toBeNull();
            expect(extractPublicId(undefined)).toBeNull();
        });

        it('should return null for non-string input', () => {
            expect(extractPublicId(123)).toBeNull();
            expect(extractPublicId({})).toBeNull();
        });

        it('should handle malformed URLs gracefully', () => {
            const url = 'https://res.cloudinary.com/demo/image/upload/';
            const result = extractPublicId(url);

            expect(result).toBeNull();
        });
    });

    describe('deleteImage', () => {
        it('should successfully delete an image', async () => {
            const url = 'https://res.cloudinary.com/demo/image/upload/v1/test/image.jpg';
            cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

            const result = await deleteImage(url);

            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test/image');
            expect(logger.info).toHaveBeenCalledWith('Deleted image from Cloudinary: test/image');
            expect(result).toBe(true);
        });

        it('should handle deletion failure', async () => {
            const url = 'https://res.cloudinary.com/demo/image/upload/v1/test/image.jpg';
            cloudinary.uploader.destroy.mockResolvedValue({ result: 'not found' });

            const result = await deleteImage(url);

            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test/image');
            expect(logger.warn).toHaveBeenCalledWith('Failed to delete image: test/image', { result: 'not found' });
            expect(result).toBe(false);
        });

        it('should handle Cloudinary API error', async () => {
            const url = 'https://res.cloudinary.com/demo/image/upload/v1/test/image.jpg';
            const error = new Error('API error');
            cloudinary.uploader.destroy.mockRejectedValue(error);

            const result = await deleteImage(url);

            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test/image');
            expect(logger.error).toHaveBeenCalledWith('Error deleting image test/image:', error);
            expect(result).toBe(false);
        });

        it('should return false for invalid URL', async () => {
            const result = await deleteImage('invalid-url');

            expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalledWith('Could not extract public ID from URL:', 'invalid-url');
            expect(result).toBe(false);
        });
    });

    describe('deleteImages', () => {
        beforeEach(() => {
            cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });
        });

        it('should delete multiple images successfully', async () => {
            const urls = [
                'https://res.cloudinary.com/demo/image/upload/v1/test/image1.jpg',
                'https://res.cloudinary.com/demo/image/upload/v1/test/image2.jpg'
            ];

            const result = await deleteImages(urls);

            expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test/image1');
            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test/image2');
            expect(logger.info).toHaveBeenCalledWith('Cloudinary cleanup: 2 deleted, 0 failed');
            expect(result).toEqual({ deleted: 2, failed: 0 });
        });

        it('should handle mixed success and failure', async () => {
            cloudinary.uploader.destroy
                .mockResolvedValueOnce({ result: 'ok' })
                .mockResolvedValueOnce({ result: 'not found' });

            const urls = [
                'https://res.cloudinary.com/demo/image/upload/v1/test/image1.jpg',
                'https://res.cloudinary.com/demo/image/upload/v1/test/image2.jpg'
            ];

            const result = await deleteImages(urls);

            expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
            expect(logger.info).toHaveBeenCalledWith('Cloudinary cleanup: 1 deleted, 1 failed');
            expect(result).toEqual({ deleted: 1, failed: 1 });
        });

        it('should handle empty array', async () => {
            const result = await deleteImages([]);

            expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
            expect(result).toEqual({ deleted: 0, failed: 0 });
        });

        it('should handle non-array input', async () => {
            const result = await deleteImages(null);

            expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
            expect(result).toEqual({ deleted: 0, failed: 0 });
        });

        it('should handle promise rejection', async () => {
            const error = new Error('API error');
            cloudinary.uploader.destroy.mockRejectedValue(error);

            const urls = ['https://res.cloudinary.com/demo/image/upload/v1/test/image.jpg'];

            const result = await deleteImages(urls);

            expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(1);
            expect(logger.info).toHaveBeenCalledWith('Cloudinary cleanup: 0 deleted, 1 failed');
            expect(result).toEqual({ deleted: 0, failed: 1 });
        });
    });

    describe('setupCleanupHooks', () => {
        it('should register cleanup hooks successfully', () => {
            const { Provider } = require('../../src/models');

            setupCleanupHooks();

            expect(Provider.addHook).toHaveBeenCalledWith('beforeDestroy', expect.any(Function));
            expect(logger.info).toHaveBeenCalledWith('Cloudinary cleanup hooks registered');
        });

        it('should handle hook registration error', () => {
            const { Provider } = require('../../src/models');
            Provider.addHook.mockImplementation(() => {
                throw new Error('Hook error');
            });

            setupCleanupHooks();

            expect(logger.error).toHaveBeenCalledWith('Failed to setup Cloudinary cleanup hooks:', expect.any(Error));
        });

        it('should execute cleanup in beforeDestroy hook', async () => {
            const { Provider } = require('../../src/models');
            cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

            setupCleanupHooks();

            const hookCallback = Provider.addHook.mock.calls[0][1];
            const mockProvider = {
                id: 1,
                photos: [
                    'https://res.cloudinary.com/demo/image/upload/v1/test/image1.jpg',
                    'https://res.cloudinary.com/demo/image/upload/v1/test/image2.jpg'
                ]
            };

            await hookCallback(mockProvider);

            expect(logger.info).toHaveBeenCalledWith('Cleaning up 2 photos for provider 1');
            expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
        });

        it('should skip cleanup if no photos', async () => {
            const { Provider } = require('../../src/models');

            setupCleanupHooks();

            const hookCallback = Provider.addHook.mock.calls[0][1];
            const mockProvider = {
                id: 1,
                photos: []
            };

            await hookCallback(mockProvider);

            expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
        });
    });
});
