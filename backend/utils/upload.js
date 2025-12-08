const cloudinary = require('cloudinary').v2;

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {String} folder - Cloudinary folder
 * @returns {Promise} - Cloudinary upload result
 */
const uploadToCloudinaryBuffer = async (buffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    uploadStream.end(buffer);
  });
};

/**
 * Upload file to Cloudinary
 * @param {String} filePath - File path
 * @param {String} folder - Cloudinary folder
 * @returns {Promise} - Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder = 'products') => {
  return cloudinary.uploader.upload(filePath, {
    folder: folder,
    resource_type: 'auto',
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto' },
      { format: 'auto' }
    ]
  });
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise} - Cloudinary delete result
 */
const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array} publicIds - Array of public IDs
 * @returns {Promise} - Cloudinary delete result
 */
const deleteMultipleFromCloudinary = async (publicIds) => {
  return cloudinary.api.delete_resources(publicIds);
};

module.exports = {
  uploadToCloudinaryBuffer,
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary
};