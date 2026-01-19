// routes/reviews.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/products/:productId/rating', reviewController.getProductRating);
router.get('/products/:productId/reviews', reviewController.getProductReviews);

// Protected routes (require authentication)
router.use(auth);

// User review management
router.get('/user/my-reviews', reviewController.getUserReviews);
router.post('/', reviewController.submitReview);
router.put('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);
router.post('/:reviewId/helpful', reviewController.markHelpful);
router.get('/can-review/:productId', reviewController.canReviewProduct);

module.exports = router;