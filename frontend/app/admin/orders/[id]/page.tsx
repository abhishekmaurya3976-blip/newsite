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
      
      // For COD orders, when status is "delivered", also update payment status to "paid"
      if (status === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'pending') {
        // First update payment status
        const paymentResponse = await ordersApi.updatePaymentStatus(order._id, 'paid');
        if (!paymentResponse.success) {
          alert('Failed to update payment status');
          return;
        }
      }

      // Update order status
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

  // ------------------ Premium print functions ------------------

  // Format INR numbers
  const formatNumber = (n: number) => {
    return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  function capitalize(s: string) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Small escape helper
  function escapeHtml(str: any) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // Convert image URL to absolute (ensures new window can load it)
  function toAbsoluteUrl(src?: string) {
    if (!src) return '';
    try {
      return new URL(src, window.location.origin).href;
    } catch {
      return src;
    }
  }

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

  // Build the printable HTML for the invoice (full-page, mobile-friendly)
  const buildPrintHTML = (o: Order) => {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Invoice - ${escapeHtml(o.orderNumber)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --brand: #6D28D9; /* purple-600 */
    --muted: #6B7280;
    --bg: #fff;
  }
  html,body { height:100%; margin:0; font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:var(--bg); color:#111827; -webkit-print-color-adjust: exact; }
  .page { max-width:900px; margin:18px auto; padding:24px; box-shadow: 0 10px 30px rgba(2,6,23,0.06); border-radius:8px; background:#fff; }
  header{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
  .brand { display:flex; gap:12px; align-items:center; }
  .brand .title { font-weight:700; font-size:18px; color:var(--brand); }
  .meta { text-align:right; }
  .meta .big { font-weight:700; font-size:16px; }
  .section { margin-top:20px; }
  .grid { display:flex; gap:20px; }
  .col { flex:1; }
  .address { background:#F9FAFB; padding:12px; border-radius:6px; border:1px solid #E5E7EB; font-size:13px; color:var(--muted); }
  table { width:100%; border-collapse:collapse; margin-top:12px; font-size:13px; }
  th,td { padding:12px 8px; text-align:left; border-bottom:1px solid #EFF2F7; vertical-align:middle; }
  th { color:var(--muted); font-weight:600; font-size:12px; text-transform:uppercase; letter-spacing:0.02em; }
  .right { text-align:right; }
  .totals { margin-top:12px; display:flex; justify-content:flex-end; gap:8px; }
  .totals .box { width:320px; border-radius:6px; padding:12px; background:#F8FAFF; border:1px solid #E6EEF8; }
  .small { font-size:12px; color:var(--muted); }
  .note { margin-top:16px; font-size:13px; color:var(--muted); }
  img.product { max-width:80px; max-height:80px; object-fit:cover; border-radius:6px; border:1px solid #F1F5F9; }
  .center { text-align:center; }
  .success { color: #059669; font-weight:700; }
  /* Print setup */
  @page { size: A4; margin: 12mm; }
  @media print {
    body { margin:0; background: #fff; -webkit-print-color-adjust:exact; }
    .page { box-shadow: none; margin:0; border-radius:0; }
    .no-print { display:none !important; }
  }
  /* Mobile scaling for "Save as PDF" on phones */
  @media (max-width:420px) {
    .page { padding:14px; margin:6px; }
    img.product { max-width:64px; max-height:64px; }
    th,td { padding:10px 6px; font-size:12px; }
    .totals .box { width:100%; }
  }
</style>
</head>
<body>
  <div class="page" id="invoice">
    <header>
      <div class="brand">
        <div style="width:48px;height:48px;border-radius:8px;background:linear-gradient(135deg,#7C3AED,#EC4899);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">AS</div>
        <div>
          <div class="title">Incred Wellness Admin</div>
          <div class="small">Invoice for Order</div>
        </div>
      </div>
      <div class="meta">
        <div class="small">Order</div>
        <div class="big">#${escapeHtml(o.orderNumber)}</div>
        <div class="small">Placed: ${escapeHtml(formatDate(o.createdAt))}</div>
      </div>
    </header>

    <div class="section grid" style="margin-top:22px;">
      <div class="col">
        <div class="small">Sold To</div>
        <div class="address" style="margin-top:8px;">
          <div style="font-weight:700; color:#111827;">${escapeHtml(o.shippingAddress.firstName)} ${escapeHtml(o.shippingAddress.lastName)}</div>
          <div>${escapeHtml(o.shippingAddress.address)}${o.shippingAddress.apartment ? ', ' + escapeHtml(o.shippingAddress.apartment) : ''}</div>
          <div>${escapeHtml(o.shippingAddress.city)}, ${escapeHtml(o.shippingAddress.state)} - ${escapeHtml(o.shippingAddress.zipCode)}</div>
          <div>${escapeHtml(o.shippingAddress.country)}</div>
          <div style="margin-top:8px;">📞 ${escapeHtml(o.shippingAddress.phone)} | ✉️ ${escapeHtml(o.shippingAddress.email)}</div>
        </div>
      </div>

      <div class="col" style="flex:0 0 300px;">
        <div class="small">Payment</div>
        <div class="address" style="margin-top:8px;">
          <div style="font-weight:700;">${escapeHtml(getPaymentMethodText(o.paymentMethod))}</div>
          <div class="small" style="margin-top:6px;">Status: <span style="font-weight:700; color:${o.paymentStatus === 'paid' ? '#059669' : o.paymentStatus === 'pending' ? '#B45309' : '#DC2626'}">${escapeHtml(capitalize(o.paymentStatus))}</span></div>
          <div class="small" style="margin-top:8px;">Order Status: <strong>${escapeHtml(capitalize(o.orderStatus))}</strong></div>
          ${o.trackingNumber ? `<div class="small" style="margin-top:8px;">Tracking #: ${escapeHtml(o.trackingNumber)}${o.shippingProvider ? ` (Carrier: ${escapeHtml(o.shippingProvider)})` : ''}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- Customer Information (Admin specific) -->
    ${o.user ? `
    <div class="section">
      <div class="small">Customer Information</div>
      <div class="address" style="margin-top:8px;">
        <div style="font-weight:700; color:#111827;">${escapeHtml(o.user.name)}</div>
        ${o.user.email ? `<div>📧 ${escapeHtml(o.user.email)}</div>` : ''}
        ${o.user.phone ? `<div>📞 ${escapeHtml(o.user.phone)}</div>` : ''}
      </div>
    </div>
    ` : ''}

    <div class="section">
      <table>
        <thead>
          <tr>
            <th style="width:8%"></th>
            <th>Product</th>
            <th style="width:12%" class="center">Qty</th>
            <th style="width:18%" class="right">Price</th>
            <th style="width:18%" class="right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${o.items.map(item => `
            <tr>
              <td class="center">${ item.image ? `<img class="product" src="${escapeHtml(toAbsoluteUrl(item.image))}" alt="${escapeHtml(item.productName)}" />` : '' }</td>
              <td>
                <div style="font-weight:600;">${escapeHtml(item.productName)}</div>
              </td>
              <td class="center">${item.quantity}</td>
              <td class="right">₹${formatNumber(item.price)}</td>
              <td class="right">₹${formatNumber(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

    <div class="totals">
    <div class="box">
    <div style="display:flex;justify-content:space-between"><div class="small">Subtotal</div><div>₹${formatNumber(o.subtotal)}</div></div>
    <div style="display:flex;justify-content:space-between;margin-top:6px;"><div class="small">Shipping</div><div>${o.shippingFee === 0 ? 'FREE' : '₹' + formatNumber(o.shippingFee)}</div></div>
    <div style="display:flex;justify-content:space-between;margin-top:6px;"><div class="small">Inclusive of all taxes</div><div>₹${formatNumber(o.tax)}</div></div>
    <hr style="border:none;border-top:1px dashed #E6EEF8;margin:10px 0;">
    
    <!-- Total Amount (bold, large) -->
    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;margin-bottom:2px;">
      <div>Total Amount</div>
      <div>₹${formatNumber(o.total)}</div>
    </div>
    <!-- Small note -->
    <div style="display:flex;justify-content:flex-end;font-size:12px;color:var(--muted);">
      Inclusive of all taxes with discount
    </div>
    </div>
   </div>

      ${o.orderNotes ? `<div class="note"><strong>Customer Notes:</strong> ${escapeHtml(o.orderNotes)}</div>` : ''}
      ${o.adminNotes ? `<div class="note"><strong>Admin Notes:</strong> ${escapeHtml(o.adminNotes)}</div>` : ''}
      <div class="note" style="margin-top:10px;">This is a computer-generated invoice for order <strong>#${escapeHtml(o.orderNumber)}</strong>. Thank you for shopping with us.</div>
    </div>

    <footer style="margin-top:22px; font-size:12px; color:var(--muted);">
      <div>ARTNSTUFF • Support: support@example.com • +91 98765 43210</div>
      <div style="margin-top:4px; font-size:11px;">This is an internal admin invoice copy</div>
    </footer>
  </div>

<script>
  // Auto-trigger print when the document is ready.
  window.onload = function() {
    setTimeout(function() {
      window.print();
      // Close window after printing on most browsers (avoid if you want user to keep it open)
      setTimeout(() => { window.close(); }, 300);
    }, 300);
  };
</script>
</body>
</html>`;
  };

  const handlePrintInvoice = async () => {
    if (!order) return;
    try {
      setPrinting(true);

      // Build printable HTML
      const html = buildPrintHTML(order);

      // Open new window and write the markup
      const printWindow = window.open('', '_blank', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=900,height=800');
      if (!printWindow) {
        alert('Please allow popups for this site to print the invoice.');
        setPrinting(false);
        return;
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      // auto print executed in the print window's onload
    } catch (err: any) {
      console.error('Print error', err);
      alert('Unable to print invoice. Please try saving as PDF from your browser.');
    } finally {
      // small delay so UI spinner shows briefly
      setTimeout(() => setPrinting(false), 700);
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
                      <span className="text-gray-600 text-sm">Inclusive of all taxes</span>
                      <span className="font-medium text-sm">₹{order.tax.toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total Amount</span>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{order.total.toLocaleString()}
                          </span>
                          <p className="text-xs text-gray-500">Inclusive of all taxes with discount</p>
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
                    <span className="text-gray-600">Inclusive of all taxes</span>
                    <span className="font-medium">₹{order.tax.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total Amount</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{order.total.toLocaleString()}
                        </span>
                        <p className="text-xs text-gray-500">Inclusive of all taxes with discount</p>
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