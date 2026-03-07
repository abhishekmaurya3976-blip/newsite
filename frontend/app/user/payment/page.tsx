'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  Loader2, 
  ArrowLeft,
  AlertCircle,
  Shield,
  Package,
  Truck
} from 'lucide-react';
import { checkoutApi } from '../../lib/api/checkout';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentData {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

// Create a separate component that uses useSearchParams
function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const amount = searchParams.get('amount');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      router.push('/user/checkout');
      return;
    }

    loadPaymentData();
  }, [orderId, router]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const response = await checkoutApi.getOrder(orderId!);
      
      if (response.success && response.data?.order) {
        const order = response.data.order;
        setOrderDetails(order);
        
        if (order.paymentStatus === 'paid' || order.orderStatus === 'confirmed') {
          setPaymentStatus('success');
        } else if (order.paymentStatus === 'failed') {
          setPaymentStatus('failed');
        } else if (order.paymentMethod === 'razorpay') {
          // Get payment data from localStorage (stored during checkout)
          const storedPayment = localStorage.getItem(`payment_${orderId}`);
          if (storedPayment) {
            setPaymentData(JSON.parse(storedPayment));
          } else {
            setError('Payment session expired. Please contact support.');
          }
        }
      } else {
        setError(response.error || 'Failed to load order details');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const initiateRazorpayPayment = () => {
    if (!paymentData) {
      setError('Payment data not available');
      return;
    }

    setProcessing(true);

    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: 'Art Plazaa',
      description: `Order ${orderNumber}`,
      order_id: paymentData.razorpayOrderId,
      handler: async (response: any) => {
        try {
          const verificationResponse = await checkoutApi.verifyPayment(orderId!, {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verificationResponse.success) {
            setPaymentStatus('success');
            // Clear stored payment data
            localStorage.removeItem(`payment_${orderId}`);
          } else {
            setPaymentStatus('failed');
            setError(verificationResponse.error || 'Payment verification failed');
          }
        } catch (error: any) {
          setPaymentStatus('failed');
          setError(error.message || 'Payment verification failed');
        } finally {
          setProcessing(false);
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      notes: {
        orderId: orderId,
        orderNumber: orderNumber
      },
      theme: {
        color: '#7C3AED'
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleRetryPayment = () => {
    // Clear any stored payment data and reload
    if (orderId) {
      localStorage.removeItem(`payment_${orderId}`);
    }
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 pt-16 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pt-16 md:pt-10">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-12 max-w-lg mx-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
              Payment Successful!
            </h1>
            
            <p className="text-gray-600 text-center mb-6 md:mb-8">
              Your payment has been processed successfully. Your order is now confirmed.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Order Number:</span>
                  <span className="font-bold text-gray-900">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Amount Paid:</span>
                  <span className="font-bold text-gray-900">₹{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Status:</span>
                  <span className="font-bold text-green-600">Confirmed</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href={`/user/orders/${orderId}`}
                className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium text-center shadow-lg hover:shadow-xl"
              >
                View Order Details
              </Link>
              
              <Link
                href="/user/orders"
                className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
              >
                Go to Orders
              </Link>
              
              <Link
                href="/products"
                className="block w-full py-3 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pt-16 md:pt-24">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-12 max-w-lg mx-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
              Payment Failed
            </h1>
            
            <p className="text-gray-600 text-center mb-6 md:mb-8">
              {error || 'We were unable to process your payment. Please try again.'}
            </p>

            <div className="space-y-3">
              <button
                onClick={handleRetryPayment}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Retry Payment
              </button>
              
              <Link
                href="/user/orders"
                className="block w-full py-3 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium text-center"
              >
                View Orders
              </Link>

              <Link
                href="/products"
                className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>Need help?</strong> If the amount was deducted from your account, 
                    please contact support with your order number: <strong>{orderNumber}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 pt-16 md:pt-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Complete Your Payment
                </h1>
                <p className="text-purple-100">Order #{orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm">Total Amount</p>
                <p className="text-2xl md:text-3xl font-bold text-white">₹{amount}</p>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Razorpay Secure Payment</h3>
                  <p className="text-gray-600">Pay via Credit/Debit Card, UPI, Net Banking</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={initiateRazorpayPayment}
                  disabled={processing || !paymentData}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay ₹{amount}
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  You will be redirected to Razorpay's secure payment page
                </p>
              </div>
            </div>

            {/* Order Details Summary */}
            {orderDetails && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  Order Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{orderDetails.items?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">Online Payment (Razorpay)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      3-5 business days
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Security Features */}
            <div className="border-t border-gray-200 pt-6 md:pt-8">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                100% Secure Payment
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">SSL Encrypted</span>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">PCI DSS Compliant</span>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-700">No Card Storage</span>
                </div>
              </div>
            </div>

            {/* Payment Methods Info */}
            <div className="mt-6 md:mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Accepted Payment Methods:</strong> Credit/Debit Cards (Visa, MasterCard, Rupay), 
                UPI (Google Pay, PhonePe, Paytm), Net Banking, Wallets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the content in Suspense
export default function PaymentPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 pt-16 md:pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading payment page...</p>
            </div>
          </div>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}

// Add this to disable static generation for this page
export const dynamic = 'force-dynamic';