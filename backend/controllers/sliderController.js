const Slider = require('../models/Slider');
const asyncHandler = require('../middleware/asyncHandler');

// Helper function to handle local file storage (fallback if no Cloudinary)
const saveFileLocally = (buffer, filename) => {
  // For development, we can save files locally
  // In production, you should use Cloudinary or S3
  const fs = require('fs');
  const path = require('path');
  
  const uploadDir = path.join(__dirname, '../uploads/slider');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const uniqueFilename = `${Date.now()}-${filename}`;
  const filePath = path.join(uploadDir, uniqueFilename);
  
  fs.writeFileSync(filePath, buffer);
  
  return {
    filename: uniqueFilename,
    path: filePath,
    url: `/uploads/slider/${uniqueFilename}` // This will be served statically
  };
};

// @desc    Get all slider images
// @route   GET /api/slider
// @access  Public
exports.getSliderImages = asyncHandler(async (req, res) => {
  const { admin } = req.query;
  
  // For admin, return all images; for public, return only active ones
  const filter = admin === 'true' ? {} : { isActive: true };
  
  const sliderImages = await Slider.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: sliderImages,
    count: sliderImages.length
  });
});

// @desc    Upload slider image
// @route   POST /api/slider
// @access  Public (Temporarily)
exports.uploadSliderImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'No image file provided' 
    });
  }

  const { 
    altText = '', 
    title = '', 
    subtitle = '', 
    link = '', 
    order = 0, 
    isActive = 'true' 
  } = req.body;

  if (!altText) {
    return res.status(400).json({ 
      success: false, 
      message: 'Alt text is required' 
    });
  }

  let imageUrl, publicId;

  // Try Cloudinary first if configured
  try {
    // Check if Cloudinary is configured
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const cloudinary = require('../config/cloudinary');
      
      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'art-palzaa/slider',
            transformation: [
              { width: 1920, height: 1080, crop: 'limit', quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else {
      // Fallback to local storage
      const savedFile = saveFileLocally(req.file.buffer, req.file.originalname);
      imageUrl = savedFile.url;
      publicId = savedFile.filename;
    }
  } catch (uploadError) {
    console.error('Upload error:', uploadError);
    
    // Fallback to local storage if Cloudinary fails
    const savedFile = saveFileLocally(req.file.buffer, req.file.originalname);
    imageUrl = savedFile.url;
    publicId = savedFile.filename;
  }

  // Create slider record
  const sliderData = {
    imageUrl,
    publicId,
    altText,
    title,
    subtitle,
    link,
    order: parseInt(order),
    isActive: isActive === 'true'
  };

  const newSlider = await Slider.create(sliderData);

  res.status(201).json({
    success: true,
    message: 'Slider image uploaded successfully',
    data: newSlider
  });
});

// @desc    Update slider
// @route   PUT /api/slider/:id
// @access  Public (Temporarily)
exports.updateSlider = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Slider ID is required'
    });
  }

  const updatedSlider = await Slider.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).lean();

  if (!updatedSlider) {
    return res.status(404).json({
      success: false,
      message: 'Slider image not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Slider updated successfully',
    data: updatedSlider
  });
});

// @desc    Delete slider
// @route   DELETE /api/slider/:id
// @access  Public (Temporarily)
exports.deleteSlider = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Slider ID is required'
    });
  }

  // Find the slider first
  const slider = await Slider.findById(id);
  
  if (!slider) {
    return res.status(404).json({
      success: false,
      message: 'Slider image not found'
    });
  }

  // Try to delete from Cloudinary if configured
  if (process.env.CLOUDINARY_CLOUD_NAME && slider.publicId) {
    try {
      const cloudinary = require('../config/cloudinary');
      await cloudinary.uploader.destroy(slider.publicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }
  }

  // Delete from database
  await Slider.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Slider image deleted successfully',
    data: {
      id: slider._id,
      title: slider.title
    }
  });
});