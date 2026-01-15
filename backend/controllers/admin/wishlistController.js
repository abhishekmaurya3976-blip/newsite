// controllers/admin/wishlistController.js
const Wishlist = require('../../models/Wishlist');
const User = require('../../models/User');
const Product = require('../../models/Product');
const mongoose = require('mongoose');

// @desc    Get all wishlists
// @route   GET /api/admin/wishlists
// @access  Protected
exports.getWishlists = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      productId,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      query.productId = productId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Search functionality
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      
      const products = await Product.find({
        $or: [
          { name: searchRegex },
          { slug: searchRegex }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      const productIds = products.map(product => product._id);
      
      const orConditions = [];
      if (userIds.length > 0) {
        orConditions.push({ userId: { $in: userIds } });
      }
      if (productIds.length > 0) {
        orConditions.push({ productId: { $in: productIds } });
      }
      
      if (orConditions.length > 0) {
        query.$or = orConditions;
      } else {
        // If no users or products found, return empty result
        return res.status(200).json({
          success: true,
          data: {
            wishlists: [],
            total: 0,
            totalPages: 0,
            page: parseInt(page),
            limit: parseInt(limit)
          }
        });
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await Wishlist.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get wishlists with populated data
    const wishlists = await Wishlist.find(query)
      .populate({
        path: 'user',
        select: '_id name email phone address role'
      })
      .populate({
        path: 'product',
        select: '_id name slug description price compareAtPrice images category stock isActive isFeatured isBestSeller tags',
        populate: {
          path: 'category',
          select: '_id name slug'
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Format response to match frontend expectations
    const formattedWishlists = wishlists.map(item => ({
      _id: item._id,
      userId: item.userId,
      productId: item.productId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      user: item.user ? {
        _id: item.user._id,
        name: item.user.name || 'Unknown User',
        email: item.user.email || 'No email',
        role: item.user.role || 'user',
        phone: item.user.phone || '',
        address: item.user.address || ''
      } : {
        _id: item.userId,
        name: 'Unknown User',
        email: 'No email',
        role: 'user',
        phone: '',
        address: ''
      },
      product: item.product ? {
        _id: item.product._id,
        name: item.product.name || 'Unknown Product',
        slug: item.product.slug || '',
        description: item.product.description || '',
        price: item.product.price || 0,
        compareAtPrice: item.product.compareAtPrice || undefined,
        images: Array.isArray(item.product.images) ? item.product.images.map(img => {
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
        category: item.product.category ? {
          _id: item.product.category._id,
          name: item.product.category.name || '',
          slug: item.product.category.slug || ''
        } : undefined,
        stock: item.product.stock || 0,
        isActive: item.product.isActive !== false,
        isFeatured: item.product.isFeatured || false,
        isBestSeller: item.product.isBestSeller || false,
        tags: item.product.tags || []
      } : {
        _id: item.productId,
        name: 'Deleted Product',
        slug: '',
        description: '',
        price: 0,
        images: [],
        stock: 0,
        isActive: false,
        isFeatured: false,
        isBestSeller: false,
        tags: []
      }
    }));

    res.status(200).json({
      success: true,
      data: {
        wishlists: formattedWishlists,
        total,
        totalPages,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get wishlists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

// @desc    Get wishlist statistics
// @route   GET /api/admin/wishlists/stats
// @access  Protected
exports.getWishlistStats = async (req, res) => {
  try {
    // Total wishlists
    const totalWishlists = await Wishlist.countDocuments();

    // Total unique users
    const totalUsers = await Wishlist.distinct('userId').then(users => users.length);

    // Most wishlisted products (simpler approach)
    const mostWishlistedAgg = await Wishlist.aggregate([
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get product details for most wishlisted
    const mostWishlistedProducts = await Promise.all(
      mostWishlistedAgg.map(async (item) => {
        const product = await Product.findById(item._id).select('name');
        return {
          productId: item._id,
          productName: product ? product.name : `Product ${item._id}`,
          count: item.count,
          percentage: totalWishlists > 0 ? Math.round((item.count / totalWishlists) * 100 * 100) / 100 : 0
        };
      })
    );

    // Top users by wishlist count (simpler approach)
    const topUsersAgg = await Wishlist.aggregate([
      {
        $group: {
          _id: '$userId',
          wishlistCount: { $sum: 1 }
        }
      },
      { $sort: { wishlistCount: -1 } },
      { $limit: 10 }
    ]);

    // Get user details for top users
    const topUsers = await Promise.all(
      topUsersAgg.map(async (item) => {
        const user = await User.findById(item._id).select('name email');
        return {
          userId: item._id,
          userName: user ? user.name : `User ${item._id}`,
          userEmail: user ? user.email : 'No email',
          wishlistCount: item.wishlistCount
        };
      })
    );

    // Daily wishlist count for last 30 days (simpler approach)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyAgg = await Wishlist.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Convert to object for easy lookup
    const dailyMap = {};
    dailyAgg.forEach(item => {
      dailyMap[item._id] = item.count;
    });

    // Fill in missing dates with 0 count
    const dailyWishlistCount = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyWishlistCount.push({
        date: dateStr,
        count: dailyMap[dateStr] || 0
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalWishlists,
        totalUsers,
        mostWishlistedProducts,
        topUsers,
        dailyWishlistCount
      }
    });

  } catch (error) {
    console.error('Get wishlist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

// @desc    Delete wishlist item
// @route   DELETE /api/admin/wishlists/:id
// @access  Protected
exports.deleteWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wishlist ID'
      });
    }

    const wishlist = await Wishlist.findByIdAndDelete(id);

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Wishlist item deleted successfully'
    });

  } catch (error) {
    console.error('Delete wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

// @desc    Bulk delete wishlists
// @route   DELETE /api/admin/wishlists/bulk-delete
// @access  Protected
exports.bulkDeleteWishlists = async (req, res) => {
  try {
    const { wishlistIds } = req.body;

    if (!Array.isArray(wishlistIds) || wishlistIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide wishlist IDs to delete'
      });
    }

    // Validate all IDs
    const validIds = wishlistIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid wishlist IDs provided'
      });
    }

    const result = await Wishlist.deleteMany({
      _id: { $in: validIds }
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} wishlist items deleted successfully`
    });

  } catch (error) {
    console.error('Bulk delete wishlists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};