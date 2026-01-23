'use client';

import { useState, useEffect } from 'react';
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
  Calendar,
  Printer,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Edit,
  User,
  Mail,
  Phone,
  Save,
  X,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ordersApi } from '../../../lib/api/orders';

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
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

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editingAdminNotes, setEditingAdminNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingProvider, setShippingProvider] = useState('');
  const [printing, setPrinting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ordersApi.getOrder(orderId);
      
      if (response.success && response.data?.order) {
        const orderData = response.data.order;
        setOrder(orderData);
        setAdminNotes(orderData.adminNotes || '');
        setTrackingNumber(orderData.trackingNumber || '');
        setShippingProvider(orderData.shippingProvider || '');
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

  const handleUpdateStatus = async (status: string) => {
    if (!order) return;

    try {
      setUpdating(true);
      const response = await ordersApi.updateOrderStatus(order._id, status, adminNotes);
      
      if (response.success) {
        await loadOrder();
      } else {
        alert(response.error || 'Failed to update status');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!order) return;

    try {
      setUpdating(true);
      const response = await ordersApi.updateOrderStatus(order._id, order.orderStatus, adminNotes);
      
      if (response.success) {
        setOrder(prev => prev ? { ...prev, adminNotes } : null);
        setEditingAdminNotes(false);
      } else {
        alert(response.error || 'Failed to save notes');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to save notes');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintInvoice = () => {
    setPrinting(true);
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - Order #${order?.orderNumber}</title>
          <style>
            @media print {
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif; 
                font-size: 12px;
                color: #000;
              }
              .invoice-container { 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px;
                border: 1px solid #ddd;
              }
              .invoice-header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #000; 
                padding-bottom: 20px; 
              }
              .invoice-header h1 { 
                margin: 0 0 10px 0; 
                font-size: 24px; 
                color: #333;
              }
              .invoice-header p { 
                margin: 5px 0; 
                font-size: 14px;
              }
              .invoice-section { 
                margin-bottom: 25px; 
                page-break-inside: avoid;
              }
              .invoice-section h2 { 
                border-bottom: 1px solid #ccc; 
                padding-bottom: 5px; 
                margin-bottom: 15px; 
                font-size: 16px; 
                color: #333;
              }
              .invoice-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 15px 0; 
                font-size: 12px;
              }
              .invoice-table th { 
                background: #f5f5f5; 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
                font-weight: bold;
              }
              .invoice-table td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                vertical-align: top;
              }
              .summary-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 15px 0;
              }
              .summary-table td { 
                padding: 6px 0; 
                border-bottom: 1px solid #eee; 
              }
              .total-row { 
                font-weight: bold; 
                border-top: 2px solid #000; 
                font-size: 14px;
              }
              .address-section { 
                border: 1px solid #ddd; 
                padding: 15px; 
                margin: 15px 0; 
                background: #f9f9f9;
              }
              .status-badge {
                display: inline-block;
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                margin-left: 10px;
              }
              .company-info {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 20px;
              }
              .company-info h2 {
                margin: 0 0 5px 0;
                font-size: 18px;
                color: #333;
              }
              .company-info p {
                margin: 2px 0;
                font-size: 11px;
                color: #666;
              }
              .no-print { 
                display: none !important; 
              }
              @page { 
                margin: 15mm; 
              }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .font-bold { font-weight: bold; }
              .mb-1 { margin-bottom: 5px; }
              .mb-2 { margin-bottom: 10px; }
              .mb-3 { margin-bottom: 15px; }
              .mt-2 { margin-top: 10px; }
              .mt-3 { margin-top: 15px; }
              .pt-3 { padding-top: 15px; }
              .border-t { border-top: 1px solid #ddd; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
    setPrinting(false);
  };

  const generatePrintContent = () => {
    if (!order) return '';
    
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

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return '#fef3c7';
        case 'confirmed': return '#dbeafe';
        case 'processing': return '#f3e8ff';
        case 'shipped': return '#e0e7ff';
        case 'delivered': return '#dcfce7';
        case 'cancelled': return '#fee2e2';
        default: return '#f3f4f6';
      }
    };

    const getStatusTextColor = (status: string) => {
      switch (status) {
        case 'pending': return '#92400e';
        case 'confirmed': return '#1e40af';
        case 'processing': return '#6b21a8';
        case 'shipped': return '#3730a3';
        case 'delivered': return '#166534';
        case 'cancelled': return '#991b1b';
        default: return '#374151';
      }
    };

    return `
      <div class="invoice-container">
        <!-- Company Header -->
        <div class="company-info">
          <h2>ARTNSTUFF</h2>
          <p>Email: info@artnstuff.com | Phone: +91 1234567890</p>
          <p>Address: 123 Art Street, Creative City, India</p>
        </div>

        <!-- Order Header -->
        <div class="invoice-header">
          <h1>INVOICE</h1>
          <div class="mb-2">
            <strong>Order #${order.orderNumber}</strong>
            <span class="status-badge" style="background: ${getStatusColor(order.orderStatus)}; color: ${getStatusTextColor(order.orderStatus)};">
              ${order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
          </div>
          <p><strong>Placed on:</strong> ${formatDate(order.createdAt)}</p>
          <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}</p>
        </div>

        <!-- Customer Information -->
        <div class="invoice-section">
          <h2>Customer Information</h2>
          <table class="summary-table">
            <tr>
              <td><strong>Name:</strong></td>
              <td>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>${order.shippingAddress.email}</td>
            </tr>
            <tr>
              <td><strong>Phone:</strong></td>
              <td>${order.shippingAddress.phone}</td>
            </tr>
            <tr>
              <td><strong>Order Status:</strong></td>
              <td>${order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}</td>
            </tr>
            <tr>
              <td><strong>Payment Status:</strong></td>
              <td>${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</td>
            </tr>
          </table>
        </div>

        <!-- Order Items -->
        <div class="invoice-section">
          <h2>Order Items</h2>
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price (₹)</th>
                <th class="text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item, index) => `
                <tr>
                  <td>${index + 1}. ${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price.toLocaleString()}</td>
                  <td class="text-right">₹${(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Order Notes -->
        ${order.orderNotes ? `
          <div class="invoice-section">
            <h2>Order Notes</h2>
            <div style="padding: 10px; border: 1px dashed #ddd; border-radius: 4px;">
              <p style="margin: 0;">${order.orderNotes}</p>
            </div>
          </div>
        ` : ''}

        <!-- Order Summary -->
        <div class="invoice-section">
          <h2>Order Summary</h2>
          <table class="summary-table" style="width: 50%; margin-left: auto;">
            <tr>
              <td>Subtotal (${order.items.length} items)</td>
              <td class="text-right">₹${order.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Shipping</td>
              <td class="text-right">${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee.toLocaleString()}`}</td>
            </tr>
            <tr>
              <td>Tax (18% GST)</td>
              <td class="text-right">₹${order.tax.toLocaleString()}</td>
            </tr>
            <tr class="total-row">
              <td><strong>TOTAL AMOUNT</strong></td>
              <td class="text-right"><strong>₹${order.total.toLocaleString()}</strong></td>
            </tr>
          </table>
          <p style="text-align: right; font-size: 11px; color: #666; margin-top: 5px;">
            Inclusive of all taxes
          </p>
        </div>

        <!-- Shipping Address -->
        <div class="invoice-section">
          <h2>Shipping Address</h2>
          <div class="address-section">
            <p style="margin: 0 0 8px 0;"><strong>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong></p>
            <p style="margin: 0 0 5px 0;">${order.shippingAddress.address}</p>
            ${order.shippingAddress.apartment ? `<p style="margin: 0 0 5px 0;">${order.shippingAddress.apartment}</p>` : ''}
            <p style="margin: 0 0 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</p>
            <p style="margin: 0 0 5px 0;">${order.shippingAddress.country}</p>
            <div class="border-t pt-3 mt-2">
              <p style="margin: 5px 0;">📞 ${order.shippingAddress.phone}</p>
              <p style="margin: 5px 0;">✉️ ${order.shippingAddress.email}</p>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="invoice-section">
          <h2>Payment Information</h2>
          <table class="summary-table">
            <tr>
              <td><strong>Payment Method:</strong></td>
              <td>${getPaymentMethodText(order.paymentMethod)}</td>
            </tr>
            <tr>
              <td><strong>Payment Status:</strong></td>
              <td>${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div class="invoice-section" style="margin-top: 40px;">
          <div style="border-top: 2px solid #000; padding-top: 20px;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #666;">
              <div style="text-align: center; flex: 1;">
                <p style="margin: 0;">___________________</p>
                <p style="margin: 5px 0 0 0;">Customer Signature</p>
              </div>
              <div style="text-align: center; flex: 1;">
                <p style="margin: 0;">___________________</p>
                <p style="margin: 5px 0 0 0;">Company Stamp & Signature</p>
              </div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #666;">
            <p style="margin: 5px 0;">Thank you for your business!</p>
            <p style="margin: 5px 0;">This is a computer generated invoice, no signature required.</p>
          </div>
        </div>
      </div>
    `;
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

  const getStatusOptions = () => {
    return [
      { value: 'pending', label: 'Pending', color: 'text-yellow-600', icon: <Clock className="w-4 h-4" /> },
      { value: 'confirmed', label: 'Confirmed', color: 'text-blue-600', icon: <CheckCircle className="w-4 h-4" /> },
      { value: 'processing', label: 'Processing', color: 'text-purple-600', icon: <Package className="w-4 h-4" /> },
      { value: 'shipped', label: 'Shipped', color: 'text-indigo-600', icon: <Truck className="w-4 h-4" /> },
      { value: 'delivered', label: 'Delivered', color: 'text-green-600', icon: <Home className="w-4 h-4" /> },
      { value: 'cancelled', label: 'Cancelled', color: 'text-red-600', icon: <XCircle className="w-4 h-4" /> }
    ];
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

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center">
            <RefreshCw className="w-10 h-10 md:w-12 md:h-12 text-purple-600 animate-spin mx-auto mb-3 md:mb-4" />
            <p className="text-gray-600 text-sm md:text-base">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">Order Not Found</h3>
            <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">{error || 'The order you are looking for does not exist.'}</p>
            <Link
              href="/admin/orders"
              className="inline-flex items-center px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusOptions = getStatusOptions();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 md:py-4">
          <nav className="flex items-center text-xs md:text-sm text-gray-600">
            <Link href="/admin" className="hover:text-purple-600 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1.5 md:mx-2 text-gray-400" />
            <Link href="/admin/orders" className="hover:text-purple-600 transition-colors">
              Orders
            </Link>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1.5 md:mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium truncate">Order #{order.orderNumber}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-5 md:py-8">
        {/* Header */}
        <div className="mb-5 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Order #{order.orderNumber}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <span className="text-gray-600 text-xs md:text-sm">
                  Placed on {formatDate(order.createdAt)}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Link
                href="/admin/orders"
                className="flex-1 md:flex-none px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium text-xs md:text-sm flex items-center justify-center"
              >
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                <span className="hidden sm:inline">Back to Orders</span>
                <span className="sm:hidden">Back</span>
              </Link>
              
              <button
                onClick={handlePrintInvoice}
                disabled={printing}
                className="flex-1 md:flex-none px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium text-xs md:text-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700"
              >
                {printing ? (
                  <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1.5 animate-spin" />
                ) : (
                  <Printer className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                )}
                <span className="hidden sm:inline">Print Invoice</span>
                <span className="sm:hidden">Print</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
          {/* Left Column - Order Info */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6">
            {/* Customer & Status - Mobile */}
            <div className="md:hidden bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              <div>
                <h2 className="font-bold text-gray-900 mb-3">Customer Information</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {order.user?.name || `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
                    </p>
                    <p className="text-xs text-gray-600">Customer</p>
                  </div>
                </div>
                
                <div className="space-y-1.5 mt-3 pl-13">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-700 text-sm truncate">{order.shippingAddress.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-700 text-sm">{order.shippingAddress.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-700 text-sm truncate">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h2 className="font-bold text-gray-900 mb-3">Order Status</h2>
                <div className="space-y-2">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleUpdateStatus(option.value)}
                      disabled={updating || order.orderStatus === option.value}
                      className={`w-full p-3 border rounded-lg flex items-center justify-between ${
                        order.orderStatus === option.value
                          ? 'border-2 border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={option.color}>
                          {option.icon}
                        </div>
                        <span className={`font-medium text-sm ${option.color}`}>{option.label}</span>
                      </div>
                      {updating && order.orderStatus === option.value && (
                        <RefreshCw className="w-3 h-3 animate-spin text-purple-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Items - Mobile */}
            <div className="md:hidden bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('items')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="font-bold text-gray-900">Order Items ({order.items.length})</h2>
                {expandedSection === 'items' ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {expandedSection === 'items' && (
                <div className="px-4 pb-4 space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.productName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400 absolute inset-0 m-auto" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{item.productName}</h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                            <span>Qty: {item.quantity}</span>
                            <span>Price: ₹{item.price.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">
                            ₹{(item.quantity * item.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Customer & Status */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {order.user?.name || `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
                        </p>
                        <p className="text-sm text-gray-600">Customer</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pl-13">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{order.shippingAddress.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{order.shippingAddress.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleUpdateStatus(option.value)}
                          disabled={updating || order.orderStatus === option.value}
                          className={`flex-1 min-w-[120px] p-3 border rounded-lg flex flex-col items-center justify-center gap-2 ${
                            order.orderStatus === option.value
                              ? 'border-2 border-purple-500 bg-purple-50'
                              : 'border-gray-300 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white`}
                        >
                          <div className={option.color}>
                            {option.icon}
                          </div>
                          <span className={`font-medium ${option.color}`}>{option.label}</span>
                          {updating && order.orderStatus === option.value && (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Order Items */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
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
                      <div className="flex justify-between items-start">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="font-bold text-gray-900 text-base md:text-xl">Admin Notes</h2>
                {editingAdminNotes ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveAdminNotes}
                      disabled={updating}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Save Notes"
                    >
                      {updating ? <RefreshCw className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Save className="w-3 h-3 md:w-4 md:h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingAdminNotes(false);
                        setAdminNotes(order.adminNotes || '');
                      }}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingAdminNotes(true)}
                    className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    title="Edit Notes"
                  >
                    <Edit className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                )}
              </div>
              
              {editingAdminNotes ? (
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Add internal notes about this order..."
                />
              ) : (
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  {adminNotes ? (
                    <p className="text-gray-700 text-sm md:text-base whitespace-pre-wrap">{adminNotes}</p>
                  ) : (
                    <p className="text-gray-500 italic text-sm md:text-base">No admin notes added yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-5 md:space-y-6">
            {/* Order Summary - Mobile */}
            <div className="md:hidden bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('summary')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="font-bold text-gray-900">Order Summary</h2>
                {expandedSection === 'summary' ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {expandedSection === 'summary' && (
                <div className="px-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Subtotal ({order.items.length} items)</span>
                      <span className="font-medium text-sm">₹{order.subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Shipping</span>
                      <span className="font-medium text-sm">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee.toLocaleString()}`}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Tax (18% GST)</span>
                      <span className="font-medium text-sm">₹{order.tax.toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total Amount</span>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{order.total.toLocaleString()}
                          </span>
                          <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Address - Mobile */}
            <div className="md:hidden bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('address')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h2 className="font-bold text-gray-900">Shipping Address</h2>
                </div>
                {expandedSection === 'address' ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {expandedSection === 'address' && (
                <div className="px-4 pb-4 space-y-1.5">
                  <p className="font-medium text-gray-900 text-sm">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {order.shippingAddress.address}
                    {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {order.shippingAddress.country}
                  </p>
                  <div className="pt-2 border-t border-gray-200 space-y-1">
                    <p className="text-gray-700 text-sm">
                      📞 {order.shippingAddress.phone}
                    </p>
                    <p className="text-gray-700 text-sm">
                      ✉️ {order.shippingAddress.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Info - Mobile */}
            <div className="md:hidden bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('payment')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <h2 className="font-bold text-gray-900">Payment Information</h2>
                </div>
                {expandedSection === 'payment' ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {expandedSection === 'payment' && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Payment Method:</span>
                    <span className="font-medium text-sm">{getPaymentMethodText(order.paymentMethod)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Payment Status:</span>
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
              )}
            </div>

            {/* Desktop Right Column */}
            <div className="hidden md:block space-y-6">
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
                
                <div className="space-y-3">
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
                  
                  {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-800 text-sm">
                        <span className="font-medium">Note:</span> Payment will be collected on delivery
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              {order.orderNotes && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">Customer Notes</h2>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{order.orderNotes}</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Timeline</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  
                  {order.updatedAt !== order.createdAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <RefreshCw className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Last Updated</p>
                        <p className="text-sm text-gray-600">{formatDate(order.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {order.deliveredAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Delivered</p>
                        <p className="text-sm text-gray-600">{formatDate(order.deliveredAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}