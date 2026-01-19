// app/products/[slug]/reviews/page.tsx - FIXED TYPE ERRORS
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Star, 
  MessageCircle, 
  Filter, 
  ThumbsUp, 
  Check, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Shield,
  Package,
  ChevronRight,
  Crown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Calendar,
  Award,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../components/contexts/AuthContext';
import { useRating } from '../../../contexts/RatingsContext';
import RatingStars from '../../../components/shared/RatingStars';
import ReviewModal from '../../../components/shared/ReviewModal';

// Define types for rating breakdown
type RatingBreakdownKey = 1 | 2 | 3 | 4 | 5;
type RatingBreakdown = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export default function ProductReviewsPage() {
  const params = useParams();
  const { slug } = params;
  const { user, loginRequired } = useAuth();
  const {
    productRating,
    productReviews,
    totalReviews,
    reviewsLoading,
    fetchProductRating,
    fetchProductReviews,
    submitReview,
    updateReview,
    deleteReview,
    markReviewHelpful,
    canReviewProduct,
    showReviewModal,
    setShowReviewModal,
    editingReview,
    setEditingReview
  } = useRating();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('recent');
  const [ratingFilter, setRatingFilter] = useState<RatingBreakdownKey | 0>(0);
  const [canReview, setCanReview] = useState(false);
  const [checkingReviewEligibility, setCheckingReviewEligibility] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  // Fetch ratings when product is loaded
  useEffect(() => {
    if (product?._id) {
      console.log('Product loaded with ID:', product._id);
      fetchProductRating(product._id);
      fetchProductReviews(product._id, page);
    }
  }, [product?._id, page, filter]);

  useEffect(() => {
    if (product?._id && user) {
      checkReviewEligibility();
    }
  }, [product?._id, user]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading product with identifier:', slug);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      let productData = null;
      let errorMessage = '';
      
      // Try multiple endpoints in sequence
      const endpoints = [
        { url: `${baseUrl}/products/slug/${slug}`, method: 'slug' },
        { url: `${baseUrl}/products/${slug}`, method: 'id' },
        { url: `${baseUrl}/products?slug=${slug}`, method: 'query' },
        { url: `${baseUrl}/products/search?q=${encodeURIComponent(slug as string)}&limit=1`, method: 'search' }
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint.method}`);
          const response = await fetch(endpoint.url, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Response from ${endpoint.method}:`, data);
            
            if (data.success) {
              if (Array.isArray(data.data)) {
                if (data.data.length > 0) {
                  productData = data.data[0];
                  break;
                }
              } else if (data.data) {
                productData = data.data;
                break;
              }
            } else {
              errorMessage = data.message || `Failed to fetch via ${endpoint.method}`;
            }
          } else {
            errorMessage = `HTTP ${response.status}: ${response.statusText} for ${endpoint.method}`;
          }
        } catch (err) {
          console.log(`Error with ${endpoint.method}:`, err);
          errorMessage = `Network error for ${endpoint.method}`;
        }
      }
      
      if (productData) {
        console.log('Product found:', productData);
        setProduct(productData);
      } else {
        console.error('Product not found. Error:', errorMessage);
        setError(`Product not found. ${errorMessage}`);
        setProduct(null);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Failed to load product. Please try again.');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    if (!user || !product?._id) return;
    
    try {
      setCheckingReviewEligibility(true);
      const eligible = await canReviewProduct(product._id);
      setCanReview(eligible);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setCanReview(false);
    } finally {
      setCheckingReviewEligibility(false);
    }
  };

  const handleWriteReview = () => {
    if (!user) {
      loginRequired();
      return;
    }
    
    if (!canReview) {
      alert('You can only review products you have purchased. Please purchase this product first to leave a review.');
      return;
    }
    
    setEditingReview(null);
    setShowReviewModal(true);
  };

  const handleEditReview = (review: any) => {
    if (!user) {
      loginRequired();
      return;
    }
    
    setEditingReview(review);
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    
    try {
      await deleteReview(reviewId);
      alert('Review deleted successfully');
      if (product?._id) {
        fetchProductRating(product._id);
        fetchProductReviews(product._id, page);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!user) {
      loginRequired();
      return;
    }
    
    try {
      await markReviewHelpful(reviewId);
      // Show a success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fadeIn';
      toast.textContent = 'Marked as helpful!';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 3000);
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      alert('Failed to mark review as helpful. You may have already marked this review.');
    }
  };

  const getRatingPercentage = (star: RatingBreakdownKey) => {
    if (!productRating?.breakdown || !productRating?.count) return 0;
    const breakdown = productRating.breakdown as RatingBreakdown;
    const count = breakdown[star] || 0;
    return Math.round((count / productRating.count) * 100);
  };

  const getFilterIcon = () => {
    switch (filter) {
      case 'recent':
        return <Clock className="w-4 h-4" />;
      case 'helpful':
        return <ThumbsUp className="w-4 h-4" />;
      case 'highest':
        return <TrendingUp className="w-4 h-4" />;
      case 'lowest':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Filter className="w-4 h-4" />;
    }
  };

  const filteredReviews = () => {
    let reviews = [...productReviews];
    
    // Filter by rating
    if (ratingFilter > 0) {
      reviews = reviews.filter(review => review.rating === ratingFilter);
    }
    
    // Sort by filter
    switch (filter) {
      case 'recent':
        reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'helpful':
        reviews.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
      case 'highest':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        reviews.sort((a, b) => a.rating - b.rating);
        break;
    }
    
    return reviews;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Helper function to get count from rating breakdown
  const getBreakdownCount = (star: RatingBreakdownKey): number => {
    if (!productRating?.breakdown) return 0;
    const breakdown = productRating.breakdown as RatingBreakdown;
    return breakdown[star] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Product Reviews</h2>
          <p className="text-gray-600">Please wait while we fetch the product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {error || "The product you're looking for doesn't exist or may have been removed."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Browse Products
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-300 font-medium"
              >
                <Crown className="w-5 h-5 mr-2" />
                Go to Homepage
              </Link>
            </div>
            
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Looking for something specific?</h3>
              <p className="text-gray-600 mb-4">Try searching for products in our catalog:</p>
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="absolute left-4 top-3.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full translate-x-1/3 translate-y-1/3 opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <nav className="flex items-center text-sm text-gray-600 mb-3">
                <Link href="/" className="hover:text-purple-600 transition-colors flex items-center group">
                  <Crown className="w-3 h-3 mr-2 group-hover:scale-110 transition-transform" />
                  Home
                </Link>
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                <Link href="/products" className="hover:text-purple-600 transition-colors group">
                  <span className="group-hover:underline">Products</span>
                </Link>
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                <Link 
                  href={`/products/${product.slug || product._id}`}
                  className="hover:text-purple-600 transition-colors truncate max-w-[200px] group"
                >
                  <span className="group-hover:underline">{product.name}</span>
                </Link>
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                <span className="text-gray-900 font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Reviews
                </span>
              </nav>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 shadow-lg border-2 border-white">
                  {product.images?.[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-500"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {/* Product badge */}
                  {product.isFeatured && (
                    <div className="absolute -top-2 -right-2">
                      <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center">
                        <Zap className="w-2 h-2 mr-1" />
                        Featured
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                    {product.name}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 ml-2">
                      Reviews
                    </span>
                  </h1>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      <RatingStars rating={productRating?.average || 0} size="md" />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {productRating?.average?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <div className="flex items-center ml-4">
                      <MessageCircle className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {productRating?.count || 0} review{productRating?.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {product.isBestSeller && (
                      <div className="ml-4 flex items-center">
                        <Award className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-yellow-700 font-medium">Best Seller</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2 max-w-2xl">
                    Read honest reviews from customers who purchased this product.
                    {(productRating?.count || 0) > 0 && ' Help others by sharing your experience!'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleWriteReview}
                disabled={!canReview || checkingReviewEligibility}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {checkingReviewEligibility ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Checking...
                  </>
                ) : canReview ? (
                  <>
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                    Write a Review
                  </>
                ) : (
                  <>
                    <Edit className="w-5 h-5 mr-2" />
                    Write Review
                  </>
                )}
              </button>
              
              <Link
                href={`/products/${product.slug || product._id}`}
                className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-300 font-medium flex items-center justify-center whitespace-nowrap group"
              >
                <ExternalLink className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                View Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Rating Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
              {/* Overall Rating */}
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {productRating?.average?.toFixed(1) || '0.0'}
                </div>
                <div className="flex justify-center mb-3">
                  <RatingStars rating={productRating?.average || 0} size="lg" />
                </div>
                <p className="text-gray-600">
                  Based on <span className="font-semibold text-gray-900">{productRating?.count || 0}</span> review{(productRating?.count || 0) !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-3 mb-8">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
                  Rating Distribution
                </h3>
                {([5, 4, 3, 2, 1] as RatingBreakdownKey[]).map((star) => {
                  const percentage = getRatingPercentage(star);
                  const isActive = ratingFilter === star;
                  const count = getBreakdownCount(star);
                  
                  return (
                    <button
                      key={star}
                      onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                      className={`flex items-center w-full p-2 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 shadow-sm' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center w-16">
                        <span className={`mr-2 font-medium ${isActive ? 'text-purple-700' : 'text-gray-600'}`}>
                          {star}
                        </span>
                        <Star className={`w-4 h-4 ${isActive ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden ml-3">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isActive ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className={`ml-3 text-sm font-medium w-10 ${isActive ? 'text-purple-700' : 'text-gray-600'}`}>
                        {percentage}%
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Review Stats */}
              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                  Review Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{productRating?.count || 0}</div>
                      <div className="text-xs text-gray-600">Total Reviews</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {getBreakdownCount(5)}
                      </div>
                      <div className="text-xs text-gray-600">5-Star Reviews</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Guidelines */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  Review Guidelines
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span>Share your honest experience with the product</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <Package className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>Verified purchases are marked with a badge</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <ThumbsUp className="w-3 h-3 text-purple-600" />
                    </div>
                    <span>Helpful reviews get more visibility</span>
                  </li>
                </ul>
              </div>

              {/* Clear Filter Button */}
              {ratingFilter > 0 && (
                <button
                  onClick={() => setRatingFilter(0)}
                  className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-100 transition-all duration-300 font-medium border border-gray-300 hover:border-gray-400"
                >
                  Clear Rating Filter
                </button>
              )}
            </div>
          </div>

          {/* Right Content - Reviews List */}
          <div className="lg:col-span-3">
            {/* Stats & Filters Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-purple-600" />
                    Customer Reviews
                    <span className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium">
                      {totalReviews}
                    </span>
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Read what other customers are saying about this product
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                  <div className="relative">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-l-lg border border-r-0 border-gray-300">
                        {getFilterIcon()}
                      </div>
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-r-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading reviews...</p>
              </div>
            ) : productReviews.length > 0 ? (
              <div className="space-y-6">
                {filteredReviews().map((review) => (
                  <div key={review._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center mr-3">
                            <RatingStars rating={review.rating} />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              {review.rating.toFixed(1)}/5
                            </span>
                          </div>
                          {review.verifiedPurchase && (
                            <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                              <Package className="w-3 h-3 mr-1" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        
                        {review.title && (
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {review.title}
                          </h3>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="flex items-center">
                            {review.userAvatar ? (
                              <img
                                src={review.userAvatar}
                                alt={review.userName}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mr-2">
                                <Users className="w-3 h-3 text-purple-600" />
                              </div>
                            )}
                            <span className="font-medium">{review.userName || 'Anonymous'}</span>
                          </div>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                            <span>{formatDate(review.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Use user?.id instead of user?._id */}
                      {user && review.userId === user.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit Review"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4 whitespace-pre-line">
                      {review.comment}
                    </p>
                    
                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        {review.images.map((image, index) => (
                          <div key={index} className="relative h-32 rounded-lg overflow-hidden group cursor-pointer">
                            <img
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Helpful Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleMarkHelpful(review._id)}
                        className="flex items-center text-gray-600 hover:text-purple-600 transition-colors group"
                        disabled={!user}
                      >
                        <div className="p-1 rounded-lg group-hover:bg-purple-50 transition-colors">
                          <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-sm ml-2">
                          Helpful ({review.helpfulCount || 0})
                        </span>
                      </button>
                      
                      {/* Use user?.id instead of user?._id */}
                      {review.userId !== user?.id && (
                        <button
                          onClick={() => {
                            // Report review functionality
                            if (window.confirm('Report this review as inappropriate?')) {
                              alert('Thank you for your feedback. Our team will review this report.');
                            }
                          }}
                          className="text-sm text-gray-400 hover:text-red-600 transition-colors flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Report
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {totalReviews > 10 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      
                      <span className="px-4 py-2 text-gray-700">
                        Page {page} of {Math.ceil(totalReviews / 10)}
                      </span>
                      
                      <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={page >= Math.ceil(totalReviews / 10)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Reviews Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Be the first to share your thoughts about this product! Your review will help other customers make informed decisions.
                </p>
                <button
                  onClick={handleWriteReview}
                  disabled={!canReview || checkingReviewEligibility}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canReview ? 'Write the First Review' : 'Purchase to Review'}
                </button>
                {!canReview && user && (
                  <p className="text-sm text-gray-500 mt-4">
                    You need to purchase this product first to leave a review.
                  </p>
                )}
              </div>
            )}
            
            {/* No Reviews Message for Filter */}
            {filteredReviews().length === 0 && productReviews.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-amber-800 mb-3">No reviews match your filter</h3>
                <p className="text-amber-700 mb-6 max-w-md mx-auto">
                  Try changing your rating filter or sorting option to see more reviews.
                </p>
                <button
                  onClick={() => {
                    setRatingFilter(0);
                    setFilter('recent');
                  }}
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && product && (
        <ReviewModal
          productId={product._id}
          productName={product.name}
          onClose={() => {
            setShowReviewModal(false);
            setEditingReview(null);
          }}
          editingReview={editingReview}
        />
      )}

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-40"
      >
        <ArrowLeft className="w-5 h-5 rotate-90" />
      </button>
    </div>
  );
}