// models/Product.js
const mongoose = require('mongoose');
const slugify = require('slugify');

const ImageSchema = new mongoose.Schema({
  publicId: String,
  url: { 
    type: String, 
    required: true 
  },
  altText: { 
    type: String, 
    default: '' 
  },
  isPrimary: { 
    type: Boolean, 
    default: false 
  },
  order: { 
    type: Number, 
    default: 0 
  }
});

const DimensionsSchema = new mongoose.Schema({
  length: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 }
});

const RatingBreakdownSchema = new mongoose.Schema({
  1: { type: Number, default: 0 },
  2: { type: Number, default: 0 },
  3: { type: Number, default: 0 },
  4: { type: Number, default: 0 },
  5: { type: Number, default: 0 }
}, { _id: false });

const ProductRatingSchema = new mongoose.Schema({
  average: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  count: { 
    type: Number, 
    default: 0,
    min: 0
  },
  breakdown: {
    type: RatingBreakdownSchema,
    default: () => ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'], 
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: { 
    type: String, 
    index: true, 
    unique: true,
    lowercase: true 
  },
  sku: { 
    type: String, 
    default: '',
    index: true
  },
  barcode: { 
    type: String, 
    default: '',
    index: true
  },
  description: { 
    type: String, 
    default: '',
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: { 
    type: String, 
    default: '',
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  compareAtPrice: { 
    type: Number, 
    default: 0,
    min: [0, 'Compare price cannot be negative']
  },
  costPrice: { 
    type: Number, 
    default: 0,
    min: [0, 'Cost price cannot be negative']
  },
  stock: { 
    type: Number, 
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  weight: { 
    type: Number, 
    default: 0,
    min: [0, 'Weight cannot be negative']
  },
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null 
  },
  category: { 
    type: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      slug: String
    },
    default: null
  },
  tags: { 
    type: [String], 
    default: [] 
  },
  images: { 
    type: [ImageSchema], 
    default: [] 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  isBestSeller: { 
    type: Boolean, 
    default: false 
  },
  rating: {
    type: ProductRatingSchema,
    default: () => ({ 
      average: 0, 
      count: 0, 
      breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
    })
  },
  metaTitle: { 
    type: String,
    maxlength: [70, 'Meta title cannot exceed 70 characters']
  },
  metaDescription: { 
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  dimensions: { 
    type: DimensionsSchema, 
    default: () => ({})
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug before saving
ProductSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { 
      lower: true, 
      strict: true,
      trim: true
    });
  }
  next();
});

// Indexes
ProductSchema.index({ slug: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isBestSeller: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ 'category.id': 1 });
ProductSchema.index({ 'rating.average': -1 });
ProductSchema.index({ 'rating.count': -1 });

// Virtual for reviews
ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId',
  justOne: false
});

module.exports = mongoose.model('Product', ProductSchema);