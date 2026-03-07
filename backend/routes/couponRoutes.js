const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect } = require('../middleware/auth'); // Add this import

// Public routes
router.post('/validate', protect, couponController.validateCoupon); // Add protect middleware

// Admin routes - Still without auth for development (but should add in production)
router.get('/admin/coupons', couponController.getAllCoupons);
router.post('/admin/coupons', couponController.createCoupon);
router.put('/admin/coupons/:id', couponController.updateCoupon);
router.delete('/admin/coupons/:id', couponController.deleteCoupon);
router.get('/admin/coupons/stats', couponController.getCouponStats);
router.get('/admin/coupons/:id', couponController.getCouponById);

module.exports = router;