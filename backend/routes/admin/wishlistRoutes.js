const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/admin/wishlistController');
const { auth } = require('../../middleware/auth');

// All routes require authentication
// IMPORTANT: Specific route must come BEFORE parameterized route
router.delete('/bulk-delete', auth, wishlistController.bulkDeleteWishlists);
router.delete('/:id', auth, wishlistController.deleteWishlist);

router.get('/', auth, wishlistController.getWishlists);
router.get('/stats', auth, wishlistController.getWishlistStats);

module.exports = router;