const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { auth } = require('../middleware/auth');

// User wishlist routes (all require authentication)
router.get('/', auth, wishlistController.getUserWishlist);
router.post('/', auth, wishlistController.addToWishlist);
router.get('/check/:productId', auth, wishlistController.checkWishlistStatus);
// IMPORTANT: Specific route must come BEFORE parameterized route
router.delete('/clear', auth, wishlistController.clearWishlist);
router.delete('/:productId', auth, wishlistController.removeFromWishlist);

module.exports = router;