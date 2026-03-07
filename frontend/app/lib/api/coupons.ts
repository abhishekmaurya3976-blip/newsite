// /lib/api/coupons.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidateCouponParams {
  code: string;
  subtotal: number;
  cartItems?: Array<{
    productId: string;
    quantity: number;
    product: {
      _id: string;
      category: string;
      price: number;
    };
  }>;
}

export interface CouponData {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
  applicableCategories?: string[];
  excludedCategories?: string[];
  applicableProducts?: string[];
  excludedProducts?: string[];
  forNewUsersOnly?: boolean;
  forExistingUsersOnly?: boolean;
}

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  status: string;
  redemptionRate: number;
  createdAt: string;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalDiscountGiven: number;
  mostUsedCoupons: Array<{
    _id: string;
    count: number;
    totalDiscount: number;
  }>;
}
export interface AdminCoupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  status: string;
  redemptionRate: number;
  createdAt: string;
}
class CouponAPI {
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

// Updated validate method in coupons.ts:


async validate(code: string, subtotal: number, cartItems: any[] = []): Promise<ApiResponse<any>> {
  try {
    console.log('Validating coupon:', { code, subtotal, cartItems });
    
    const response = await fetch(`${this.baseUrl}/coupons/validate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        code, 
        subtotal, 
        cartItems 
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Validation failed:', data);
      return {
        success: false,
        error: data.message || `Validation failed: ${response.status}`,
        message: data.message
      };
    }

    return data;
  } catch (error: any) {
    console.error('CouponAPI.validate error:', error);
    return {
      success: false,
      error: error.message || 'Failed to validate coupon'
    };
  }
}

  // Get all coupons (admin)
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<{ coupons: Coupon[]; total: number; totalPages: number; page: number }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);

      const url = `${this.baseUrl}/coupons/admin/coupons${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to view coupons');
        }
        throw new Error(`Failed to fetch coupons: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result;
    } catch (error: any) {
      console.error('CouponAPI.getAll error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch coupons'
      };
    }
  }

  // Get coupon by ID (admin)
  async getById(id: string): Promise<ApiResponse<{ coupon: Coupon }>> {
    try {
      const response = await fetch(`${this.baseUrl}/coupons/admin/coupons/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to view coupon');
        }
        throw new Error(`Failed to fetch coupon: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result;
    } catch (error: any) {
      console.error('CouponAPI.getById error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch coupon'
      };
    }
  }

  // Create coupon (admin)
  async create(couponData: CouponData): Promise<ApiResponse<{ coupon: Coupon }>> {
    try {
      const response = await fetch(`${this.baseUrl}/coupons/admin/coupons`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(couponData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create coupon');
      }

      const result: ApiResponse<any> = await response.json();
      return result;
    } catch (error: any) {
      console.error('CouponAPI.create error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create coupon'
      };
    }
  }

  // Update coupon (admin)
  async update(id: string, couponData: Partial<CouponData>): Promise<ApiResponse<{ coupon: Coupon }>> {
    try {
      const response = await fetch(`${this.baseUrl}/coupons/admin/coupons/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(couponData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update coupon');
      }

      const result: ApiResponse<any> = await response.json();
      return result;
    } catch (error: any) {
      console.error('CouponAPI.update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update coupon'
      };
    }
  }

  // Delete coupon (admin)
  async delete(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/coupons/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to delete coupon');
        }
        throw new Error(`Failed to delete coupon: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result;
    } catch (error: any) {
      console.error('CouponAPI.delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete coupon'
      };
    }
  }

  // Get coupon stats (admin)
  async getStats(): Promise<ApiResponse<CouponStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/coupons/admin/coupons/stats`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to view stats');
        }
        throw new Error(`Failed to fetch coupon stats: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result;
    } catch (error: any) {
      console.error('CouponAPI.getStats error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch coupon stats'
      };
    }
  }
}

export const couponApi = new CouponAPI();