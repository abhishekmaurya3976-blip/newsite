// app/components/shared/AddToCartButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Check } from 'lucide-react';
import { Product } from '../../../types/product';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

interface AddToCartButtonProps {
  product: Product;
  variant?: 'mobile' | 'desktop';
}

export default function AddToCartButton({ product, variant = 'mobile' }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Sync wishlist state
  useEffect(() => {
    if (product._id) {
      setIsWishlisted(isInWishlist(product._id));
    }
  }, [product._id, isInWishlist]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    
    // Reset animation after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
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

  const handleBuyNow = () => {
    addToCart(product, quantity);
    // Navigate to checkout page
    window.location.href = '/user/checkout';
  };

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-gray-300 rounded-lg flex-1">
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="px-3 py-2 sm:px-4 sm:py-3 text-gray-600 hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            -
          </button>
          <span className="px-3 py-2 sm:px-4 sm:py-3 text-gray-900 font-medium min-w-[40px] text-center text-sm sm:text-base">
            {quantity}
          </span>
          <button 
            onClick={() => setQuantity(q => q + 1)}
            className="px-3 py-2 sm:px-4 sm:py-3 text-gray-600 hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center shadow-lg transition-all duration-300 ${
            product.stock === 0 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:from-purple-700 hover:to-pink-700 hover:shadow-xl'
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
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </>
          )}
        </button>

        <button
          onClick={handleWishlist}
          className="p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform ${
            isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-gray-600'
          }`} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            -
          </button>
          <span className="px-4 py-3 text-gray-900 font-medium min-w-[60px] text-center">
            {quantity}
          </span>
          <button 
            onClick={() => setQuantity(q => q + 1)}
            className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium flex items-center justify-center shadow-lg hover:shadow-xl group ${
            product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
          } ${isAdded ? 'bg-green-500 hover:bg-green-600' : ''}`}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5 mr-2 animate-bounce" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </>
          )}
        </button>

        <button
          onClick={handleWishlist}
          className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform ${
            isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-gray-600'
          }`} />
        </button>
      </div>

      <button 
        onClick={handleBuyNow}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
      >
        Buy Now
      </button>
    </div>
  );
}