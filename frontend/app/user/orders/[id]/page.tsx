// app/user/orders/[id]/page.tsx - UPDATED WITH REVIEW BUTTONS
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  CheckCircle,
  Clock,
  Truck,
  Home,
  XCircle,
  MapPin,
  CreditCard,
  TruckIcon,
  Calendar,
  Printer,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  User,
  Mail,
  Phone,
  Star,
  Edit
} from 'lucide-react';
import { ordersApi } from '../../../lib/api/orders';
import { useRating } from '../../../contexts/RatingsContext';
import { useAuth } from '../../../components/contexts/AuthContext';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'credit_card' | 'upi' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  orderNotes?: string;
  adminNotes?: string;
  trackingNumber?: string;
  shippingProvider?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [canReviewItems, setCanReviewItems] = useState<{ [key: string]: boolean }>({});
  const [checkingReviewStatus, setCheckingReviewStatus] = useState(false);

  const orderId = params.id as string;
  const { user } = useAuth();
  const { canReviewProduct } = useRating();

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (order && user && order.orderStatus === 'delivered') {
      checkReviewEligibility();
    }
  }, [order, user]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ordersApi.getUserOrder(orderId);
      
      if (response.success && response.data?.order) {
        setOrder(response.data.order);
      } else {
        throw new Error(response.error || 'Order not found');
      }
    } catch (error: any) {
      console.error('Error loading order:', error);
      setError(error.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    if (!order || !user) return;
    
    try {
      setCheckingReviewStatus(true);
      const reviewStatus: { [key: string]: boolean } = {};
      
      // Check each item in the order
      for (const item of order.items) {
        try {
          const canReview = await canReviewProduct(item.productId);
          reviewStatus[item.productId] = canReview;
        } catch (error) {
          console.error(`Error checking review eligibility for product ${item.productId}:`, error);
          reviewStatus[item.productId] = false;
        }
      }
      
      setCanReviewItems(reviewStatus);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    } finally {
      setCheckingReviewStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      setCancelling(true);
      const response = await ordersApi.cancelOrder(orderId, 'Changed my mind');
      
      if (response.success) {
        await loadOrder();
      } else {
        alert(response.error || 'Failed to cancel order');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrintInvoice = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 500);
  };

  const handleWriteReview = (productId: string, productName: string) => {
    router.push(`/products/${productId}/reviews`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Credit/Debit Card';
      case 'upi': return 'UPI Payment';
      case 'cod': return 'Cash on Delivery';
      default: return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
            <Link
              href="/user/orders"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-purple-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <Link href="/user/dashboard" className="hover:text-purple-600 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <Link href="/user/orders" className="hover:text-purple-600 transition-colors">
              My Orders
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Order #{order.orderNumber}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order.orderNumber}</h1>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">
                  Placed on {formatDate(order.createdAt)}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.orderStatus === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  order.orderStatus === 'processing' ? 'bg-purple-100 text-purple-800' :
                  order.orderStatus === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                  order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.orderStatus === 'pending' && <Clock className="w-4 h-4" />}
                  {order.orderStatus === 'confirmed' && <CheckCircle className="w-4 h-4" />}
                  {order.orderStatus === 'processing' && <Package className="w-4 h-4" />}
                  {order.orderStatus === 'shipped' && <Truck className="w-4 h-4" />}
                  {order.orderStatus === 'delivered' && <Home className="w-4 h-4" />}
                  {order.orderStatus === 'cancelled' && <XCircle className="w-4 h-4" />}
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintInvoice}
                disabled={printing}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
              >
                {printing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4 mr-2" />
                )}
                Print Invoice
              </button>
              
              {order.orderStatus === 'pending' && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
                >
                  {cancelling ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Profile Card */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold">
                    {order.shippingAddress.firstName?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {order.shippingAddress.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {order.shippingAddress.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400 absolute inset-0 m-auto" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900">{item.productName}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>Quantity: {item.quantity}</span>
                              <span>Price: ₹{item.price.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ₹{(item.quantity * item.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Review Button for Delivered Orders */}
                        {order.orderStatus === 'delivered' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">
                                  {checkingReviewStatus 
                                    ? 'Checking review eligibility...' 
                                    : canReviewItems[item.productId] 
                                      ? 'You can review this product' 
                                      : 'Already reviewed or not eligible'}
                                </p>
                              </div>
                              
                              <button
                                onClick={() => handleWriteReview(item.productId, item.productName)}
                                disabled={checkingReviewStatus || !canReviewItems[item.productId]}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Write Review
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Notes */}
              {order.orderNotes && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-yellow-600" />
                    <h3 className="font-bold text-gray-900">Order Notes</h3>
                  </div>
                  <p className="text-gray-700">{order.orderNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary & Info */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({order.items.length} items)</span>
                  <span className="font-medium">₹{order.subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee.toLocaleString()}`}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-medium">₹{order.tax.toLocaleString()}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{order.total.toLocaleString()}
                      </span>
                      <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-gray-700">
                  {order.shippingAddress.address}
                  {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                </p>
                <p className="text-gray-700">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                </p>
                <p className="text-gray-700">
                  {order.shippingAddress.country}
                </p>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-gray-700">
                    📞 {order.shippingAddress.phone}
                  </p>
                  <p className="text-gray-700">
                    ✉️ {order.shippingAddress.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Payment Information</h2>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{getPaymentMethodText(order.paymentMethod)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about your order, please contact our customer support.
              </p>
              <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}