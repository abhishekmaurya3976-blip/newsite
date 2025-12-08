const mongoose = require('mongoose');

const SliderSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Public ID is required'],
    },
    altText: {
      type: String,
      required: [true, 'Alt text is required'],
      trim: true,
      maxlength: [200, 'Alt text cannot be more than 200 characters'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot be more than 200 characters'],
    },
    link: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for better query performance
SliderSchema.index({ isActive: 1, order: 1 });
SliderSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Slider || mongoose.model('Slider', SliderSchema);