const express = require('express');
const router = express.Router();
const { 
  getSliderImages, 
  uploadSliderImage, 
  updateSlider, 
  deleteSlider 
} = require('../controllers/sliderController');
const { singleUpload, handleUploadError } = require('../middleware/uploadMiddleware');

console.log('✅ Slider routes loaded');

// GET /api/slider - Get all slider images
router.get('/', getSliderImages);

// POST /api/slider - Upload image and create slider record
router.post('/', 
  singleUpload,
  handleUploadError,
  uploadSliderImage
);

// PUT /api/slider/:id - Update a slider record
router.put('/:id', updateSlider);

// DELETE /api/slider/:id - Delete a slider record
router.delete('/:id', deleteSlider);

module.exports = router;