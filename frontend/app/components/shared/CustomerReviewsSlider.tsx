// app/components/shared/CustomerReviewsSlider.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Star, 
  Quote, 
  User, 
  Calendar, 
  CheckCircle,
  MessageCircle,
  ThumbsUp,
  Package,
  ArrowRight,
  Shield,
  Award,
  TrendingUp,
  Filter,
  Sparkles,
  Trophy,
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
}

interface Product {
  _id: string;
  name: string;
  images?: Array<{ url: string }>;
  slug?: string;
  price?: number;
  category?: string;
}

interface ReviewWithProduct extends Review {
  productName: string;
  productImage?: string;
  productSlug?: string;
  productPrice?: number;
  productCategory?: string;
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
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    verifiedCount: 0
  });

  const fetchTopReviews = useCallback(async () => {
    try {
      setLoading(true);
      
      // First, get popular products
      const productsResponse = await productApi.getProducts({ 
        limit: 30, 
        isActive: true,
        sortBy: 'popularity',
        sortOrder: 'desc'
      });

      if (!productsResponse.products || productsResponse.products.length === 0) {
        setReviews([]);
        setFilteredReviews([]);
        setLoading(false);
        return;
      }

      const allReviews: ReviewWithProduct[] = [];

      // Fetch reviews for each product
      for (const product of productsResponse.products) {
        try {
          if (!product._id) continue;
          
          const reviewsData = await ratingApi.getProductReviews(product._id, 1, 10);
          
          if (reviewsData?.reviews && Array.isArray(reviewsData.reviews)) {
            // Filter for only 4 & 5 star reviews
            const highRatedReviews = reviewsData.reviews.filter((review: any) => 
              review.rating >= 4
            );

            // Add product info to each review
            const reviewsWithProduct = highRatedReviews.map((review: any) => ({
              ...review,
              productName: product.name,
              productImage: product.images?.[0]?.url,
              productSlug: product.slug || product._id,
              productPrice: product.price,
              productCategory: product.category
            }));

            allReviews.push(...reviewsWithProduct);
          }
        } catch (error) {
          console.error(`Error fetching reviews for product ${product._id}:`, error);
        }

        // Stop if we have enough reviews
        if (allReviews.length >= 50) break;
      }

      // Sort by rating (highest first), then by date (newest first)
      allReviews.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setReviews(allReviews);
      setFilteredReviews(allReviews);

      // Calculate stats for 4 & 5 star reviews only
      const fiveStarReviews = allReviews.filter(review => review.rating === 5);
      const fourStarReviews = allReviews.filter(review => review.rating === 4);
      const totalReviews = allReviews.length;
      const averageRating = totalReviews > 0 
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;
      const verifiedCount = allReviews.filter(review => review.verifiedPurchase).length;

      setStats({
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(1)),
        fiveStarCount: fiveStarReviews.length,
        fourStarCount: fourStarReviews.length,
        verifiedCount
      });

    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setFilteredReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopReviews();
  }, [fetchTopReviews]);

  useEffect(() => {
    let filtered = [...reviews];
    
    if (selectedRating !== null) {
      filtered = filtered.filter(review => review.rating === selectedRating);
    }
    
    if (showVerifiedOnly) {
      filtered = filtered.filter(review => review.verifiedPurchase);
    }
    
    setFilteredReviews(filtered);
  }, [selectedRating, showVerifiedOnly, reviews]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">No 4 & 5 Star Reviews Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Our customers' top-rated experiences will appear here. Share your 5-star experience!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 bg-gradient-to-b from-white via-gray-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Stats */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <div className="flex items-center mb-2">
              </div>
              <p className="text-gray-600">
                Showing only 4 & 5 star reviews from satisfied customers
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-xl flex items-center shadow-lg">
                <Star className="w-5 h-5 mr-2 fill-current" />
                <span className="font-bold text-lg">{stats.averageRating}</span>
                <span className="ml-1">/5</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{stats.totalReviews}</span> top reviews
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg flex items-center justify-center mr-3">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">5 Star Reviews</p>
                  <p className="text-xl font-bold text-gray-900">{stats.fiveStarCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">4 Star Reviews</p>
                  <p className="text-xl font-bold text-gray-900">{stats.fourStarCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verified Purchases</p>
                  <p className="text-xl font-bold text-gray-900">{stats.verifiedCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-3">
                  <Heart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer Satisfaction</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.totalReviews > 0 
                      ? Math.round((stats.fiveStarCount / stats.totalReviews) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center">
              <Filter className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRating(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRating === null
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Top Reviews
              </button>
              
              {/* Only show 5 and 4 star options */}
              <button
                onClick={() => setSelectedRating(selectedRating === 5 ? null : 5)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  selectedRating === 5
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md'
                    : 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200'
                }`}
              >
                <Star className="w-3 h-3 mr-1 fill-current" />
                5 Stars ({stats.fiveStarCount})
              </button>
              
              <button
                onClick={() => setSelectedRating(selectedRating === 4 ? null : 4)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  selectedRating === 4
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Star className="w-3 h-3 mr-1 fill-current" />
                4 Stars ({stats.fourStarCount})
              </button>
              
              <button
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  showVerifiedOnly
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 hover:bg-green-100 border border-green-200'
                }`}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified Only ({stats.verifiedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews match your filters</h3>
            <p className="text-gray-600">Try adjusting your filter criteria</p>
            <button
              onClick={() => {
                setSelectedRating(null);
                setShowVerifiedOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full mr-2"></div>
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredReviews.length}</span> of{' '}
                  <span className="font-semibold text-gray-900">{reviews.length}</span> top-rated reviews
                </p>
              </div>
              {selectedRating !== null && (
                <button
                  onClick={() => setSelectedRating(null)}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Show all {selectedRating === 5 ? '5-star' : '4-star'} reviews
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReviews.map((review) => (
                <ReviewCard 
                  key={review._id} 
                  review={review} 
                  formatDate={formatDate} 
                  getStarClass={getStarClass}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ 
  review, 
  formatDate, 
  getStarClass,
}: { 
  review: ReviewWithProduct; 
  formatDate: (date: string) => string;
  getStarClass: (rating: number, starIndex: number) => string;
}) => {
  const isFiveStar = review.rating === 5;
  
  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col ${
      isFiveStar 
        ? 'border-yellow-200 hover:border-yellow-300 shadow-yellow-100' 
        : 'border-blue-200 hover:border-blue-300 shadow-blue-100'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-sm ${
              isFiveStar 
                ? 'bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-200' 
                : 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200'
            }`}>
              {review.userAvatar ? (
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className={`w-6 h-6 ${isFiveStar ? 'text-yellow-600' : 'text-blue-600'}`} />
              )}
            </div>
            {review.verifiedPurchase && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center border border-white shadow-sm">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              <h4 className="font-bold text-gray-900 truncate">{review.userName}</h4>
              {isFiveStar && (
                <div className="ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Top Reviewer
                </div>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        
        {/* Rating Badge */}
        <div className={`px-3 py-1.5 rounded-full font-bold text-sm shadow-sm flex-shrink-0 ml-2 ${
          isFiveStar
            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border border-yellow-600'
            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border border-blue-600'
        }`}>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 fill-current" />
            {review.rating}/5
          </div>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center mb-4">
        <div className="flex items-center mr-3">
          {[0, 1, 2, 3, 4].map((starIndex) => (
            <Star
              key={starIndex}
              className={`w-5 h-5 ${getStarClass(review.rating, starIndex)}`}
            />
          ))}
        </div>
        {isFiveStar && (
          <div className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
            ⭐ Excellent
          </div>
        )}
      </div>

      {/* Title */}
      {review.title && (
        <h3 className="font-bold text-gray-900 text-lg mb-3">
          {review.title}
        </h3>
      )}

      {/* Review Content */}
      <div className="relative mb-5 flex-1">
        <Quote className={`absolute -top-2 -left-2 w-8 h-8 opacity-20 ${
          isFiveStar ? 'text-yellow-400' : 'text-blue-400'
        }`} />
        <p className="text-gray-700 leading-relaxed text-base pl-4">
          "{review.comment}"
        </p>
      </div>

      {/* Product Info */}
      {review.productName && (
        <div className={`mb-4 p-3 rounded-xl border ${
          isFiveStar 
            ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {review.productImage && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
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
                <p className="text-sm font-medium text-gray-900 truncate">
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
                className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline flex items-center ml-2 flex-shrink-0"
              >
                View
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {review.verifiedPurchase && (
            <div className="flex items-center text-sm font-medium">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-2">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-green-700">Verified</span>
            </div>
          )}
          {review.helpfulCount > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span>{review.helpfulCount} helpful</span>
            </div>
          )}
        </div>
        
        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {review.images.slice(0, 2).map((image, index) => (
                <div key={index} className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100 shadow-sm">
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
                <div className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center shadow-sm">
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