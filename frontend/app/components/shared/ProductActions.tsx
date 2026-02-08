// app/components/shared/ProductActions.tsx
'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Check, Loader2 } from 'lucide-react';
import { Product } from '../../../types/product';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useRouter } from 'next/navigation';

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  // Sync wishlist state
  useEffect(() => {
    if (product._id) {
      setIsWishlisted(isInWishlist(product._id));
    }
  }, [product._id, isInWishlist]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      setIsAdded(true);
      
      // Reset animation after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Show error message to user
    }
  };

  const handleWishlist = () => {
    if (!product._id) return;
    
    if (isWishlisted) {
      removeFromWishlist(product._id);
      setIsWishlisted(false);
    } else {
      addToWishlist(product);
      setIsWishlisted(true);
    }
  };

  const handleBuyNow = async () => {
    try {
      setIsBuyNowLoading(true);
      
      // Add product to cart first
      await addToCart(product, quantity);
      
      // Wait a moment for cart state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then navigate to checkout
      router.push('/user/checkout');
      
    } catch (error) {
      console.error('Failed to process Buy Now:', error);
      // Show error message to user
    } finally {
      setIsBuyNowLoading(false);
    }
  };

  return (
    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
      {/* Quantity Selector */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600 hover:bg-gray-100 transition-colors active:bg-gray-200 text-lg"
          >
            -
          </button>
          <span className="px-3 sm:px-4 py-2 sm:py-3 text-gray-900 font-medium min-w-[48px] sm:min-w-[60px] text-center text-sm sm:text-base">
            {quantity}
          </span>
          <button 
            onClick={() => setQuantity(q => q + 1)}
            className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600 hover:bg-gray-100 transition-colors active:bg-gray-200 text-lg"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 group ${
            product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
          } ${isAdded ? 'bg-green-500 hover:bg-green-600' : ''}`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-bounce" />
              Added!
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm sm:text-base">
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </span>
            </>
          )}
        </button>

        <button
          onClick={handleWishlist}
          className="p-2.5 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors active:scale-95 group"
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform ${
            isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-gray-600'
          }`} />
        </button>
      </div>

      {/* Buy Now Button with Loading State */}
      <button 
        onClick={handleBuyNow}
        disabled={product.stock === 0 || isBuyNowLoading}
        className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 sm:py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl active:scale-95 text-sm sm:text-base ${
          (product.stock === 0 || isBuyNowLoading) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isBuyNowLoading ? (
          <>
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin inline-block" />
            Processing...
          </>
        ) : (
          'Buy Now'
        )}
      </button>
    </div>
  );
}