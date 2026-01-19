// types/rating.ts
export type RatingBreakdown = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export type ProductRating = {
  average: number;
  count: number;
  breakdown?: RatingBreakdown;
};

export type ProductReview = {
  _id?: string;
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
};

export interface SubmitReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

export interface ReviewResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface PaginatedReviews {
  reviews: ProductReview[];
  total: number;
  page: number;
  pages: number;
}