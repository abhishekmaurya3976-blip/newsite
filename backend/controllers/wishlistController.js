// controllers/wishlistController.js
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getUserWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlistItems = await Wishlist.find({ userId })
      .populate({
        path: 'product',
        select: '_id name slug description shortDescription price compareAtPrice costPrice sku barcode stock weight dimensions category tags isActive isFeatured isBestSeller metaTitle metaDescription images createdAt updatedAt',
        populate: {
          path: 'category',
          select: '_id name slug'
        }
      })
      .sort({ createdAt: -1 });

    // Format response
    const formattedWishlist = wishlistItems
      .filter(item => item.product) // Remove items with deleted products
      .map(item => ({
        _id: item._id,
        userId: item.userId,
        productId: item.productId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: {
          _id: item.product._id,
          name: item.product.name || 'Unknown Product',
          slug: item.product.slug || '',
          description: item.product.description || '',
          shortDescription: item.product.shortDescription || '',
          price: item.product.price || 0,
          compareAtPrice: item.product.compareAtPrice || undefined,
          costPrice: item.product.costPrice || undefined,
          sku: item.product.sku || '',
          barcode: item.product.barcode || '',
          stock: item.product.stock || 0,
          weight: item.product.weight || undefined,
          dimensions: item.product.dimensions || undefined,
          category: item.product.category ? {
            _id: item.product.category._id,
            name: item.product.category.name || '',
            slug: item.product.category.slug || ''
          } : undefined,
          tags: item.product.tags || [],
          isActive: item.product.isActive !== false,
          isFeatured: item.product.isFeatured || false,
          isBestSeller: item.product.isBestSeller || false,
          metaTitle: item.product.metaTitle || '',
          metaDescription: item.product.metaDescription || '',
          images: Array.isArray(item.product.images) ? item.product.images.map(img => {
            // Handle both string URLs and image objects
            if (typeof img === 'string') {
              return {
                url: img,
                altText: item.product.name || ''
              };
            }
            return {
              url: img.url || '',
              altText: img.altText || item.product.name || '',
              publicId: img.publicId,
              isPrimary: img.isPrimary,
              order: img.order
            };
          }) : [],
          createdAt: item.product.createdAt || item.createdAt,
          updatedAt: item.product.updatedAt || item.updatedAt
        }
      }));

    res.status(200).json({
      success: true,
      data: {
        wishlist: formattedWishlist,
        count: formattedWishlist.length
      }
    });
  } catch (error) {
    console.error('Get user wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    // Validate input
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID is required'
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

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({ userId, productId });
    if (existingWishlist) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      userId,
      productId
    });

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      data: {
        _id: wishlistItem._id,
        userId: wishlistItem.userId,
        productId: wishlistItem.productId,
        createdAt: wishlistItem.createdAt,
        updatedAt: wishlistItem.updatedAt
      }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error adding product to wishlist',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID is required'
      });
    }

    const wishlistItem = await Wishlist.findOneAndDelete({
      userId,
      productId
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing product from wishlist',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

// @desc    Clear user's wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Wishlist.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} items from wishlist`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing wishlist',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
exports.checkWishlistStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID is required'
      });
    }

    const wishlistItem = await Wishlist.findOne({
      userId,
      productId
    });

    res.status(200).json({
      success: true,
      data: {
        isInWishlist: !!wishlistItem,
        wishlistItem: wishlistItem || null
      }
    });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking wishlist status',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};