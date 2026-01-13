const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

/**
 * Cloudinary storage configuration for profile photos
 */
const profilePhotoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'aeli-services/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
        ]
    }
});

/**
 * Cloudinary storage configuration for provider gallery photos
 */
const galleryPhotoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'aeli-services/gallery',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
        ]
    }
});

/**
 * File filter to only allow images
 */
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont autorisées'), false);
    }
};

/**
 * Multer upload configuration for profile photos (single image)
 */
const uploadProfilePhoto = multer({
    storage: profilePhotoStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: imageFileFilter
}).single('profilePhoto');

/**
 * Multer upload configuration for gallery photos (multiple images, max 5)
 */
const uploadGalleryPhotos = multer({
    storage: galleryPhotoStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max per file
        files: 5 // Max 5 files
    },
    fileFilter: imageFileFilter
}).array('photos', 5);

/**
 * Middleware wrapper for profile photo upload with error handling
 */
const handleProfilePhotoUpload = (req, res, next) => {
    uploadProfilePhoto(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'La taille de l\'image ne doit pas dépasser 5MB'
                });
            }
            return res.status(400).json({
                success: false,
                message: `Erreur d'upload: ${err.message}`
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
};

/**
 * Middleware wrapper for gallery photos upload with error handling
 */
const handleGalleryPhotosUpload = (req, res, next) => {
    uploadGalleryPhotos(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'La taille de chaque image ne doit pas dépasser 5MB'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 5 images autorisées'
                });
            }
            return res.status(400).json({
                success: false,
                message: `Erreur d'upload: ${err.message}`
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
};

module.exports = {
    uploadProfilePhoto,
    uploadGalleryPhotos,
    handleProfilePhotoUpload,
    handleGalleryPhotosUpload
};
