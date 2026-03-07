const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  apartment: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'India'
  }
}, { _id: false });

const couponInfoSchema = new mongoose.Schema({
  code: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping', ''],
    default: ''
  },
  discountValue: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  }
}, { _id: false });

const paymentDetailsSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['razorpay', 'cod', 'upi']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String,
    default: ''
  },
  razorpayPaymentId: {
    type: String,
    default: ''
  },
  razorpaySignature: {
    type: String,
    default: ''
  },
  upiId: {
    type: String,
    default: ''
  },
  cardLastFour: {
    type: String,
    default: ''
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(1000 + Math.random() * 9000);
      return `ORD${year}${month}${day}${random}`;
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  coupon: couponInfoSchema,
  payment: paymentDetailsSchema,
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  orderNotes: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    default: ''
  },
  trackingNumber: {
    type: String,
    default: ''
  },
  shippingProvider: {
    type: String,
    default: ''
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelledReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user
orderSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.razorpayOrderId': 1 });
orderSchema.index({ 'coupon.code': 1 });

// Static method to calculate totals with coupon
orderSchema.statics.calculateTotals = function(items, couponDiscount = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 499 ? 0 : 50;
  const tax = subtotal * 0.18;
  const discount = couponDiscount;
  const total = subtotal + shippingFee + tax - discount;

  return { subtotal, shippingFee, tax, discount, total };
};

// Method to update order status
orderSchema.methods.updateStatus = async function(status, notes = '') {
  this.orderStatus = status;
  this.updatedAt = Date.now();

  if (status === 'confirmed') {
    this.payment.status = 'paid';
  } else if (status === 'delivered') {
    this.deliveredAt = Date.now();
  } else if (status === 'cancelled') {
    this.cancelledAt = Date.now();
    this.payment.status = 'refunded';
    if (notes) {
      this.cancelledReason = notes;
    }
  }

  if (notes && status !== 'cancelled') {
    this.adminNotes = notes;
  }

  return await this.save();
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;