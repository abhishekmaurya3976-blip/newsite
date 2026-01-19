// app/lib/api/ratings.ts

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedReviews {
  reviews: any[];
  total: number;
  page: number;
  pages: number;
}

// Define SubmitReviewData interface locally or import from context
export interface SubmitReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

class RatingAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  private getAuthHeaders(): HeadersInit {
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
  }

  // Get product rating summary - UPDATED ENDPOINT
  async getProductRating(productId: string) {
    try {
      // Changed from /products/{productId}/rating to /reviews/products/{productId}/rating
      const response = await fetch(`${this.baseUrl}/reviews/products/${productId}/rating`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        // If 404, product might not have ratings yet, return default
        if (response.status === 404) {
          return {
            average: 0,
            count: 0,
            breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          };
        }
        throw new Error(`Failed to fetch rating: ${response.status}`);
      }
      
      const result: ApiResponse<any> = await response.json();
      return result.data;
    } catch (error) {
      console.error('RatingAPI.getProductRating error:', error);
      return null;
    }
  }

  // Get product reviews with pagination - UPDATED ENDPOINT
  async getProductReviews(productId: string, page: number = 1, limit: number = 10) {
    try {
      // Changed from /products/{productId}/reviews to /reviews/products/{productId}/reviews
      const response = await fetch(
        `${this.baseUrl}/reviews/products/${productId}/reviews?page=${page}&limit=${limit}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }
      
      const result: ApiResponse<PaginatedReviews> = await response.json();
      return result.data;
    } catch (error) {
      console.error('RatingAPI.getProductReviews error:', error);
      return null;
    }
  }

  // Submit a review - This endpoint is correct
  async submitReview(data: SubmitReviewData) {
    try {
      const response = await fetch(`${this.baseUrl}/reviews`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to submit a review');
        }
        throw new Error(`Failed to submit review: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result;
    } catch (error) {
      console.error('RatingAPI.submitReview error:', error);
      throw error;
    }
  }

  // Update a review - This endpoint is correct
  async updateReview(reviewId: string, data: Partial<SubmitReviewData>) {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to update review');
        }
        throw new Error(`Failed to update review: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result;
    } catch (error) {
      console.error('RatingAPI.updateReview error:', error);
      throw error;
    }
  }

  // Delete a review - This endpoint is correct
  async deleteReview(reviewId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to delete review');
        }
        throw new Error(`Failed to delete review: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result;
    } catch (error) {
      console.error('RatingAPI.deleteReview error:', error);
      throw error;
    }
  }

  // Mark review as helpful - This endpoint is correct
  async markHelpful(reviewId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to mark review as helpful');
        }
        throw new Error(`Failed to mark review as helpful: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result;
    } catch (error) {
      console.error('RatingAPI.markHelpful error:', error);
      throw error;
    }
  }

  // Check if user can review a product - This endpoint is correct
  async canReviewProduct(productId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/can-review/${productId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to check review eligibility');
        }
        throw new Error(`Failed to check review eligibility: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result.data?.canReview || false;
    } catch (error) {
      console.error('RatingAPI.canReviewProduct error:', error);
      return false;
    }
  }
}

export const ratingApi = new RatingAPI();