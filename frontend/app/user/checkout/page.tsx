'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../components/contexts/AuthContext';
import { 
  CreditCard, 
  Truck, 
  Shield, 
  Lock, 
  CheckCircle,
  ArrowLeft,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  ChevronRight,
  Crown,
  AlertCircle,
  Banknote,
  Smartphone,
  RefreshCw,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Eye,
  Tag,
  Percent,
  DollarSign,
  Ticket
} from 'lucide-react';
import { checkoutApi } from '../../lib/api/checkout';
import { couponApi } from '../../lib/api/coupons';

// Add this interface to fix TypeScript error
interface CartProduct {
  id: string;
  _id?: string;
  name: string;
  price: number;
  category?: any;
  images?: Array<{ url: string }>;
  // Add other properties as needed
}

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  saveAddress: boolean;
  paymentMethod: 'razorpay' | 'cod';
  orderNotes: string;
  couponCode: string;
}

interface FormErrors {
  [key: string]: string;
}

interface CouponDetails {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  discountAmount: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
}

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  
  // Coupon states
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDetails | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    saveAddress: true,
    paymentMethod: 'razorpay',
    orderNotes: '',
    couponCode: ''
  });

  // Calculate total with coupon discount
  const calculateTotals = () => {
    const subtotal = totalPrice;
    const shippingFee = subtotal >= 499 ? 0 : 50;
    const tax = subtotal * 0.18;
    
    // Calculate discount based on coupon
    let discount = 0;
    let freeShipping = false;
    
    if (appliedCoupon) {
      switch (appliedCoupon.discountType) {
        case 'percentage':
          discount = subtotal * (appliedCoupon.discountValue / 100);
          if (appliedCoupon.maxDiscountAmount && discount > appliedCoupon.maxDiscountAmount) {
            discount = appliedCoupon.maxDiscountAmount;
          }
          break;
        case 'fixed':
          discount = appliedCoupon.discountValue;
          break;
        case 'free_shipping':
          discount = shippingFee;
          freeShipping = true;
          break;
      }
    }
    
    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);
    
    const shipping = freeShipping ? 0 : shippingFee;
    const total = subtotal + shipping + tax - discount;
    
    return { subtotal, shippingFee: shipping, tax, discount, total, freeShipping };
  };

  // Check authentication and load user data
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        const returnUrl = encodeURIComponent('/user/checkout');
        router.push(`/login?redirect=${returnUrl}`);
      } else {
        setFormData(prev => ({
          ...prev,
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: user.phone || ''
        }));
      }
    }
  }, [user, authLoading, router]);

  // Validate form step
  const validateStep = (step: number): boolean => {
    const errors: FormErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = 'Please enter your first name';
      if (!formData.lastName.trim()) errors.lastName = 'Please enter your last name';
      if (!formData.email.trim()) {
        errors.email = 'Please enter your email address';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!formData.phone.trim()) {
        errors.phone = 'Please enter your phone number';
      } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
      if (!formData.address.trim()) errors.address = 'Please enter your street address';
      if (!formData.city.trim()) errors.city = 'Please enter your city';
      if (!formData.state.trim()) errors.state = 'Please enter your state';
      if (!formData.zipCode.trim()) {
        errors.zipCode = 'Please enter your ZIP code';
      } else if (!/^[0-9]{6}$/.test(formData.zipCode)) {
        errors.zipCode = 'Please enter a valid 6-digit ZIP code';
      }
    }

    if (step === 3 && !formData.paymentMethod) {
      errors.paymentMethod = 'Please select a payment method';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Apply coupon function
  const handleApplyCoupon = async () => {
    if (!formData.couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const totals = calculateTotals();
      
      console.log('Cart items before processing:', cart);
      
      // Prepare cart items for coupon validation - Match backend structure
      const cartItems = cart.map(item => {
        const product = item.product as CartProduct;
        
        // Debug log
        console.log('Processing cart item:', {
          product: product,
          hasProduct: !!product,
          productId: product?._id || product?.id,
          category: product?.category,
          price: product?.price
        });
        
        // Get product ID - handle both _id and id
        const productId = product?._id || product?.id;
        if (!productId) {
          console.error('Product ID is missing for item:', item);
          return null;
        }
        
        // Get category - ensure it's a string
        let category = 'general';
        if (product?.category) {
          if (typeof product.category === 'string') {
            category = product.category;
          } else if ((product.category as any)._id) {
            category = (product.category as any)._id.toString();
          } else if ((product.category as any).id) {
            category = (product.category as any).id;
          }
        }
        
        // Get price
        const price = product?.price || 0;
        
        return {
          productId: productId.toString(), // Ensure string
          quantity: item.quantity || 1,
          category: category,
          price: price
        };
      }).filter(item => item !== null); // Remove null items

      console.log('Cart items for coupon validation:', cartItems);
      console.log('Subtotal:', totals.subtotal);
      console.log('Coupon code:', formData.couponCode.trim().toUpperCase());
      
      const response = await couponApi.validate(
        formData.couponCode.trim().toUpperCase(),
        totals.subtotal,
        cartItems
      );

      console.log('Coupon validation response:', response);

      if (response.success && response.data) {
        const { coupon, discount } = response.data;
        
        setAppliedCoupon({
          code: coupon.code,
          name: coupon.name,
          description: coupon.description || '',
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: discount,
          maxDiscountAmount: coupon.maxDiscountAmount || undefined,
          minOrderAmount: coupon.minOrderAmount || undefined
        });
        
        setCouponSuccess(`Coupon applied successfully! ${coupon.name} - ${coupon.description || ''}`);
        setCouponError('');
        setFormData(prev => ({ ...prev, couponCode: '' }));
      } else {
        setCouponError(response.message || response.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      setCouponError(error.message || 'Failed to validate coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Remove coupon function
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('');
    setFormData(prev => ({ ...prev, couponCode: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      alert('Please fix the errors before placing order');
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: 'India'
        },
        paymentMethod: formData.paymentMethod,
        orderNotes: formData.orderNotes,
        saveAddress: formData.saveAddress,
        couponCode: appliedCoupon?.code || undefined
      };

      const response = await checkoutApi.createOrder(orderData);
      
      if (response.success && response.data) {
        const { order, payment, requiresPayment } = response.data;
        
        setOrderId(order._id);
        setOrderNumber(order.orderNumber);
        
        if (requiresPayment && payment && formData.paymentMethod === 'razorpay') {
          // Store payment data for payment page
          localStorage.setItem(`payment_${order._id}`, JSON.stringify(payment));
          
          // Clear cart
          clearCart();
          
          // Redirect to payment page
          router.push(`/user/payment?orderId=${order._id}&orderNumber=${order.orderNumber}&amount=${order.total}`);
        } else {
          // COD or other immediate confirmation
          setOrderPlaced(true);
          clearCart();
        }
      } else {
        throw new Error(response.error || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Format phone number
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      const formatted = digits.length <= 10 ? digits : digits.slice(0, 10);
      setFormData({
        ...formData,
        [name]: formatted
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear coupon error when typing in coupon field
    if (name === 'couponCode' && couponError) {
      setCouponError('');
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        // Step 3 is payment - submit the order
        handleSubmit(new Event('submit') as any);
      }
    } else {
      const firstError = Object.keys(formErrors)[0];
      if (firstError) {
        document.getElementById(firstError)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const totals = calculateTotals();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white pt-16 md:pt-24 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-yellow-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white pt-16 md:pt-24 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-white pt-16 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-20 text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-yellow-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">Add some products to your cart before checkout</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 font-medium text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    const isCOD = formData.paymentMethod === 'cod';
    
    return (
      <div className="min-h-screen bg-white pt-16 md:pt-24">
        {/* Breadcrumb */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
            <nav className="flex items-center text-xs md:text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
              <Link href="/" className="hover:text-yellow-600 transition-colors flex items-center">
                <Crown className="w-3 h-3 mr-1 md:mr-2" />
                Home
              </Link>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 text-gray-400 flex-shrink-0" />
              <Link href="/products" className="hover:text-yellow-600 transition-colors">
                Products
              </Link>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 text-gray-400 flex-shrink-0" />
              <Link href="/user/cart" className="hover:text-yellow-600 transition-colors">
                Cart
              </Link>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 text-gray-400 flex-shrink-0" />
              <span className="text-gray-900 font-medium">Order Confirmed</span>
            </nav>
          </div>
        </div>

        {/* Success Page */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-20 text-center">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-6 md:p-8 lg:p-12">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
              {isCOD ? 'Order Confirmed!' : 'Order Placed!'}
            </h1>
            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base lg:text-lg">
              {isCOD 
                ? 'Thank you for your order. Your order has been confirmed and will be delivered soon.'
                : 'Your order has been placed successfully. Please complete the payment to confirm your order.'}
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg md:rounded-xl p-4 md:p-6 mb-6 md:mb-8 max-w-md mx-auto">
              <p className="text-gray-800 font-medium mb-1 md:mb-2 text-sm md:text-base">Order Details</p>
              <p className="text-gray-600 mb-1 text-xs md:text-sm">
                Order Number: <span className="font-bold">{orderNumber}</span>
              </p>
              <p className="text-gray-600 mb-1 text-xs md:text-sm">
                Payment: <span className="font-bold">{isCOD ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}</span>
              </p>
              <p className="text-gray-600 mb-1 text-xs md:text-sm">
                Status: <span className="font-bold">{isCOD ? 'Confirmed' : 'Pending Payment'}</span>
              </p>
              <p className="text-gray-600 text-xs md:text-sm">
                Estimated Delivery: <span className="font-bold">3-5 business days</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              {!isCOD && (
                <Link
                  href={`/user/payment?orderId=${orderId}&orderNumber=${orderNumber}&amount=${totals.total}`}
                  className="inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 font-medium text-sm md:text-base shadow-lg hover:shadow-xl"
                >
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Complete Payment
                </Link>
              )}
              
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium text-sm md:text-base shadow-lg hover:shadow-xl"
              >
                Continue Shopping
              </Link>
              
              <Link
                href="/user/orders"
                className="inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium text-sm md:text-base"
              >
                <Eye className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 md:pt-24">
      {/* Breadcrumb - Hide on small mobile */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <nav className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-yellow-600 transition-colors flex items-center">
              <Crown className="w-3 h-3 mr-2" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <Link href="/products" className="hover:text-yellow-600 transition-colors">
              Products
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <Link href="/user/cart" className="hover:text-yellow-600 transition-colors">
              Cart
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Checkout</span>
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sm:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Progress Steps - Mobile Optimized */}
        <div className="mb-6 md:mb-8 px-2 sm:px-0">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {['Delivery', 'Review', 'Payment'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div className={`flex flex-col items-center ${index + 1 <= step ? 'text-yellow-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-1 md:mb-2 ${
                    index + 1 <= step 
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' 
                      : 'bg-gray-200'
                  }`}>
                    {index + 1 <= step ? (
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <span className="font-bold text-xs md:text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{label}</span>
                  <span className="text-xs font-medium sm:hidden">{label.charAt(0)}</span>
                </div>
                {index < 2 && (
                  <div className={`w-8 md:w-16 lg:w-20 h-1 mx-1 md:mx-2 lg:mx-4 ${
                    index + 1 < step ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-4 md:mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-yellow-200 mx-2 sm:mx-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm md:text-lg">{user.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm md:text-base truncate">Welcome, {user.name || 'Customer'}!</p>
              <p className="text-xs text-gray-600 truncate">Complete your order with secure checkout</p>
            </div>
          </div>
        </div>

        {/* Mobile Coupon Input - ALWAYS VISIBLE */}
        <div className="lg:hidden mb-4 mx-2 sm:mx-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <Tag className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="font-bold text-gray-900">Apply Coupon Code</h3>
            </div>
            
            {appliedCoupon ? (
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">
                      Coupon Applied: {appliedCoupon.code}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-xs text-green-700 mb-1">{appliedCoupon.description}</p>
                <p className="text-xs text-green-700">
                  Discount: ₹{totals.discount.toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.couponCode}
                      onChange={handleChange}
                      name="couponCode"
                      placeholder="Enter coupon code"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:from-yellow-600 hover:to-amber-600 text-sm font-medium disabled:opacity-50 flex items-center"
                  >
                    {applyingCoupon ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-xs">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="text-green-500 text-xs">{couponSuccess}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Order Summary Toggle */}
        <div className="lg:hidden mb-4 mx-2 sm:mx-0">
          <button
            onClick={() => setShowOrderSummary(!showOrderSummary)}
            className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Package className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="font-medium text-gray-900">Order Summary</span>
              <span className="ml-2 text-sm text-gray-500">({cart.length} items)</span>
            </div>
            {showOrderSummary ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 mr-2 text-yellow-600" />
                    Shipping Address
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                        <input
                          id="firstName"
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base ${
                            formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your first name"
                        />
                      </div>
                      {formErrors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base ${
                          formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your last name"
                      />
                      {formErrors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your email address"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base ${
                            formErrors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter 10-digit phone number"
                          maxLength={10}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="address"
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base ${
                          formErrors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter street address, house number"
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Apartment/Suite (Optional)
                      </label>
                      <input
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleChange}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base"
                        placeholder="Apt, suite, building (optional)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base ${
                          formErrors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter city name"
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="state"
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base ${
                          formErrors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter state"
                      />
                      {formErrors.state && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base ${
                          formErrors.zipCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter 6-digit PIN code"
                        maxLength={6}
                      />
                      {formErrors.zipCode && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>
                      )}
                    </div>
                  </div>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="saveAddress"
                      checked={formData.saveAddress}
                      onChange={handleChange}
                      className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Save this address for future orders</span>
                  </label>
                </div>
              )}

              {/* Step 2: Review Order */}
              {step === 2 && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
                    <Package className="w-5 h-5 md:w-6 md:h-6 mr-2 text-yellow-600" />
                    Review Your Order
                  </h2>
                  
                  {/* Order Summary */}
                  <div className="mb-4 md:mb-6">
                    <h3 className="font-bold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Order Items</h3>
                    <div className="space-y-3 md:space-y-4">
                      {cart.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg">
                          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.product.images?.[0] && (
                              <Image
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 48px, 64px"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm md:text-base truncate">{item.product.name}</h4>
                            <p className="text-xs md:text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <p className="text-xs md:text-sm text-gray-600">Price: ₹{item.product.price.toLocaleString()}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-gray-900 text-sm md:text-base">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Details */}
                  <div className="mb-4 md:mb-6 p-3 md:p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Shipping Details</h3>
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-gray-700 text-sm md:text-base">
                        <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-gray-700 text-sm md:text-base">
                        <span className="font-medium">Address:</span> {formData.address}, {formData.apartment && `${formData.apartment}, `}{formData.city}, {formData.state} - {formData.zipCode}
                      </p>
                      <p className="text-gray-700 text-sm md:text-base">
                        <span className="font-medium">Contact:</span> {formData.phone} | {formData.email}
                      </p>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div className="mb-4 md:mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="orderNotes"
                      value={formData.orderNotes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base"
                      placeholder="Special instructions, delivery preferences, gift wrapping requests, etc."
                    />
                  </div>

                  {/* Edit Address Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Edit Shipping Address
                    </button>
                  </div>
                </div>
              )}
            {/* Step 3: Payment */}
        {step === 3 && (  
   <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
      <CreditCard className="w-5 h-5 md:w-6 md:h-6 mr-2 text-yellow-600" />
      Select Payment Method
    </h2>
    
    <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
      {/* Razorpay Option */}
      <label className="flex items-center p-3 md:p-4 border-2 border-yellow-500 rounded-lg md:rounded-xl cursor-pointer bg-gradient-to-r from-yellow-50 to-amber-50">
        <input
          type="radio"
          name="paymentMethod"
          value="razorpay"
          checked={formData.paymentMethod === 'razorpay'}
          onChange={handleChange}
          className="w-4 h-4 md:w-5 md:h-5 text-yellow-600"
        />
        <div className="ml-3 md:ml-4">
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 mr-2" />
            <span className="font-bold text-gray-900 text-sm md:text-base">Razorpay</span>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">
            Credit/Debit Cards, UPI, Net Banking
          </p>
        </div>
      </label>

      {/* Cash on Delivery Option */}
      <label className="flex items-center p-3 md:p-4 border border-gray-300 rounded-lg md:rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
        <input
          type="radio"
          name="paymentMethod"
          value="cod"
          checked={formData.paymentMethod === 'cod'}
          onChange={handleChange}
          className="w-4 h-4 md:w-5 md:h-5 text-yellow-600"
        />
        <div className="ml-3 md:ml-4">
          <div className="flex items-center">
            <Banknote className="w-4 h-4 md:w-5 md:h-5 text-green-600 mr-2" />
            <span className="font-bold text-gray-900 text-sm md:text-base">Cash on Delivery</span>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">
            Pay when you receive your order
          </p>
        </div>
      </label>

      {formData.paymentMethod === 'cod' && (
        <div className="p-3 md:p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Cash on Delivery Information</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                Pay in cash at the time of delivery
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                No additional charges for COD
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                Order will be confirmed immediately
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>

    {formErrors.paymentMethod && (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">{formErrors.paymentMethod}</p>
      </div>
    )}

    {/* Payment Security Info - only show for Razorpay */}
    {formData.paymentMethod === 'razorpay' && (
      <div className="mt-6 md:mt-8 flex items-start p-3 md:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg md:rounded-xl border border-green-200">
        <Lock className="w-4 h-4 md:w-5 md:h-5 text-green-600 mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
        <span className="text-green-800 text-xs md:text-sm">
          Your payment information is encrypted and secure. We never store your card details.
        </span>
      </div>
    )}

    {/* COD Note */}
    {formData.paymentMethod === 'cod' && (
      <div className="mt-6 md:mt-8 flex items-start p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg md:rounded-xl border border-yellow-200">
        <Banknote className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
        <span className="text-yellow-800 text-xs md:text-sm">
          Pay in cash at the time of delivery. No advance payment required.
        </span>
      </div>
    )}

    {/* Edit Review Button */}
    <div className="flex justify-end mt-6">
      <button
        type="button"
        onClick={() => setStep(2)}
        className="text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Edit Order Details
      </button>
    </div>
  </div>
          )}

              {/* Navigation Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-4 md:pt-6 border-t border-gray-200 gap-3 sm:gap-0">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={step === 1 || loading}
                  className="w-full sm:w-auto px-5 py-2.5 md:px-6 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  Back
                </button>
                
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm md:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : step === 3 ? (
                    <>
                      {formData.paymentMethod === 'cod' ? 'Place COD Order' : 'Proceed to Payment'}
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                    </>
                  ) : (
                    <>
                      Continue to {step === 1 ? 'Review' : 'Payment'}
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            {/* Mobile Order Summary (Collapsible) */}
            <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
              showOrderSummary ? 'max-h-[1000px]' : 'max-h-0'
            }`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-2">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Subtotal ({cart.length} items)</span>
                    <span className="font-medium text-sm">₹{totals.subtotal.toLocaleString()}</span>
                  </div>
                  
                  {/* Discount Line */}
                  {totals.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Discount</span>
                      <span className="font-medium text-green-600 text-sm">
                        -₹{totals.discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Shipping</span>
                    <span className="font-medium text-green-600 text-sm">
                      {totals.shippingFee === 0 ? 'FREE' : `₹${totals.shippingFee.toLocaleString()}`}
                    </span>
                  </div>

                  {/* NEW: Tax line */}
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Inclusive of all taxes</span>
                    <span className="font-medium text-sm">₹{totals.tax.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      {/* Updated label */}
                      <span className="font-bold text-gray-900">Total </span>
                      <div className="text-right">
                        <span className="text-xl font-bold text-gray-900">
                          ₹{totals.total.toLocaleString()}
                        </span>
                        <p className="text-xs text-gray-500">
                          {totals.shippingFee === 0 ? 'Free shipping included' : 'Shipping calculated'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Progress Bar - Updated threshold to 499 */}
                {totals.subtotal < 499 && !totals.freeShipping && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-yellow-900">
                        Add ₹{(499 - totals.subtotal).toLocaleString()} more for FREE shipping
                      </span>
                      <span className="text-xs font-bold text-yellow-700">
                        {Math.round((totals.subtotal / 499) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (totals.subtotal / 499) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Cart Items Preview */}
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Items in Cart</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.product.images?.[0] && (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-gray-900">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Step Info - Updated free shipping text */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <Truck className="w-3 h-3 mr-2 text-blue-600" />
                      <span>Free shipping on orders over ₹499</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Shield className="w-3 h-3 mr-2 text-green-600" />
                      <span>Art Plazaa return policy</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Package className="w-3 h-3 mr-2 text-yellow-600" />
                      <span>Delivery in 3-5 business days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Order Summary */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                  <span className="font-medium">₹{totals.subtotal.toLocaleString()}</span>
                </div>
                
                {/* Discount Line */}
                {totals.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -₹{totals.discount.toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">
                    {totals.shippingFee === 0 ? 'FREE' : `₹${totals.shippingFee.toLocaleString()}`}
                  </span>
                </div>

                {/* NEW: Tax line */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Inclusive of all taxes</span>
                  <span className="font-medium">₹{totals.tax.toLocaleString()}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    {/* Updated label */}
                    <span className="text-lg font-bold text-gray-900">Total </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{totals.total.toLocaleString()}
                      </span>
                      <p className="text-xs text-gray-500">
                        {totals.shippingFee === 0 ? 'Free shipping included' : 'Shipping calculated'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Coupon Section - ALWAYS VISIBLE */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Tag className="w-5 h-5 text-yellow-600 mr-2" />
                  <h3 className="font-bold text-gray-900">Apply Coupon Code</h3>
                </div>
                
                {appliedCoupon ? (
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900">
                          Coupon Applied: {appliedCoupon.code}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-xs text-green-700 mb-1">{appliedCoupon.description}</p>
                    <p className="text-xs text-green-700">
                      Discount: ₹{totals.discount.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.couponCode}
                          onChange={handleChange}
                          name="couponCode"
                          placeholder="Enter coupon code"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon}
                        className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:from-yellow-600 hover:to-amber-600 text-sm font-medium disabled:opacity-50 flex items-center"
                      >
                        {applyingCoupon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-xs">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="text-green-500 text-xs">{couponSuccess}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Shipping Progress Bar - Updated threshold to 499 */}
              {totals.subtotal < 499 && !totals.freeShipping && (
                <div className="mb-6 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-900">
                      Add ₹{(499 - totals.subtotal).toLocaleString()} more for FREE shipping
                    </span>
                    <span className="text-sm font-bold text-yellow-700">
                      {Math.round((totals.subtotal / 499) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (totals.subtotal / 499) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Cart Items Preview */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Items in Cart</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.product.images?.[0] && (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Step Info - Updated free shipping text */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="w-4 h-4 mr-3 text-blue-600" />
                    <span>Free shipping on orders over ₹499</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 mr-3 text-green-600" />
                    <span>Art Plazaa return policy</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="w-4 h-4 mr-3 text-yellow-600" />
                    <span>Delivery in 3-5 business days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}