// app/user/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Truck, 
  Home, 
  XCircle, 
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Calendar,
  Eye,
  Filter
} from 'lucide-react';
import { ordersApi } from '../../lib/api/orders';

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
  createdAt: string;
  deliveredAt?: string;
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page,
        limit: 10
      };
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      const result = await ordersApi.getUserOrders(params);
      
      if (result.success && result.data) {
        setOrders(result.data.orders);
        setTotalPages(result.data.totalPages);
      } else {
        setError(result.error || 'Failed to load orders');
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      setError(error.message || 'Failed to load orders. Please make sure you are logged in.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, selectedStatus]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancellingOrder(orderId);
      const response = await ordersApi.cancelOrder(orderId, 'Changed my mind');
      
      if (response.success) {
        await loadOrders();
      } else {
        alert(response.error || 'Failed to cancel order');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to cancel order');
    } finally {
      setCancellingOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <Home className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Order Placed',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center">
            <RefreshCw className="w-10 h-10 md:w-12 md:h-12 text-purple-600 animate-spin mx-auto mb-3 md:mb-4" />
            <p className="text-gray-600 text-sm md:text-base">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <nav className="flex items-center text-xs md:text-sm text-gray-600">
            <Link href="/" className="hover:text-purple-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">My Orders</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-5 md:py-8">
        {/* Header */}
        <div className="mb-5 md:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">My Orders</h1>
          <p className="text-gray-600 text-xs md:text-sm lg:text-base">Track and manage all your orders in one place</p>
        </div>

        {/* Filters - Desktop */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 p-4 mb-5 md:mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-center">
            {/* Status Filter */}
            <div className="flex gap-1 md:gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${selectedStatus === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus('pending')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${selectedStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setSelectedStatus('processing')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${selectedStatus === 'processing' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Processing
              </button>
              <button
                onClick={() => setSelectedStatus('delivered')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${selectedStatus === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Delivered
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadOrders}
              className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs md:text-sm flex items-center"
            >
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters - Mobile */}
        <div className="md:hidden mb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              {selectedStatus !== 'all' && (
                <span className="ml-2 w-2 h-2 bg-purple-600 rounded-full"></span>
              )}
            </button>
            
            <button
              onClick={loadOrders}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          {/* Mobile Filters Dropdown */}
          {showMobileFilters && (
            <div className="mt-2 bg-white rounded-xl border border-gray-200 p-3 shadow-lg">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedStatus('all');
                    setShowMobileFilters(false);
                  }}
                  className={`px-3 py-2 rounded-lg font-medium text-sm ${selectedStatus === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus('pending');
                    setShowMobileFilters(false);
                  }}
                  className={`px-3 py-2 rounded-lg font-medium text-sm ${selectedStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus('processing');
                    setShowMobileFilters(false);
                  }}
                  className={`px-3 py-2 rounded-lg font-medium text-sm ${selectedStatus === 'processing' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Processing
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus('delivered');
                    setShowMobileFilters(false);
                  }}
                  className={`px-3 py-2 rounded-lg font-medium text-sm ${selectedStatus === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Delivered
                </button>
              </div>
            </div>
          )}
          
          {/* Active Filter Display */}
          {selectedStatus !== 'all' && (
            <div className="mt-2 flex items-center">
              <span className="text-xs text-gray-600 mr-2">Active filter:</span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStatus)}`}>
                {getStatusIcon(selectedStatus)}
                {getStatusText(selectedStatus)}
              </span>
              <button
                onClick={() => setSelectedStatus('all')}
                className="ml-2 text-xs text-purple-600 hover:text-purple-800"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 md:p-4 mb-4 md:mb-6">
            <div className="flex">
              <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500 mr-2 mt-0.5" />
              <p className="text-red-700 text-sm md:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Package className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">No orders found</h3>
            <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">You haven't placed any orders yet.</p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg md:rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm md:hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="border-b border-gray-200 p-3 md:p-4">
                  <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5 md:mb-2">
                          <span className="font-bold text-gray-900 text-sm md:text-base truncate">Order #{order.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                            {getStatusIcon(order.orderStatus)}
                            <span className="hidden sm:inline">{getStatusText(order.orderStatus)}</span>
                            <span className="sm:hidden">{getStatusText(order.orderStatus).charAt(0)}</span>
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Placed: {formatDate(order.createdAt)}</span>
                          </div>
                          {order.deliveredAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Delivered: {formatDate(order.deliveredAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-lg md:text-xl font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {/* <Link
                          href={`/user/orders/${order._id}`}
                          className="px-3 py-1.5 md:py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium text-xs md:text-sm flex items-center"
                        >
                          <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">Details</span>
                        </Link> */}
                        
                        {order.orderStatus === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancellingOrder === order._id}
                            className="px-3 py-1.5 md:py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-xs md:text-sm flex items-center disabled:opacity-50"
                          >
                            {cancellingOrder === order._id ? (
                              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                            )}
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-3 md:p-4">
                  <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
                    {/* Items */}
                    <div className="flex-1">
                      <div className="space-y-2 md:space-y-3">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center gap-2 md:gap-3">
                            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.productName}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 40px, 48px"
                                />
                              ) : (
                                <Package className="w-5 h-5 md:w-6 md:h-6 text-gray-400 absolute inset-0 m-auto" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm md:text-base truncate">{item.productName}</p>
                              <p className="text-xs md:text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 text-sm md:text-base">₹{(item.quantity * item.price).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                        
                        {order.items.length > 3 && (
                          <div className="text-center pt-1 md:pt-2">
                            <p className="text-xs md:text-sm text-gray-600">
                              + {order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="lg:w-64 border-t lg:border-t-0 lg:border-l lg:pl-4 lg:pt-0 pt-3 mt-3 lg:mt-0">
                      <div className="text-xs md:text-sm">
                        <div className="flex items-center justify-between mb-1.5 md:mb-2">
                          <span className="text-gray-600">Payment:</span>
                          <span className={`px-2 py-0.5 md:py-1 rounded-full text-xs font-medium ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.paymentStatus === 'paid' ? 'Paid' :
                             order.paymentStatus === 'pending' ? 'Pending' :
                             order.paymentStatus === 'failed' ? 'Failed' : 'Refunded'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Items:</span>
                          <span className="font-medium">{order.items.length}</span>
                        </div>
                      </div>
                      
                      <Link
                        href={`/user/orders/${order._id}`}
                        className="mt-3 md:mt-4 w-full py-1.5 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-xs md:text-sm flex items-center justify-center"
                      >
                        <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                        View Full Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 md:gap-2 pt-4 md:pt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 md:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 rotate-180" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 md:w-8 md:h-8 rounded font-medium text-xs md:text-sm ${
                        page === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 md:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}