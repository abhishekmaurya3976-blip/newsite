// app/components/shared/CustomerReviewsSlider.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Star, 
  Quote, 
  User, 
  Calendar, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Sparkles,
  Crown,
  Award,
  ThumbsUp,
  Package,
  ArrowRight,
  Heart
} from 'lucide-react';
import { ratingApi } from '../../lib/api/ratings';
import { productApi } from '../../lib/api/products';

interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  helpfulCount: number;
  verifiedPurchase: boolean;
  createdAt: string;
  product?: {
    _id: string;
    name: string;
    images?: Array<{ url: string }>;
    slug?: string;
  };
}

interface ReviewWithProduct extends Review {
  productName: string;
  productImage?: string;
  productSlug?: string;
  productPrice?: number;
}

const ReviewCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="h-4 w-20 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

const CustomerReviewsSlider = () => {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoPlay, setAutoPlay] = useState(true);

  const fetchTopReviews = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all products first
      const productsResponse = await productApi.getProducts({ 
        limit: 50, 
        isActive: true,
        sortBy: 'popularity',
        sortOrder: 'desc'
      });

      if (!productsResponse.products || productsResponse.products.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // Filter products with _id and get reviews for each
      const validProducts = productsResponse.products.filter(
        product => product._id && typeof product._id === 'string'
      );

      const allReviews: ReviewWithProduct[] = [];

      // Fetch reviews for each product (limit to 12 products for performance)
      for (const product of validProducts.slice(0, 12)) {
        try {
          const reviewsData = await ratingApi.getProductReviews(product._id!, 1, 10);
          
          if (reviewsData?.reviews) {
            // Filter for 4 & 5 star reviews
            const topReviews = reviewsData.reviews.filter(
              (review: any) => review.rating >= 4
            );

            // Add product info to reviews
            const reviewsWithProduct = topReviews.map((review: any) => ({
              ...review,
              productName: product.name,
              productImage: product.images?.[0]?.url,
              productSlug: product.slug || product._id,
              productPrice: product.price
            }));

            allReviews.push(...reviewsWithProduct);
          }
        } catch (error) {
          console.error(`Error fetching reviews for product ${product._id}:`, error);
        }

        // Stop if we have enough reviews
        if (allReviews.length >= 30) break;
      }

      // Sort by rating (highest first) and then by helpfulCount
      allReviews.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      });

      // Take top 24 reviews
      setReviews(allReviews.slice(0, 24));
    } catch (error) {
      console.error('Error fetching top reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopReviews();
  }, [fetchTopReviews]);

  // Auto-play slider
  useEffect(() => {
    if (!autoPlay || reviews.length <= 1 || loading) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, reviews.length - getSlidesPerView() + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [reviews.length, loading, autoPlay]);

  const nextSlide = useCallback(() => {
    if (reviews.length === 0) return;
    const slidesPerView = getSlidesPerView();
    const maxIndex = Math.max(0, reviews.length - slidesPerView);
    setCurrentIndex((prev) => (prev + 1) % (maxIndex + 1));
  }, [reviews.length]);

  const prevSlide = useCallback(() => {
    if (reviews.length === 0) return;
    const slidesPerView = getSlidesPerView();
    const maxIndex = Math.max(0, reviews.length - slidesPerView);
    setCurrentIndex((prev) => (prev - 1 + (maxIndex + 1)) % (maxIndex + 1));
  }, [reviews.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Calculate slides per view based on screen width
  const getSlidesPerView = () => {
    if (typeof window === 'undefined') return 1;
    
    if (window.innerWidth >= 1280) return 4; // xl screens - 4 reviews
    if (window.innerWidth >= 1024) return 3; // lg screens - 3 reviews
    if (window.innerWidth >= 768) return 2;  // md screens - 2 reviews
    return 1;  // sm screens - 1 review
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStarClass = (rating: number, starIndex: number) => {
    if (starIndex < Math.floor(rating)) return 'text-yellow-500 fill-yellow-500';
    if (starIndex === Math.floor(rating) && rating % 1 !== 0) return 'text-yellow-500 fill-yellow-500 opacity-50';
    return 'text-gray-300';
  };

  if (loading) {
    return (
      <div className="py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-yellow-600" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">No Reviews Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Be the first to share your experience! Your review will help other customers.
          </p>
        </div>
      </div>
    );
  }

  const slidesPerView = getSlidesPerView();
  const maxIndex = Math.max(0, reviews.length - slidesPerView);
  const current = Math.min(currentIndex, maxIndex);

  return (
    <div className="relative py-8 md:py-12 bg-gradient-to-b from-white via-gray-50/50 to-white">
      {/* Slider Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Buttons */}
        <div className="hidden lg:block">
          <button
            onClick={prevSlide}
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full p-3 hover:bg-white transition-all duration-300 z-20 group shadow-xl hover:shadow-2xl"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full p-3 hover:bg-white transition-all duration-300 z-20 group shadow-xl hover:shadow-2xl"
            aria-label="Next reviews"
          >
            <ChevronRight className="w-5 h-5 text-gray-800 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Reviews Slider */}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out gap-4 md:gap-6"
            style={{
              transform: `translateX(-${current * (100 / slidesPerView)}%)`,
            }}
          >
            {reviews.map((review, index) => (
              <div
                key={`${review._id}-${index}`}
                className="flex-shrink-0 transition-all duration-300"
                style={{
                  width: `${100 / slidesPerView}%`,
                  minWidth: `${100 / slidesPerView}%`,
                }}
              >
                <ReviewCard 
                  review={review} 
                  formatDate={formatDate} 
                  getStarClass={getStarClass}
                  compact={slidesPerView > 1}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Buttons */}
        <div className="lg:hidden flex justify-center space-x-4 mt-6">
          <button
            onClick={prevSlide}
            className="bg-white border border-gray-300 rounded-full p-3 hover:bg-gray-50 transition-all duration-300 shadow-lg"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="bg-white border border-gray-300 rounded-full p-3 hover:bg-gray-50 transition-all duration-300 shadow-lg"
            aria-label="Next review"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        {/* Dots Indicator */}
        {maxIndex > 0 && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  current === index
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 scale-125 shadow-lg'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Auto-play toggle */}
        <div className="flex items-center justify-center mt-4 space-x-2">
          <div className="w-8 h-4 bg-gray-200 rounded-full relative">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`absolute top-0 w-4 h-4 rounded-full transition-all duration-300 ${
                autoPlay
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 right-0'
                  : 'bg-gray-400 left-0'
              }`}
              aria-label={autoPlay ? "Pause auto-play" : "Start auto-play"}
            />
          </div>
          <span className="text-xs text-gray-600">
            {autoPlay ? 'Auto-play ON' : 'Auto-play OFF'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ 
  review, 
  formatDate, 
  getStarClass,
  compact = false 
}: { 
  review: ReviewWithProduct; 
  formatDate: (date: string) => string;
  getStarClass: (rating: number, starIndex: number) => string;
  compact?: boolean;
}) => {
  const isFiveStar = review.rating === 5;
  
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-lg hover:shadow-xl transition-all duration-300 h-full ${
      isFiveStar ? 'border-yellow-200 hover:border-yellow-300' : 'border-blue-200 hover:border-blue-300'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              {review.userAvatar ? (
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
              )}
            </div>
            {review.verifiedPurchase && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center border border-white shadow-sm">
                <CheckCircle className="w-2 h-2 md:w-3 md:h-3 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-gray-900 text-sm md:text-base truncate">{review.userName}</h4>
            <div className="flex items-center text-xs md:text-sm text-gray-600">
              <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        
        {/* Rating Badge */}
        <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full font-bold text-xs md:text-sm shadow-sm flex-shrink-0 ${
          isFiveStar
            ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200'
            : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-center">
            <Star className="w-3 h-3 mr-1" />
            {review.rating}/5
          </div>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center mb-3">
        <div className="flex items-center mr-2">
          {[0, 1, 2, 3, 4].map((starIndex) => (
            <Star
              key={starIndex}
              className={`w-4 h-4 md:w-5 md:h-5 ${getStarClass(review.rating, starIndex)}`}
            />
          ))}
        </div>
        {review.title && (
          <h3 className="font-bold text-gray-900 text-base truncate flex-1 min-w-0 ml-2">
            {review.title}
          </h3>
        )}
      </div>

      {/* Review Content */}
      <div className="relative mb-4">
        <Quote className="absolute -top-1 -left-1 w-6 h-6 md:w-8 md:h-8 text-gray-200 opacity-50" />
        <p className={`text-gray-700 leading-relaxed text-sm md:text-base ${compact ? 'line-clamp-3 md:line-clamp-4' : 'line-clamp-4'}`}>
          "{review.comment}"
        </p>
      </div>

      {/* Product Info */}
      {review.productName && (
        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
              {review.productImage && (
                <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={review.productImage}
                    alt={review.productName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                  {review.productName}
                </p>
                {review.productPrice && (
                  <p className="text-xs text-gray-600">
                    ₹{review.productPrice.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            {review.productSlug && (
              <Link 
                href={`/products/${review.productSlug}`}
                className="text-xs md:text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline flex items-center ml-2 flex-shrink-0"
              >
                View
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2 md:space-x-4">
          {review.verifiedPurchase && (
            <div className="flex items-center text-xs text-green-700">
              <Package className="w-3 h-3 mr-1" />
              <span className="hidden md:inline font-medium">Verified</span>
              <span className="md:hidden font-medium">✓</span>
            </div>
          )}
          {review.helpfulCount > 0 && (
            <div className="flex items-center text-xs text-gray-600">
              <ThumbsUp className="w-3 h-3 mr-1" />
              <span>{review.helpfulCount}</span>
            </div>
          )}
        </div>
        
        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex items-center">
            <div className="flex -space-x-1 md:-space-x-2">
              {review.images.slice(0, 2).map((image, index) => (
                <div key={index} className="relative w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                  <Image
                    src={image}
                    alt={`Review image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              ))}
              {review.images.length > 2 && (
                <div className="relative w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    +{review.images.length - 2}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerReviewsSlider;