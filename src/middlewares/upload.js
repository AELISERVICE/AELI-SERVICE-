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
 * Cloudinary storage configuration for advertising banners
 */
const bannerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'aeli-services/banners',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1920, height: 600, crop: 'limit' },
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
 * Multer upload configuration for advertising banners (single image)
 */
const uploadBanner = multer({
    storage: bannerStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: imageFileFilter
}).single('bannerImage');

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

/**
 * Middleware wrapper for banner upload with error handling
 */
const handleBannerUpload = (req, res, next) => {
    uploadBanner(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'La taille de la bannière ne doit pas dépasser 10MB'
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
 * Cloudinary storage configuration for verification documents (PDF, images)
 */
const documentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'aeli-services/documents',
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
        resource_type: 'auto'
    }
});

/**
 * File filter to allow documents (PDF and images)
 */
const documentFileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers PDF et images (JPG, PNG) sont autorisés'), false);
    }
};

/**
 * Multer upload configuration for documents (max 5 files, 10MB each)
 */
const uploadDocuments = multer({
    storage: documentStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max per file
        files: 5
    },
    fileFilter: documentFileFilter
}).array('documents', 5);

/**
 * Middleware wrapper for document upload with error handling
 */
const handleDocumentUpload = (req, res, next) => {
    uploadDocuments(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'La taille de chaque document ne doit pas dépasser 10MB'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 5 documents autorisés'
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
 * Combined multer upload for provider application (photos + documents)
 * Accepts: photos (images for gallery) + documents (CNI, etc.)
 */
const applicationUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, require('os').tmpdir());
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + require('path').extname(file.originalname));
        }
    }),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max per file
        files: 10 // Max 10 files total (5 photos + 5 documents)
    },
    fileFilter: (req, file, cb) => {
        // Allow images and documents
        const allowedMimes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
            'application/pdf'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format de fichier non autorisé. Utilisez JPG, PNG, WebP ou PDF.'), false);
        }
    }
}).fields([
    { name: 'photos', maxCount: 5 },
    { name: 'documents', maxCount: 5 },
    { name: 'cni', maxCount: 1 },
    { name: 'imgcnirecto', maxCount: 1 },
    { name: 'imgcniverso', maxCount: 1 }
]);

/**
 * Middleware wrapper for application upload (photos + documents)
 */
const handleApplicationUpload = (req, res, next) => {
    applicationUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'La taille de chaque fichier ne doit pas dépasser 10MB'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Trop de fichiers uploadés'
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
    handleGalleryPhotosUpload,
    handleDocumentUpload,
    handleApplicationUpload,
    handleBannerUpload
};
