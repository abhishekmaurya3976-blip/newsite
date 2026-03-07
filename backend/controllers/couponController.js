const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const mongoose = require('mongoose');
// In couponController.js, update the validateCoupon function:
// Add this to the top of validateCoupon function in couponController.js:
exports.validateCoupon = async (req, res) => {
  try {
    console.log('=== Coupon Validation Request ===');
    console.log('Body:', req.body);
    console.log('User:', req.user);
    
    const { code, subtotal, cartItems = [] } = req.body;
    const userId = req.user?._id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    console.log('Processing coupon validation for user:', userId);
    console.log('Cart items received:', cartItems);

    // Validate coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      $expr: { $lt: ['$usedCount', '$usageLimit'] }
    });

    console.log('Found coupon:', coupon);

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired coupon'
      });
    }

    // Check per user limit
    const userUsageCount = await Order.countDocuments({
      userId,
      'coupon.code': code.toUpperCase().trim()
    });

    console.log('User usage count:', userUsageCount, 'Per user limit:', coupon.perUserLimit);

    if (userUsageCount >= coupon.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached for this user'
      });
    }

    // Check user type restrictions
    if (coupon.forNewUsersOnly || coupon.forExistingUsersOnly) {
      const userOrderCount = await Order.countDocuments({ userId });
      console.log('User order count:', userOrderCount);
      
      if (coupon.forNewUsersOnly && userOrderCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Coupon only for new users'
        });
      }
      
      if (coupon.forExistingUsersOnly && userOrderCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Coupon only for existing users'
        });
      }
    }

    // Calculate discount
    let discount = 0;
    let eligibleAmount = subtotal;

    // Apply category/product filters
    const excludedProductIds = coupon.excludedProducts.map(id => id.toString());
    const applicableProductIds = coupon.applicableProducts.map(id => id.toString());
    const excludedCategoryIds = coupon.excludedCategories.map(id => id.toString());
    const applicableCategoryIds = coupon.applicableCategories.map(id => id.toString());

    console.log('Coupon filters:', {
      excludedProductIds,
      applicableProductIds,
      excludedCategoryIds,
      applicableCategoryIds
    });

    if (applicableCategoryIds.length > 0 || excludedCategoryIds.length > 0 || 
        applicableProductIds.length > 0 || excludedProductIds.length > 0) {
      
      // Filter eligible cart items
      const eligibleItems = cartItems.filter(item => {
        if (!item || !item.productId) {
          console.log('Skipping invalid cart item:', item);
          return false;
        }
        
        const itemProductId = item.productId.toString();
        const itemCategory = item.category ? item.category.toString() : null;
        
        console.log('Checking item:', {
          itemProductId,
          itemCategory,
          price: item.price,
          quantity: item.quantity
        });

        // Check excluded products
        if (excludedProductIds.includes(itemProductId)) {
          console.log('Item excluded by product ID');
          return false;
        }
        
        // Check excluded categories
        if (itemCategory && excludedCategoryIds.includes(itemCategory)) {
          console.log('Item excluded by category');
          return false;
        }
        
        // Check applicable products
        if (applicableProductIds.length > 0 && !applicableProductIds.includes(itemProductId)) {
          console.log('Item not in applicable products');
          return false;
        }
        
        // Check applicable categories
        if (applicableCategoryIds.length > 0 && itemCategory && 
            !applicableCategoryIds.includes(itemCategory)) {
          console.log('Item not in applicable categories');
          return false;
        }
        
        console.log('Item is eligible');
        return true;
      });

      console.log('Eligible items:', eligibleItems);
      eligibleAmount = eligibleItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0);
    }

    console.log('Eligible amount:', eligibleAmount, 'Min order amount:', coupon.minOrderAmount);

    // Check minimum order amount
    if (eligibleAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
      });
    }

    // Calculate discount based on type
    switch (coupon.discountType) {
      case 'percentage':
        discount = (eligibleAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
        break;
      
      case 'fixed':
        discount = coupon.discountValue;
        break;
      
      case 'free_shipping':
        discount = 50; // Assuming shipping fee is ₹50
        break;
      
      default:
        discount = 0;
    }

    // Ensure discount doesn't exceed eligible amount
    discount = Math.min(discount, eligibleAmount);

    console.log('Calculated discount:', discount);

    res.status(200).json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscountAmount: coupon.maxDiscountAmount,
          minOrderAmount: coupon.minOrderAmount
        },
        discount: discount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        eligibleAmount: eligibleAmount
      }
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Invalid coupon'
    });
  }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal, cartItems = [] } = req.body;
    const userId = req.user._id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    console.log('Coupon validation request:', { code, subtotal, cartItems, userId });

    // Validate coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      $expr: { $lt: ['$usedCount', '$usageLimit'] }
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired coupon'
      });
    }

    // Check per user limit
    const userUsageCount = await Order.countDocuments({
      userId,
      'coupon.code': code.toUpperCase().trim()
    });

    if (userUsageCount >= coupon.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached for this user'
      });
    }

    // Check user type restrictions
    if (coupon.forNewUsersOnly || coupon.forExistingUsersOnly) {
      const userOrderCount = await Order.countDocuments({ userId });
      
      if (coupon.forNewUsersOnly && userOrderCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Coupon only for new users'
        });
      }
      
      if (coupon.forExistingUsersOnly && userOrderCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Coupon only for existing users'
        });
      }
    }

    // Calculate discount
    let discount = 0;
    let eligibleAmount = subtotal;

    // Apply category/product filters
    // IMPORTANT: Convert ObjectIds to strings for comparison
    const excludedProductIds = coupon.excludedProducts.map(id => id.toString());
    const applicableProductIds = coupon.applicableProducts.map(id => id.toString());
    const excludedCategoryIds = coupon.excludedCategories.map(id => id.toString());
    const applicableCategoryIds = coupon.applicableCategories.map(id => id.toString());

    if (applicableCategoryIds.length > 0 || excludedCategoryIds.length > 0 || 
        applicableProductIds.length > 0 || excludedProductIds.length > 0) {
      
      // Filter eligible cart items
      const eligibleItems = cartItems.filter(item => {
        const itemProductId = item.productId?.toString();
        const itemCategory = item.category?.toString();
        
        // Check excluded products
        if (excludedProductIds.includes(itemProductId)) {
          return false;
        }
        
        // Check excluded categories
        if (itemCategory && excludedCategoryIds.includes(itemCategory)) {
          return false;
        }
        
        // Check applicable products
        if (applicableProductIds.length > 0 && !applicableProductIds.includes(itemProductId)) {
          return false;
        }
        
        // Check applicable categories
        if (applicableCategoryIds.length > 0 && itemCategory && 
            !applicableCategoryIds.includes(itemCategory)) {
          return false;
        }
        
        return true;
      });

      console.log('Eligible items:', eligibleItems);
      eligibleAmount = eligibleItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0);
    }

    console.log('Eligible amount:', eligibleAmount, 'Min order amount:', coupon.minOrderAmount);

    // Check minimum order amount
    if (eligibleAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
      });
    }

    // Calculate discount based on type
    switch (coupon.discountType) {
      case 'percentage':
        discount = (eligibleAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
        break;
      
      case 'fixed':
        discount = coupon.discountValue;
        break;
      
      case 'free_shipping':
        discount = 50; // Assuming shipping fee is ₹50
        break;
      
      default:
        discount = 0;
    }

    // Ensure discount doesn't exceed eligible amount
    discount = Math.min(discount, eligibleAmount);

    console.log('Calculated discount:', discount);

    res.status(200).json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscountAmount: coupon.maxDiscountAmount,
          minOrderAmount: coupon.minOrderAmount
        },
        discount: discount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        eligibleAmount: eligibleAmount
      }
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Invalid coupon'
    });
  }
};

// @desc    Get all coupons (admin)
// @route   GET /api/admin/coupons
// @access  Private/Admin
exports.getAllCoupons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = 'all'
    } = req.query;

    // Build query
    const query = {};

    // Search by code or name
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status === 'active') {
      query.isActive = true;
      query.endDate = { $gte: new Date() };
      query.startDate = { $lte: new Date() };
    } else if (status === 'expired') {
      query.endDate = { $lt: new Date() };
    } else if (status === 'upcoming') {
      query.startDate = { $gt: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get coupons
    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Coupon.countDocuments(query);

    // Format response
    const formattedCoupons = coupons.map(coupon => ({
      _id: coupon._id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      perUserLimit: coupon.perUserLimit,
      isActive: coupon.isActive,
      applicableCategories: coupon.applicableCategories,
      excludedCategories: coupon.excludedCategories,
      applicableProducts: coupon.applicableProducts,
      excludedProducts: coupon.excludedProducts,
      forNewUsersOnly: coupon.forNewUsersOnly,
      forExistingUsersOnly: coupon.forExistingUsersOnly,
      status: new Date() > coupon.endDate ? 'expired' : 
              new Date() < coupon.startDate ? 'upcoming' :
              coupon.isActive ? 'active' : 'inactive',
      redemptionRate: Math.round((coupon.usedCount / coupon.usageLimit) * 100),
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        coupons: formattedCoupons,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get all coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      perUserLimit,
      isActive,
      applicableCategories,
      excludedCategories,
      applicableProducts,
      excludedProducts,
      forNewUsersOnly,
      forExistingUsersOnly
    } = req.body;

    // Validate required fields
    if (!code || !name || !discountType || !discountValue || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Validate discount values
    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount must be between 0 and 100'
      });
    }

    if (discountType === 'fixed' && discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Fixed discount must be greater than 0'
      });
    }

    // Create coupon
    const coupon = new Coupon({
      code: code.toUpperCase().trim(),
      name,
      description: description || '',
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit: usageLimit || 1,
      perUserLimit: perUserLimit || 1,
      isActive: isActive !== undefined ? isActive : true,
      applicableCategories: applicableCategories || [],
      excludedCategories: excludedCategories || [],
      applicableProducts: applicableProducts || [],
      excludedProducts: excludedProducts || [],
      forNewUsersOnly: forNewUsersOnly || false,
      forExistingUsersOnly: forExistingUsersOnly || false
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon }
    });

  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating coupon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find coupon
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // If updating code, check for duplicates
    if (updateData.code && updateData.code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: updateData.code.toUpperCase().trim(),
        _id: { $ne: id }
      });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
      updateData.code = updateData.code.toUpperCase().trim();
    }

    // Update coupon
    Object.keys(updateData).forEach(key => {
      if (key === 'startDate' || key === 'endDate') {
        coupon[key] = new Date(updateData[key]);
      } else if (updateData[key] !== undefined) {
        coupon[key] = updateData[key];
      }
    });

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: { coupon }
    });

  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating coupon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the coupon first
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // 2. Check if this specific coupon has been used in any orders
    const usedInOrders = await Order.countDocuments({
      'coupon.code': coupon.code   // only orders using this coupon's code
    });

    if (usedInOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete coupon that has been used in orders'
      });
    }

    // 3. Delete the coupon
    await Coupon.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting coupon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get coupon stats
// @route   GET /api/admin/coupons/stats
// @access  Private/Admin
exports.getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ 
      isActive: true,
      endDate: { $gte: new Date() }
    });
    const expiredCoupons = await Coupon.countDocuments({ 
      endDate: { $lt: new Date() }
    });
    
    const totalDiscountGiven = await Order.aggregate([
      { $match: { 'coupon.discountAmount': { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$coupon.discountAmount' } } }
    ]);

    const mostUsedCoupon = await Order.aggregate([
      { $match: { 'coupon.code': { $exists: true, $ne: '' } } },
      { $group: { _id: '$coupon.code', count: { $sum: 1 }, totalDiscount: { $sum: '$coupon.discountAmount' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const couponUsageStats = await Coupon.aggregate([
      {
        $project: {
          code: 1,
          name: 1,
          usedCount: 1,
          usageLimit: 1,
          redemptionRate: {
            $multiply: [
              { $divide: ['$usedCount', '$usageLimit'] },
              100
            ]
          }
        }
      },
      { $sort: { usedCount: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        totalDiscountGiven: totalDiscountGiven[0]?.total || 0,
        mostUsedCoupons: mostUsedCoupon,
        topCoupons: couponUsageStats
      }
    });

  } catch (error) {
    console.error('Get coupon stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupon stats'
    });
  }
};

// @desc    Get coupon by ID
// @route   GET /api/admin/coupons/:id
// @access  Private/Admin
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id).lean();
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Calculate usage stats
    const ordersWithCoupon = await Order.countDocuments({
      'coupon.code': coupon.code
    });

    const formattedCoupon = {
      ...coupon,
      status: new Date() > coupon.endDate ? 'expired' : 
              new Date() < coupon.startDate ? 'upcoming' :
              coupon.isActive ? 'active' : 'inactive',
      ordersCount: ordersWithCoupon,
      remainingUses: coupon.usageLimit - coupon.usedCount
    };

    res.status(200).json({
      success: true,
      data: {
        coupon: formattedCoupon
      }
    });

  } catch (error) {
    console.error('Get coupon by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupon details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};