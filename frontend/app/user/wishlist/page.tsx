// app/user/wishlist/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  ChevronRight,
  Package,
  ShoppingBag
} from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAddToCart = (productId: string) => {
    const product = wishlist.find(item => item._id === productId);
    if (product) {
      setLoading(productId);
      addToCart(product, 1);
      
      setTimeout(() => {
        setLoading(null);
      }, 1000);
    }
  };

  const handleMoveAllToCart = () => {
    setLoading('all');
    wishlist.forEach(product => {
      addToCart(product, 1);
    });
    
    setTimeout(() => {
      setLoading(null);
      clearWishlist();
    }, 1500);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24 sm:pt-28">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center text-sm text-gray-600">
              <Link href="/" className="hover:text-rose-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <Link href="/products" className="hover:text-rose-600 transition-colors">
                Products
              </Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <span className="text-gray-900 font-medium">My Wishlist</span>
            </nav>
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-rose-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save your favorite art supplies and stationery items here.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-rose-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <Link href="/products" className="hover:text-rose-600 transition-colors">
              Products
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Wishlist ({wishlist.length})</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Wishlist</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={clearWishlist}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center text-sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </button>
            <button
              onClick={handleMoveAllToCart}
              disabled={loading === 'all'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'all' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add All to Cart
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Actions - Fixed Bottom */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={clearWishlist}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </button>
              <button
                onClick={handleMoveAllToCart}
                disabled={loading === 'all'}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'all' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Add All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-20 sm:mb-8">
          {wishlist.map((product, index) => {
            const productId = product._id || product.slug || `product-${index}`;
            const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
            const discountPercent = hasDiscount 
              ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
              : null;

            return (
              <div 
                key={productId}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="relative w-full pt-[100%] bg-gray-100">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* Discount Badge */}
                  {discountPercent && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                        {discountPercent}% OFF
                      </span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(productId)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow"
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  </button>
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-rose-600 transition-colors text-sm sm:text-base">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {hasDiscount && product.compareAtPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.compareAtPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="mb-4">
                    {product.stock > 0 ? (
                      <span className="text-xs text-green-600">In Stock</span>
                    ) : (
                      <span className="text-xs text-red-600">Out of Stock</span>
                    )}
                  </div>

                  {/* Add to Cart Button - Always Visible */}
                  <button
                    onClick={() => handleAddToCart(productId)}
                    disabled={loading === productId || product.stock === 0}
                    className="w-full py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading === productId ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Adding...
                      </>
                    ) : product.stock === 0 ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Footer Actions */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between py-6 border-t border-gray-200">
            <Link
              href="/products"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="text-gray-900 font-medium">
                {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} • Total: ₹
                {wishlist.reduce((sum, product) => sum + product.price, 0).toLocaleString()}
              </div>
              <button
                onClick={handleMoveAllToCart}
                disabled={loading === 'all'}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'all' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Adding All...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add All to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}