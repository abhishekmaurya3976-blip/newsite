const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { multipleUpload, handleUploadError } = require('../middleware/uploadMiddleware');

console.log('✅ Product routes loaded');

// Public routes
router.get('/', productController.getProducts);
router.get('/slug/:slug', productController.getBySlug);
router.get('/:id', productController.getById);

// Admin routes (unprotected for now)
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

// Image upload route
router.post(
  '/upload-images',
  multipleUpload,
  handleUploadError,
  productController.uploadImages
);

module.exports = router;