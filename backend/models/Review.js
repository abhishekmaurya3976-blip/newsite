// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: props => `${props.value} is not a valid image URL!`
    }
  }],
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isApproved: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one review per user per product
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Index for product ratings and reviews
ReviewSchema.index({ productId: 1, rating: -1 });
ReviewSchema.index({ productId: 1, helpfulCount: -1 });
ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });
ReviewSchema.index({ isApproved: 1 });

// Virtual populate for user details
ReviewSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email avatar' }
});

// Virtual populate for product details
ReviewSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name slug images price' }
});

// Pre-save middleware to update timestamps
ReviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.images && this.images.length > 4) {
    throw new Error('Cannot upload more than 4 images per review');
  }
  
  next();
});

// Static method to get average rating for a product
ReviewSchema.statics.getAverageRating = async function(productId) {
  try {
    // Convert string to ObjectId properly
    const objectId = mongoose.Types.ObjectId.createFromHexString(productId);
    
    const result = await this.aggregate([
      {
        $match: { 
          productId: objectId,
          isApproved: true 
        }
      },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 },
          breakdown: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (result.length > 0) {
      const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      result[0].breakdown.forEach(rating => {
        const key = Math.floor(rating);
        if (breakdown[key] !== undefined) {
          breakdown[key]++;
        }
      });

      return {
        average: parseFloat(result[0].averageRating.toFixed(1)),
        count: result[0].count,
        breakdown
      };
    }

    return {
      average: 0,
      count: 0,
      breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  } catch (error) {
    console.error('Error in getAverageRating:', error);
    return {
      average: 0,
      count: 0,
      breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
};

// Static method to update product rating
ReviewSchema.statics.updateProductRating = async function(productId) {
  try {
    const ratingData = await this.getAverageRating(productId);
    
    const Product = mongoose.model('Product');
    
    // Convert string to ObjectId for update
    const objectId = mongoose.Types.ObjectId.createFromHexString(productId);
    
    await Product.findByIdAndUpdate(objectId, {
      $set: {
        'rating.average': ratingData.average,
        'rating.count': ratingData.count,
        'rating.breakdown': ratingData.breakdown
      }
    }, { new: true });
    
    return ratingData;
  } catch (error) {
    console.error('Error updating product rating:', error);
    throw error;
  }
};

module.exports = mongoose.model('Review', ReviewSchema);