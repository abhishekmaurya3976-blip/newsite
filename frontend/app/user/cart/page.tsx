'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Package,
  ShoppingCart,
  Heart,
  ChevronRight,
  Crown,
  LogIn,
  AlertCircle,
  Shield,
  Lock,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Truck,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../components/contexts/AuthContext';

export default function CartPage() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    totalItems, 
    totalPrice,
    isAuthenticated,
    loginRequired
  } = useCart();
  
  const { addToWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [movingToWishlist, setMovingToWishlist] = useState<string | null>(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      loginRequired();
      return;
    }
    
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    setLoading(true);
    window.location.href = '/user/checkout';
  };

  const handleMoveToWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      loginRequired();
      return;
    }
    
    const product = cart.find(item => item.product && item.product._id === productId)?.product;
    if (!product) return;
    
    try {
      setMovingToWishlist(productId);
      await addToWishlist(product);
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to move to wishlist:', error);
    } finally {
      setMovingToWishlist(null);
    }
  };

  const getCartItemId = (item: any, index: number) => {
    return item?._id || item?.product?._id || item?.product?.slug || `item-${index}`;
  };

  // Empty state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-8 px-4 flex items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to view your cart.</p>
          <div className="space-y-3">
            <button
              onClick={loginRequired}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg active:scale-95"
            >
              Go to Login
            </button>
            <Link
              href="/products"
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
            <Link
              href="/products"
              className="md:hidden flex items-center text-sm text-purple-600 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Shop
            </Link>
          </div>
        </div>

        {/* Empty Cart Content */}
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="text-center">
            <div className="mx-auto w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-16 h-16 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <div className="space-y-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg active:scale-95"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Start Shopping
              </Link>
              <Link
                href="/user/wishlist"
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-300 font-medium"
              >
                <Heart className="w-5 h-5 mr-2" />
                View Wishlist
              </Link>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Categories</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Oil Paints', 'Brushes', 'Canvases', 'Sketching'].map((category, idx) => (
                <Link
                  key={idx}
                  href={`/products?category=${category.toLowerCase().replace(' ', '-')}`}
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all duration-300 active:scale-95"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center">{category}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-8">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="p-2 -ml-2 mr-1 text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Cart ({totalItems})</h1>
          </div>
          <button
            onClick={clearCart}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({totalItems} items)</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="flex items-center text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="flex items-center text-red-600 hover:text-red-800 font-medium"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items - Left Column */}
          <div className="lg:w-2/3">
            {/* Cart Items List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Desktop Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-gray-200 bg-gray-50">
                <div className="col-span-6">
                  <span className="text-sm font-semibold text-gray-900">PRODUCT</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-semibold text-gray-900">PRICE</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-semibold text-gray-900">QUANTITY</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-semibold text-gray-900">TOTAL</span>
                </div>
              </div>

              {/* Cart Items */}
              {cart.map((item, index) => {
                const productId = getCartItemId(item, index);
                const product = item?.product;
                
                if (!product) return null;
                
                return (
                  <div 
                    key={productId}
                    className={`p-4 md:p-6 ${index !== cart.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <div className="flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center">
                      {/* Product Info */}
                      <div className="flex items-start gap-4 mb-4 md:mb-0 md:col-span-6">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name || 'Product'}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          ) : (
                            <ShoppingBag className="w-8 h-8 text-gray-400 absolute inset-0 m-auto" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/products/${product.slug || product._id}`}
                            className="block"
                          >
                            <h3 className="font-semibold text-gray-900 hover:text-purple-600 transition-colors text-sm md:text-base line-clamp-2">
                              {product.name || 'Unknown Product'}
                            </h3>
                          </Link>
                          
                          <p className="text-xs text-gray-600 mt-1 mb-2">
                            {product.category?.name || ''}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {product.stock > 0 ? (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center w-fit">
                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5" />
                                In Stock
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full flex items-center w-fit">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1.5" />
                                Out of Stock
                              </span>
                            )}
                          </div>

                          {/* Mobile Actions */}
                          <div className="flex items-center justify-between md:hidden">
                            <div className="text-lg font-bold text-gray-900">
                              ₹{((product.price || 0) * (item.quantity || 0)).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleMoveToWishlist(productId)}
                                disabled={movingToWishlist === productId}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                {movingToWishlist === productId ? (
                                  <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Heart className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => removeFromCart(productId)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price - Desktop */}
                      <div className="hidden md:block md:col-span-2 text-center">
                        <span className="font-medium text-gray-900">
                          ₹{(product.price || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between md:justify-center">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(productId, Math.max(1, (item.quantity || 0) - 1))}
                              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors rounded-l-lg"
                              disabled={(item.quantity || 0) <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 h-10 flex items-center justify-center font-medium text-gray-900 border-x border-gray-300">
                              {item.quantity || 0}
                            </span>
                            <button
                              onClick={() => updateQuantity(productId, (item.quantity || 0) + 1)}
                              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors rounded-r-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Total Price - Desktop */}
                      <div className="hidden md:block md:col-span-2 text-center">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{((product.price || 0) * (item.quantity || 0)).toLocaleString()}
                        </span>
                      </div>

                      {/* Desktop Actions */}
                      <div className="hidden md:flex md:col-span-2 md:justify-center">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMoveToWishlist(productId)}
                            disabled={movingToWishlist === productId}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Move to Wishlist"
                          >
                            {movingToWishlist === productId ? (
                              <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Heart className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => removeFromCart(productId)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shopping Tips - Desktop */}
            <div className="hidden md:block mt-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-600" />
                  Shopping Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: <Truck className="w-4 h-4" />, title: "Free Shipping", desc: "On orders over ₹499" },
                    { icon: <RefreshCw className="w-4 h-4" />, title: "Easy Returns", desc: "30-day return policy" },
                    { icon: <CreditCard className="w-4 h-4" />, title: "Secure Payment", desc: "SSL encrypted checkout" }
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                        {benefit.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{benefit.title}</p>
                        <p className="text-sm text-gray-600">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:w-1/3">
            {/* Mobile Order Summary Toggle */}
            {isMobile && (
              <div className="sticky top-14 z-10 bg-white border-b border-gray-200">
                <button
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Order Summary</div>
                      <div className="text-sm text-gray-600">₹{(totalPrice * 1.18).toFixed(2)} • {totalItems} items</div>
                    </div>
                  </div>
                  {showOrderSummary ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            )}

            {/* Order Summary Content */}
            <div className={`${isMobile ? (showOrderSummary ? 'block' : 'hidden') : 'block'} bg-white rounded-2xl border border-gray-200 ${isMobile ? 'rounded-t-none border-t-0' : 'sticky top-24 shadow-sm'}`}>
              <div className="p-4 md:p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="font-medium">₹{(totalPrice * 0.18).toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{(totalPrice * 1.18).toFixed(2)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 md:py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg active:scale-95 mb-4"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>

                {/* Continue Shopping */}
                <Link
                  href="/products"
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium flex items-center justify-center active:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Continue Shopping
                </Link>

                {/* Mobile Shopping Tips */}
                <div className="md:hidden mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-purple-600" />
                    Shopping Benefits
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: <Truck className="w-4 h-4" />, title: "Free Shipping", desc: "On orders over ₹499" },
                      { icon: <RefreshCw className="w-4 h-4" />, title: "Easy Returns", desc: "30-day return policy" },
                      { icon: <CreditCard className="w-4 h-4" />, title: "Secure Payment", desc: "SSL encrypted checkout" }
                    ].map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                          {benefit.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{benefit.title}</p>
                          <p className="text-sm text-gray-600">{benefit.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Security Info */}
                <div className="hidden md:block mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <span>Free shipping on orders over ₹499</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <Lock className="w-5 h-5 text-blue-600" />
                      </div>
                      <span>Secure payment & SSL encryption</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <span>30-day return policy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Fixed Checkout Bar */}
            {isMobile && !showOrderSummary && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-lg font-bold text-gray-900">₹{(totalPrice * 1.18).toFixed(2)}</div>
                    <div className="text-xs text-gray-600">Total with tax</div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loading || cart.length === 0}
                    className="flex-1 ml-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg active:scale-95"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Checkout'
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setShowOrderSummary(true)}
                  className="w-full text-sm text-center text-purple-600 font-medium"
                >
                  View order summary
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Spacer for Fixed Checkout Bar */}
      {isMobile && !showOrderSummary && <div className="h-20" />}
    </div>
  );
}