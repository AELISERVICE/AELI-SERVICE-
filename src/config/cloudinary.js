const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload image
const uploadImage = async (file, folder = 'aeli-services') => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: folder,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [
                { width: 1200, height: 800, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });
        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

// Helper function to delete image
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
};

// Extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${filename.split('.')[0]}`;
    return publicId;
};

// Helper function to upload document (PDF, images)
const uploadDocument = async (file, folder = 'aeli-services/documents') => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: folder,
            allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
            resource_type: 'auto', // Allows PDF and images
            flags: 'attachment', // For PDF download
            access_mode: 'authenticated' // Secure access
        });
        return {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            originalFilename: result.original_filename
        };
    } catch (error) {
        throw new Error(`Document upload failed: ${error.message}`);
    }
};

module.exports = {
    cloudinary,
    uploadImage,
    deleteImage,
    getPublicIdFromUrl,
    uploadDocument
};
