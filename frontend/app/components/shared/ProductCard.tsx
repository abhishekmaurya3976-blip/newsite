// app/components/products/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Heart, ShoppingBag, Sparkles, Award, Check, MessageCircle } from 'lucide-react';
import { Product } from '../../../types/product';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../components/contexts/AuthContext';
import RatingStars from './RatingStars';
import { ratingApi } from '../../lib/api/ratings'; // fetch fallback when product.rating is missing

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [ratingState, setRatingState] = useState<number>(product?.rating?.average ?? 0);
  const [reviewCountState, setReviewCountState] = useState<number>(product?.rating?.count ?? 0);
  const cardRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user, loginRequired } = useAuth();

  // Helper to coerce compareAtPrice safely to a finite number (or null)
  const parseCompareAt = (val: any): number | null => {
    if (val === undefined || val === null) return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  };

  const compareAt = parseCompareAt(product.compareAtPrice);

  // Only show discount if compareAt exists, > 0 and greater than price
  const hasValidDiscount =
    compareAt !== null && compareAt > 0 && compareAt > (product.price ?? 0);

  const discountPercent = hasValidDiscount
    ? Math.round(((compareAt! - (product.price ?? 0)) / compareAt!) * 100)
    : null;

  // Sync wishlist state
  useEffect(() => {
    if (product._id && user) {
      setIsWishlisted(isInWishlist(product._id));
    } else {
      setIsWishlisted(false);
    }
  }, [product._id, isInWishlist, user]);

  // If product.rating exists use it; otherwise fetch rating summary once (safe)
  useEffect(() => {
    let mounted = true;

    const applyFromProduct = () => {
      if (product?.rating) {
        const avg = Number(product.rating.average ?? 0) || 0;
        const cnt = Number(product.rating.count ?? 0) || 0;
        if (mounted) {
          setRatingState(avg);
          setReviewCountState(cnt);
        }
      }
    };

    applyFromProduct();

    // If there's no rating info available, fetch it
    const needFetch =
      (product?.rating?.average === undefined || product?.rating?.count === undefined) &&
      (product._id || (product as any).id);

    if (needFetch) {
      const productId = product._id || (product as any).id;
      if (productId) {
        ratingApi.getProductRating(productId).then((res) => {
          if (!mounted) return;
          if (res && typeof res === 'object') {
            const avg = Number(res.average ?? 0) || 0;
            const cnt = Number(res.count ?? 0) || 0;
            setRatingState(avg);
            setReviewCountState(cnt);
          }
        }).catch((err) => {
          // silently fail - keep rating at 0
          console.error('ProductCard: failed to fetch rating', err);
        });
      }
    }

    return () => {
      mounted = false;
    };
  }, [product]);

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  // Safe function to get product slug
  const getProductSlug = (): string => {
    if (!product) return '#';

    const slug = product.slug;
    if (typeof slug === 'string' && slug.trim() !== '') {
      return slug;
    }

    const productId = (product as any)._id || (product as any).id;
    if (typeof productId === 'string' && productId.trim() !== '') {
      return productId;
    }

    return '#';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // don't trigger when clicking buttons/links inside the card
    if (target.closest('button') || target.closest('a[href]')) {
      return;
    }

    setIsClicked(true);

    const card = cardRef.current;
    if (card) {
      const ripple = document.createElement('span');
      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(147, 51, 234, 0.3);
        transform: scale(0);
        animation: ripple 600ms linear;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 1;
      `;

      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }

    const productSlug = getProductSlug();
    if (productSlug !== '#') {
      window.location.href = `/products/${productSlug}`;
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      loginRequired();
      return;
    }

    addToCart(product, 1);
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      loginRequired();
      return;
    }

    if (!product._id) return;

    if (isWishlisted) {
      removeFromWishlist(product._id);
      setIsWishlisted(false);
    } else {
      addToWishlist(product);
      setIsWishlisted(true);
    }
  };

  const productSlug = getProductSlug();

  const formatPrice = (n?: number | null) =>
    n === undefined || n === null ? '' : `₹${n.toLocaleString()}`;

  // use ratingState & reviewCountState in render
  const rating = ratingState ?? 0;
  const reviewCount = reviewCountState ?? 0;

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
        isClicked ? 'scale-95 shadow-xl' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Image Container with Fixed Aspect Ratio */}
      <div className="relative w-full pt-[100%] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {primaryImage ? (
          <>
            {/* Skeleton */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                imageLoaded ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
            </div>

            {/* Actual Image */}
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              quality={75}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
          </div>
        )}

        {/* Badges - Conditionally show discount badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {/* Only show discount badge if there's a valid discount */}
          {hasValidDiscount && discountPercent && discountPercent > 0 && (
            <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] md:text-xs font-bold rounded-lg shadow-lg">
              {discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] md:text-xs font-bold rounded-lg shadow-lg flex items-center">
              <Award className="w-2 h-2 md:w-3 md:h-3 mr-1" />
              <span className="hidden xs:inline">Best Seller</span>
              <span className="xs:hidden">Best</span>
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] md:text-xs font-bold rounded-lg shadow-lg flex items-center">
              <Sparkles className="w-2 h-2 md:w-3 md:h-3 mr-1" />
              <span className="hidden xs:inline">Featured</span>
              <span className="xs:hidden">Feat.</span>
            </span>
          )}
          {rating >= 4.5 && reviewCount >= 10 && (
            <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] md:text-xs font-bold rounded-lg shadow-lg flex items-center">
              <div className="w-2 h-2 md:w-3 md:h-3 mr-1 flex items-center justify-center">
                <span className="text-[8px] md:text-[10px] font-bold">★</span>
              </div>
              <span className="hidden xs:inline">Top Rated</span>
              <span className="xs:hidden">Top</span>
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 p-1.5 md:p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 z-10 hover:scale-110 active:scale-95"
        >
          <Heart
            className={`w-3 h-3 md:w-4 md:h-4 transition-all duration-300 ${
              isWishlisted ? 'text-rose-500 fill-rose-500 scale-110' : 'text-gray-600 hover:text-rose-400'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        {/* Category */}
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors line-clamp-1"
          >
            {product.category.name}
          </Link>
        )}

        {/* Title */}
        {productSlug !== '#' ? (
          <Link href={`/products/${productSlug}`}>
            <h3 className="font-semibold text-gray-900 mt-1 hover:text-purple-600 transition-colors line-clamp-2 text-sm md:text-base min-h-[40px] cursor-pointer">
              {product.name}
            </h3>
          </Link>
        ) : (
          <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 text-sm md:text-base min-h-[40px]">
            {product.name}
          </h3>
        )}

        {/* Rating - Use local ratingState */}
        <div className="flex items-center mt-2">
          {rating > 0 ? (
            <>
              <div className="flex items-center">
                <RatingStars rating={rating} size="md" />
                <span className="ml-2 text-xs md:text-sm font-medium text-gray-700">
                  {rating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center ml-2">
                {reviewCount > 0 ? (
                  <>
                    <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-600">
                      ({reviewCount})
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500 ml-2">No reviews</span>
                )}
              </div>
            </>
          ) : (
            <span className="text-xs text-gray-500">No ratings yet</span>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-2 md:mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-sm md:text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {/* Only show compare price if there's a valid discount */}
            {hasValidDiscount && (
              <span className="text-xs md:text-sm text-gray-500 line-through hidden sm:block">
                {formatPrice(compareAt)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`px-2 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs md:text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
              isAdded ? 'bg-green-500 hover:bg-green-600' : ''
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3 md:w-4 md:h-4 mr-1 animate-bounce" />
                Added!
              </>
            ) : product.stock === 0 ? (
              'Out of Stock'
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>

        {/* Stock Status */}
        <div className="mt-2">
          {product.stock > 10 ? (
            <span className="text-xs text-green-600">✓ In Stock</span>
          ) : product.stock > 0 ? (
            <span className="text-xs text-yellow-600">⚠ Only {product.stock} left</span>
          ) : (
            <span className="text-xs text-red-600">✗ Out of Stock</span>
          )}
        </div>
      </div>

      {/* Click Animation Overlay */}
      {isClicked && <div className="absolute inset-0 bg-purple-500/10 rounded-xl"></div>}

      {/* CSS for ripple animation */}
      <style jsx global>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
