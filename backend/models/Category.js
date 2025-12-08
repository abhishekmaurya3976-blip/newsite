const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Category name is required'], 
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: { 
    type: String, 
    index: true, 
    unique: true,
    lowercase: true 
  },
  description: { 
    type: String, 
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null,
    validate: {
      validator: function(v) {
        // Allow null, undefined, or valid ObjectId
        return v === null || v === undefined || mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid parent category ID'
    }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  image: {
    url: String,
    publicId: String,
    altText: { 
      type: String, 
      default: '' 
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for children
CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Generate slug before saving
CategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { 
      lower: true, 
      strict: true,
      trim: true
    });
  }
  
  // Convert empty string parentId to null
  if (this.parentId === '') {
    this.parentId = null;
  }
  
  next();
});

// Indexes
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });

module.exports = mongoose.model('Category', CategorySchema);