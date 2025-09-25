import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resonance-studio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto:good' },
      { format: 'auto' }
    ]
  },
});

// Configure multer with Cloudinary storage
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper functions for image operations
export const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

export const uploadMultiple = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Delete multiple images
export const deleteImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
    throw error;
  }
};

// Generate optimized image URL
export const getOptimizedUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 600,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    secure: true
  });
};

// Upload image from URL (for seeding or external imports)
export const uploadFromUrl = async (url, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: 'resonance-studio',
      ...options
    });
    return result;
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    throw error;
  }
};

// Get image details
export const getImageDetails = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting image details:', error);
    throw error;
  }
};

// Create image variants for different screen sizes
export const createImageVariants = (publicId) => {
  return {
    thumbnail: getOptimizedUrl(publicId, { width: 150, height: 150, crop: 'thumb' }),
    small: getOptimizedUrl(publicId, { width: 400, height: 300 }),
    medium: getOptimizedUrl(publicId, { width: 800, height: 600 }),
    large: getOptimizedUrl(publicId, { width: 1200, height: 800 }),
    original: getOptimizedUrl(publicId, { width: 'auto', height: 'auto' })
  };
};

export default cloudinary;