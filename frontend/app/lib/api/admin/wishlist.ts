// lib/api/admin/wishlist.ts
import { WishlistItem, WishlistStats, GetWishlistsParams } from '../../../../types/admin';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class WishlistAPI {
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

  // Normalize wishlist data from API
  private normalizeWishlist(data: any): WishlistItem {
    if (!data) {
      return {
        _id: '',
        userId: '',
        productId: '',
        createdAt: '',
        updatedAt: '',
        user: {
          _id: '',
          name: 'Unknown User',
          email: 'No email',
          role: 'user',
          phone: '',
          address: ''
        },
        product: {
          _id: '',
          name: 'Unknown Product',
          slug: '',
          description: '',
          price: 0,
          images: [],
          stock: 0,
          isActive: false,
          isFeatured: false,
          isBestSeller: false,
          tags: []
        }
      };
    }

    return {
      _id: data._id || '',
      userId: data.userId || data.user?._id || '',
      productId: data.productId || data.product?._id || '',
      createdAt: data.createdAt || '',
      updatedAt: data.updatedAt || '',
      user: data.user ? {
        _id: data.user._id || '',
        name: data.user.name || 'Unknown User',
        email: data.user.email || 'No email',
        role: data.user.role || 'user',
        phone: data.user.phone || '',
        address: data.user.address || ''
      } : {
        _id: data.userId || '',
        name: 'Unknown User',
        email: 'No email',
        role: 'user',
        phone: '',
        address: ''
      },
      product: data.product ? {
        _id: data.product._id || '',
        name: data.product.name || 'Unknown Product',
        slug: data.product.slug || '',
        description: data.product.description || '',
        price: data.product.price || 0,
        compareAtPrice: data.product.compareAtPrice || undefined,
        images: Array.isArray(data.product.images) ? data.product.images.map((img: any) => {
          if (typeof img === 'string') {
            return {
              url: img,
              altText: data.product.name || ''
            };
          }
          return {
            url: img.url || '',
            altText: img.altText || data.product.name || '',
            publicId: img.publicId,
            isPrimary: img.isPrimary,
            order: img.order
          };
        }) : [],
        category: data.product.category ? {
          _id: data.product.category._id || '',
          name: data.product.category.name || '',
          slug: data.product.category.slug || ''
        } : undefined,
        stock: data.product.stock || 0,
        isActive: data.product.isActive !== false,
        isFeatured: data.product.isFeatured || false,
        isBestSeller: data.product.isBestSeller || false,
        tags: data.product.tags || []
      } : {
        _id: data.productId || '',
        name: 'Deleted Product',
        slug: '',
        description: '',
        price: 0,
        images: [],
        stock: 0,
        isActive: false,
        isFeatured: false,
        isBestSeller: false,
        tags: []
      }
    };
  }

  // Get all wishlists
  async getWishlists(params: GetWishlistsParams = {}): Promise<{
    wishlists: WishlistItem[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.userId) queryParams.append('userId', params.userId);
      if (params.productId) queryParams.append('productId', params.productId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${this.baseUrl}/admin/wishlists${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('Fetching wishlists from:', url);
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to access this feature');
        }
        throw new Error(`Failed to fetch wishlists: ${response.status}`);
      }
      
      const result: ApiResponse<any> = await response.json();
      console.log('Wishlists API response:', result);
      
      let wishlists: WishlistItem[] = [];
      let total = 0;
      let totalPages = 1;

      if (result.success && result.data) {
        if (result.data.wishlists && Array.isArray(result.data.wishlists)) {
          wishlists = result.data.wishlists.map((w: any) => this.normalizeWishlist(w));
          total = result.data.total || wishlists.length;
          totalPages = result.data.totalPages || 1;
        }
      }

      return {
        wishlists,
        total,
        totalPages,
        page: params.page || 1,
        limit: params.limit || 20,
      };
    } catch (error) {
      console.error('WishlistAPI.getWishlists error:', error);
      return {
        wishlists: [],
        total: 0,
        totalPages: 1,
        page: 1,
        limit: 20,
      };
    }
  }

  // Get wishlist statistics
  async getStats(): Promise<WishlistStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/wishlists/stats`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to access this feature');
        }
        throw new Error(`Failed to fetch wishlist stats: ${response.status}`);
      }
      
      const result: ApiResponse<any> = await response.json();
      console.log('Stats API response:', result);
      
      if (result.success && result.data) {
        return {
          totalWishlists: result.data.totalWishlists || 0,
          totalUsers: result.data.totalUsers || 0,
          mostWishlistedProducts: result.data.mostWishlistedProducts || [],
          topUsers: result.data.topUsers || [],
          dailyWishlistCount: result.data.dailyWishlistCount || []
        };
      }
      
      return null;
    } catch (error) {
      console.error('WishlistAPI.getStats error:', error);
      return null;
    }
  }

  // Delete wishlist item
  async delete(wishlistId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/wishlists/${wishlistId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to access this feature');
        }
        throw new Error(`Failed to delete wishlist: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result?.success === true;
    } catch (error) {
      console.error(`WishlistAPI.delete error (${wishlistId}):`, error);
      return false;
    }
  }

  // Bulk delete wishlists
  async bulkDelete(wishlistIds: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/wishlists/bulk-delete`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ wishlistIds }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to access this feature');
        }
        throw new Error(`Failed to bulk delete wishlists: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result?.success === true;
    } catch (error) {
      console.error('WishlistAPI.bulkDelete error:', error);
      return false;
    }
  }

  // Export wishlist data
  async exportData(format: 'csv' | 'json' = 'csv', params?: GetWishlistsParams): Promise<Blob | null> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }
      
      queryParams.append('format', format);

      const url = `${this.baseUrl}/admin/wishlists/export${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to access this feature');
        }
        throw new Error(`Failed to export wishlist data: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('WishlistAPI.exportData error:', error);
      return null;
    }
  }
}

export const wishlistApi = new WishlistAPI();