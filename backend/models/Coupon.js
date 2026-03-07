const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed', 'free_shipping'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: 1,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  perUserLimit: {
    type: Number,
    default: 1,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  forNewUsersOnly: {
    type: Boolean,
    default: false
  },
  forExistingUsersOnly: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
couponSchema.index({ code: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ endDate: 1 });

// Static method to validate coupon
couponSchema.statics.validateCoupon = async function(code, userId, cartItems = []) {
  const coupon = await this.findOne({ 
    code: code.toUpperCase().trim(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    $expr: { $lt: ['$usedCount', '$usageLimit'] }
  });

  if (!coupon) {
    throw new Error('Invalid or expired coupon');
  }

  // Check per user limit
  const userUsageCount = await mongoose.model('Order').countDocuments({
    userId,
    'coupon.code': code.toUpperCase().trim()
  });

  if (userUsageCount >= coupon.perUserLimit) {
    throw new Error('Coupon usage limit reached for this user');
  }

  // Check user type restrictions
  if (coupon.forNewUsersOnly || coupon.forExistingUsersOnly) {
    const userOrderCount = await mongoose.model('Order').countDocuments({ userId });
    
    if (coupon.forNewUsersOnly && userOrderCount > 0) {
      throw new Error('Coupon only for new users');
    }
    
    if (coupon.forExistingUsersOnly && userOrderCount === 0) {
      throw new Error('Coupon only for existing users');
    }
  }

  return coupon;
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(subtotal, cartItems = []) {
  let discount = 0;
  let eligibleAmount = subtotal;

  // Apply category/product filters
  if (this.applicableCategories.length > 0 || this.excludedCategories.length > 0 || 
      this.applicableProducts.length > 0 || this.excludedProducts.length > 0) {
    
    // Filter eligible cart items
    const eligibleItems = cartItems.filter(item => {
      // Check excluded products
      if (this.excludedProducts.includes(item.productId._id)) {
        return false;
      }
      
      // Check excluded categories
      if (item.productId.category && this.excludedCategories.includes(item.productId.category)) {
        return false;
      }
      
      // Check applicable products
      if (this.applicableProducts.length > 0 && !this.applicableProducts.includes(item.productId._id)) {
        return false;
      }
      
      // Check applicable categories
      if (this.applicableCategories.length > 0 && item.productId.category && 
          !this.applicableCategories.includes(item.productId.category)) {
        return false;
      }
      
      return true;
    });

    eligibleAmount = eligibleItems.reduce((sum, item) => 
      sum + (item.productId.price * item.quantity), 0);
  }

  // Check minimum order amount
  if (eligibleAmount < this.minOrderAmount) {
    throw new Error(`Minimum order amount of ₹${this.minOrderAmount} required`);
  }

  // Calculate discount based on type
  switch (this.discountType) {
    case 'percentage':
      discount = (eligibleAmount * this.discountValue) / 100;
      if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
        discount = this.maxDiscountAmount;
      }
      break;
    
    case 'fixed':
      discount = this.discountValue;
      break;
    
    case 'free_shipping':
      discount = 50; // Assuming shipping fee is ₹50
      break;
    
    default:
      discount = 0;
  }

  // Ensure discount doesn't exceed eligible amount
  discount = Math.min(discount, eligibleAmount);
  
  return {
    discount,
    eligibleAmount,
    discountType: this.discountType,
    discountValue: this.discountValue,
    couponCode: this.code,
    couponName: this.name
  };
};

module.exports = mongoose.model('Coupon', couponSchema);