const Razorpay = require('razorpay');
const crypto = require('crypto');

class RazorpayService {
  constructor() {
    this.instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SA4QbAArCv61EY',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'T1aSkURVCI6czUeOk3u7HD1U'
    });
  }

  // Create Razorpay order
  async createOrder(amount, currency = 'INR', receipt = '') {
    try {
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        payment_capture: 1 // Auto capture
      };

      const order = await this.instance.orders.create(options);
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      };
    } catch (error) {
      console.error('Razorpay createOrder error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify payment signature
  verifyPayment(orderId, paymentId, signature) {
    try {
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'T1aSkURVCI6czUeOk3u7HD1U')
        .update(body.toString())
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  // Fetch payment details
  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.instance.payments.fetch(paymentId);
      return {
        success: true,
        payment
      };
    } catch (error) {
      console.error('Get payment details error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Refund payment
  async refundPayment(paymentId, amount) {
    try {
      const refund = await this.instance.payments.refund(paymentId, {
        amount: Math.round(amount * 100)
      });
      return {
        success: true,
        refund
      };
    } catch (error) {
      console.error('Refund payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new RazorpayService();