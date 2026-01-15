// frontend/types/admin.ts
export interface WishlistItem {
  _id: string;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    phone?: string;
    address?: string;
  };
  product?: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    description?: string;
    images: Array<{
      url: string;
      altText?: string;
      publicId?: string;
      isPrimary?: boolean;
      order?: number;
    }>;
    category?: {
      _id: string;
      name: string;
      slug: string;
    };
    stock: number;
    isActive: boolean;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    tags?: string[];
  };
}

export interface WishlistStats {
  totalWishlists: number;
  totalUsers: number;
  mostWishlistedProducts: Array<{
    productId: string;
    productName: string;
    count: number;
    percentage: number;
  }>;
  topUsers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    wishlistCount: number;
  }>;
  dailyWishlistCount: Array<{
    date: string;
    count: number;
  }>;
}

export interface GetWishlistsParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'productName' | 'userName';
  sortOrder?: 'asc' | 'desc';
}
