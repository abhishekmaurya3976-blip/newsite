const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { singleUpload, handleUploadError } = require('../middleware/uploadMiddleware');

console.log('✅ Category routes loaded');

// Public routes
router.get('/', categoryController.getAll);
router.get('/tree', categoryController.getTree);
router.get('/slug/:slug', categoryController.getBySlug);
router.get('/:id', categoryController.getById);

// Admin routes with image upload support
router.post('/', 
  singleUpload,
  handleUploadError,
  categoryController.create
);

router.put('/:id', 
  singleUpload,
  handleUploadError,
  categoryController.update
);

router.delete('/:id', categoryController.delete);

module.exports = router;