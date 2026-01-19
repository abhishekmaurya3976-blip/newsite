// app/contexts/RatingContext.tsx - UPDATED WITH FIXED ENDPOINTS
'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '../components/contexts/AuthContext';

interface RatingData {
  average: number;
  count: number;
  breakdown?: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

interface ReviewData {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SubmitReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

interface PaginatedReviews {
  reviews: ReviewData[];
  total: number;
  page: number;
  pages: number;
}

interface RatingContextType {
  productRating: RatingData | null;
  productReviews: ReviewData[];
  totalReviews: number;
  reviewsLoading: boolean;
  
  // Updated: Now accepts productId instead of slug
  fetchProductRating: (productId: string) => Promise<void>;
  fetchProductReviews: (productId: string, page?: number, limit?: number) => Promise<void>;
  submitReview: (data: SubmitReviewData) => Promise<boolean>;
  updateReview: (reviewId: string, data: Partial<SubmitReviewData>) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  markReviewHelpful: (reviewId: string) => Promise<boolean>;
  canReviewProduct: (productId: string) => Promise<boolean>;
  
  showReviewModal: boolean;
  setShowReviewModal: (show: boolean) => void;
  editingReview: ReviewData | null;
  setEditingReview: (review: ReviewData | null) => void;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

export const useRating = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
};

interface RatingProviderProps {
  children: ReactNode;
}

export const RatingProvider: React.FC<RatingProviderProps> = ({ children }) => {
  const [productRating, setProductRating] = useState<RatingData | null>(null);
  const [productReviews, setProductReviews] = useState<ReviewData[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewData | null>(null);
  
  const { user } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const getAuthHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }, []);

  // Fixed: Use productId (not slug) in API calls
  const fetchProductRating = useCallback(async (productId: string) => {
    if (!productId) return;
    
    try {
      console.log('Fetching rating for product ID:', productId);
      const response = await fetch(`${API_URL}/reviews/products/${productId}/rating`);
      
      if (!response.ok) {
        // If 404 or 400, product might not have ratings yet
        if (response.status === 404 || response.status === 400) {
          console.log('No ratings found, setting default');
          setProductRating({
            average: 0,
            count: 0,
            breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          });
          return;
        }
        const errorText = await response.text();
        console.error('Rating fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch rating: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Rating fetch result:', result);
      
      if (result.success) {
        setProductRating(result.data);
      } else {
        console.log('Setting default rating (no success)');
        setProductRating({
          average: 0,
          count: 0,
          breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
      }
    } catch (error) {
      console.error('Failed to fetch product rating:', error);
      setProductRating({
        average: 0,
        count: 0,
        breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }
  }, [API_URL]);

  // Fixed: Use productId (not slug) in API calls
  const fetchProductReviews = useCallback(async (productId: string, page: number = 1, limit: number = 10) => {
    if (!productId) return;
    
    try {
      setReviewsLoading(true);
      console.log('Fetching reviews for product ID:', productId);
      const response = await fetch(
        `${API_URL}/reviews/products/${productId}/reviews?page=${page}&limit=${limit}`
      );
      
      if (!response.ok) {
        // If 404 or 400, product might not have reviews yet
        if (response.status === 404 || response.status === 400) {
          console.log('No reviews found, setting empty');
          setProductReviews([]);
          setTotalReviews(0);
          return;
        }
        const errorText = await response.text();
        console.error('Reviews fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Reviews fetch result:', result);
      
      if (result.success) {
        setProductReviews(result.data.reviews || []);
        setTotalReviews(result.data.total || 0);
      } else {
        console.log('Setting empty reviews (no success)');
        setProductReviews([]);
        setTotalReviews(0);
      }
    } catch (error) {
      console.error('Failed to fetch product reviews:', error);
      setProductReviews([]);
      setTotalReviews(0);
    } finally {
      setReviewsLoading(false);
    }
  }, [API_URL]);

  const submitReview = useCallback(async (data: SubmitReviewData): Promise<boolean> => {
    try {
      console.log('Submitting review:', data);
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error('Please login to submit a review');
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Invalid review data');
        }
        throw new Error(`Failed to submit review: ${response.status}`);
      }

      const result = await response.json();
      console.log('Review submit result:', result);
      return result?.success === true;
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    }
  }, [API_URL, getAuthHeaders]);

  const updateReview = useCallback(async (reviewId: string, data: Partial<SubmitReviewData>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to update review');
        }
        throw new Error(`Failed to update review: ${response.status}`);
      }

      const result = await response.json();
      return result?.success === true;
    } catch (error) {
      console.error('Failed to update review:', error);
      throw error;
    }
  }, [API_URL, getAuthHeaders]);

  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to delete review');
        }
        throw new Error(`Failed to delete review: ${response.status}`);
      }

      const result = await response.json();
      return result?.success === true;
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw error;
    }
  }, [API_URL, getAuthHeaders]);

  const markReviewHelpful = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to mark review as helpful');
        }
        throw new Error(`Failed to mark review as helpful: ${response.status}`);
      }

      const result = await response.json();
      return result?.success === true;
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
      throw error;
    }
  }, [API_URL, getAuthHeaders]);

  // Fixed: Use productId (not slug) in API calls
  const canReviewProduct = useCallback(async (productId: string): Promise<boolean> => {
    try {
      console.log('Checking review eligibility for product ID:', productId);
      const response = await fetch(`${API_URL}/reviews/can-review/${productId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to check review eligibility');
        } else if (response.status === 400 || response.status === 404) {
          console.log('Cannot review - 400/404 error');
          return false;
        }
        return false;
      }

      const result = await response.json();
      console.log('Can review result:', result);
      return result.data?.canReview || false;
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
      return false;
    }
  }, [API_URL, getAuthHeaders]);

  return (
    <RatingContext.Provider
      value={{
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
        setEditingReview,
      }}
    >
      {children}
    </RatingContext.Provider>
  );
};