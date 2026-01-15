// app/user/cart/page.tsx
'use client';

import { useState } from 'react';
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
  Crown
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    setLoading(true);
    // Navigate to checkout
    window.location.href = '/user/checkout';
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24">
        {/* Breadcrumb */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center text-sm text-gray-600 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <Link 
                href="/" 
                className="hover:text-purple-600 transition-colors flex items-center animate-fadeIn flex-shrink-0"
              >
                <Crown className="w-3 h-3 mr-2" />
                Home
              </Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
              <Link 
                href="/products" 
                className="hover:text-purple-600 transition-colors animate-fadeIn delay-100 flex-shrink-0"
              >
                Products
              </Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
              <span className="text-gray-900 font-medium truncate animate-fadeIn delay-200 flex-shrink-0">
                Shopping Cart
              </span>
            </nav>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet. Start shopping to discover amazing art supplies!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Continue Shopping
              </Link>
              <Link
                href="/products?category=featured"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                <Heart className="w-5 h-5 mr-2" />
                Browse Featured
              </Link>
            </div>
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
          <nav className="flex items-center text-sm text-gray-600 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link 
              href="/" 
              className="hover:text-purple-600 transition-colors flex items-center animate-fadeIn flex-shrink-0"
            >
              <Crown className="w-3 h-3 mr-2" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
            <Link 
              href="/products" 
              className="hover:text-purple-600 transition-colors animate-fadeIn delay-100 flex-shrink-0"
            >
              Products
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
            <span className="text-gray-900 font-medium truncate animate-fadeIn delay-200 flex-shrink-0">
              Shopping Cart ({totalItems} items)
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear Cart
                  </button>
                </div>
              </div>
              
              {cart.map((item, index) => {
                // Use slug as fallback if _id is not available
                const productId = item.product._id || item.product.slug || `item-${index}`;
                
                return (
                  <div 
                    key={productId}
                    className={`flex items-start gap-4 p-6 ${index !== cart.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    {/* Product Image */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-gray-400 absolute inset-0 m-auto" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <Link 
                        href={`/products/${item.product.slug || item.product._id}`}
                        className="block"
                      >
                        <h3 className="font-semibold text-gray-900 hover:text-purple-600 transition-colors mb-1">
                          {item.product.name}
                        </h3>
                      </Link>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product.category?.name}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        {item.product.stock > 0 ? (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            ✓ In Stock
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                            ✗ Out of Stock
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(productId, Math.max(1, item.quantity - 1))}
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 min-w-[40px] text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(productId, item.quantity + 1)}
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Unit Price */}
                          <div>
                            <span className="text-lg font-bold text-gray-900">
                              ₹{(item.product.price * item.quantity).toLocaleString()}
                            </span>
                            <p className="text-xs text-gray-500">
                              ₹{item.product.price.toLocaleString()} each
                            </p>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
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
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{(totalPrice * 1.18).toFixed(2)}
                      </span>
                      <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg mb-4"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <Package className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>

              <Link
                href="/products"
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Continue Shopping
              </Link>

              {/* Security & Benefits */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <span>Free shipping on orders over ₹499</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <span>Secure payment & SSL encryption</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <span>30-day return policy</span>
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