// controllers/reviewController.js
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Helper function to safely convert to ObjectId
const toObjectId = (id) => {
  try {
    return mongoose.Types.ObjectId.createFromHexString(id);
  } catch (error) {
    throw new Error('Invalid ObjectId format');
  }
};

// @desc    Get product rating summary
// @route   GET /api/reviews/products/:productId/rating
// @access  Public
exports.getProductRating = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get rating data
    const ratingData = await Review.getAverageRating(productId);

    res.status(200).json({
      success: true,
      data: ratingData
    });
  } catch (error) {
    console.error('Get product rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product rating',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get product reviews with pagination
// @route   GET /api/reviews/products/:productId/reviews
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Convert productId to ObjectId for query
    const productObjectId = toObjectId(productId);

    // Build query
    const query = { 
      productId: productObjectId, 
      isApproved: true 
    };

    // Execute query with pagination
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'name avatar')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query)
    ]);

    // Format response
    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      userId: review.userId?._id || review.userId,
      userName: review.userId?.name || 'Anonymous',
      userAvatar: review.userId?.avatar || null,
      rating: review.rating,
      title: review.title || '',
      comment: review.comment,
      images: review.images || [],
      verifiedPurchase: review.verifiedPurchase || false,
      helpfulCount: review.helpfulCount || 0,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        reviews: formattedReviews,
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Private
exports.submitReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, rating, title, comment, images } = req.body;

    // Validate input
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID is required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be at least 10 characters long'
      });
    }

    if (comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot exceed 1000 characters'
      });
    }

    if (title && title.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 100 characters'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Convert IDs to ObjectId
    const userObjectId = toObjectId(userId.toString());
    const productObjectId = toObjectId(productId);

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ 
      userId: userObjectId, 
      productId: productObjectId 
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Check if user has purchased the product (for verified purchase)
    let verifiedPurchase = false;
    try {
      // Check if user has a delivered order containing this product
      const deliveredOrder = await Order.findOne({
        userId: userObjectId,
        'items.productId': productObjectId,
        orderStatus: 'delivered'
      });
      
      verifiedPurchase = !!deliveredOrder;
    } catch (error) {
      console.log('Could not verify purchase:', error.message);
      // Continue without verified purchase flag if order check fails
    }

    // Create review
    const review = new Review({
      userId: userObjectId,
      productId: productObjectId,
      rating,
      title: title ? title.trim() : undefined,
      comment: comment.trim(),
      images: images || [],
      verifiedPurchase,
      isApproved: true
    });

    await review.save();

    // Update product rating
    await Review.updateProductRating(productId);

    // Populate user details for response
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name avatar')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        _id: populatedReview._id,
        userId: populatedReview.userId?._id || populatedReview.userId,
        userName: populatedReview.userId?.name || 'Anonymous',
        userAvatar: populatedReview.userId?.avatar || null,
        rating: populatedReview.rating,
        title: populatedReview.title || '',
        comment: populatedReview.comment,
        images: populatedReview.images || [],
        verifiedPurchase: populatedReview.verifiedPurchase || false,
        helpfulCount: populatedReview.helpfulCount || 0,
        createdAt: populatedReview.createdAt,
        updatedAt: populatedReview.updatedAt
      }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Validate updates
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }

    if (title !== undefined) {
      if (title.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot exceed 100 characters'
        });
      }
      review.title = title.trim();
    }

    if (comment !== undefined) {
      if (!comment.trim() || comment.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Comment must be at least 10 characters long'
        });
      }
      if (comment.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Comment cannot exceed 1000 characters'
        });
      }
      review.comment = comment.trim();
    }

    if (images !== undefined) {
      if (images.length > 4) {
        return res.status(400).json({
          success: false,
          message: 'Cannot upload more than 4 images'
        });
      }
      review.images = images;
    }

    await review.save();

    // Update product rating
    await Review.updateProductRating(review.productId.toString());

    // Populate user details for response
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name avatar')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        _id: populatedReview._id,
        userId: populatedReview.userId?._id || populatedReview.userId,
        userName: populatedReview.userId?.name || 'Anonymous',
        userAvatar: populatedReview.userId?.avatar || null,
        rating: populatedReview.rating,
        title: populatedReview.title || '',
        comment: populatedReview.comment,
        images: populatedReview.images || [],
        verifiedPurchase: populatedReview.verifiedPurchase || false,
        helpfulCount: populatedReview.helpfulCount || 0,
        createdAt: populatedReview.createdAt,
        updatedAt: populatedReview.updatedAt
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const productId = review.productId.toString();
    await review.deleteOne();

    // Update product rating
    await Review.updateProductRating(productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked as helpful
    if (review.helpfulUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already marked this review as helpful'
      });
    }

    // Check if user is trying to mark their own review
    if (review.userId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot mark your own review as helpful'
      });
    }

    // Add user to helpfulUsers and increment helpfulCount
    review.helpfulUsers.push(userId);
    review.helpfulCount = review.helpfulUsers.length;
    
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpfulCount: review.helpfulCount
      }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking review as helpful',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Check if user can review a product
// @route   GET /api/reviews/can-review/:productId
// @access  Private
exports.canReviewProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Convert IDs to ObjectId
    const userObjectId = toObjectId(userId.toString());
    const productObjectId = toObjectId(productId);

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ 
      userId: userObjectId, 
      productId: productObjectId 
    });
    const hasReviewed = !!existingReview;

    // Check if user has purchased the product
    let hasPurchased = false;
    let deliveredOrder = null;
    
    try {
      deliveredOrder = await Order.findOne({
        userId: userObjectId,
        'items.productId': productObjectId,
        orderStatus: 'delivered'  // Fixed: changed from 'status' to 'orderStatus'
      });
      hasPurchased = !!deliveredOrder;
    } catch (error) {
      console.log('Could not check purchase history:', error.message);
      // If we can't check order history, assume they haven't purchased
    }

    // User can review if they have purchased and haven't reviewed yet
    const canReview = hasPurchased && !hasReviewed;

    res.status(200).json({
      success: true,
      data: {
        canReview,
        hasPurchased,
        hasReviewed,
        existingReviewId: existingReview ? existingReview._id : null,
        orderDetails: hasPurchased ? {
          orderNumber: deliveredOrder.orderNumber,
          deliveredAt: deliveredOrder.deliveredAt,
          orderDate: deliveredOrder.createdAt
        } : null
      }
    });
  } catch (error) {
    console.error('Can review product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking review eligibility',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user/my-reviews
// @access  Private
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userObjectId = toObjectId(userId.toString());

    const [reviews, total] = await Promise.all([
      Review.find({ userId: userObjectId })
        .populate('productId', 'name slug images price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ userId: userObjectId })
    ]);

    // Format response
    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      product: review.productId ? {
        _id: review.productId._id,
        name: review.productId.name,
        slug: review.productId.slug,
        image: review.productId.images?.find(img => img.isPrimary)?.url || review.productId.images?.[0]?.url,
        price: review.productId.price
      } : null,
      rating: review.rating,
      title: review.title || '',
      comment: review.comment,
      images: review.images || [],
      verifiedPurchase: review.verifiedPurchase || false,
      helpfulCount: review.helpfulCount || 0,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        reviews: formattedReviews,
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};