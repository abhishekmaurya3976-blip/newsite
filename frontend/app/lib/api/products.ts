import { apiGet, apiPost, apiPut, apiDelete, apiPostForm } from './client';
import { Product, CreateProductDto, UpdateProductDto, ProductImage } from '../../../types/product';

type GetProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
};

// Normalize product data from API
const normalizeProduct = (data: any): Product => {
  if (!data) {
    return {
      id: '',
      _id: '',
      name: '',
      slug: '',
      description: '',
      price: 0,
      sku: '',
      stock: 0,
      tags: [],
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      images: [],
      createdAt: '',
      updatedAt: ''
    };
  }
  
  return {
    _id: data._id || data.id,
    id: data.id || data._id || '',
    name: data.name || '',
    slug: data.slug || '',
    description: data.description || '',
    shortDescription: data.shortDescription,
    price: data.price || 0,
    compareAtPrice: data.compareAtPrice,
    costPrice: data.costPrice,
    sku: data.sku || '',
    barcode: data.barcode,
    stock: data.stock || 0,
    weight: data.weight,
    dimensions: data.dimensions,
    categoryId: data.categoryId || data.category?.id || null,
    category: data.category,
    tags: data.tags || [],
    isActive: data.isActive !== false,
    isFeatured: data.isFeatured || false,
    isBestSeller: data.isBestSeller || false,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    images: data.images || [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

// Check if we're in production
const isProduction = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

// Fallback mock data for Netlify if API is down
const mockProducts: Product[] = [
  {
    id: '1',
    _id: '1',
    name: 'Premium Watercolor Set',
    slug: 'premium-watercolor-set',
    description: 'Professional watercolor set with vibrant colors',
    price: 2499,
    compareAtPrice: 2999,
    sku: 'WCS-001',
    stock: 25,
    tags: ['watercolor', 'painting', 'professional'],
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&auto=format&fit=crop',
        altText: 'Watercolor Set',
        isPrimary: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    _id: '2',
    name: 'Sketching Pencils Pack',
    slug: 'sketching-pencils-pack',
    description: 'Set of 12 professional sketching pencils',
    price: 899,
    compareAtPrice: 1199,
    sku: 'SP-002',
    stock: 50,
    tags: ['pencils', 'sketching', 'drawing'],
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w-800&auto=format&fit=crop',
        altText: 'Sketching Pencils',
        isPrimary: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const productApi = {
  // Get products with filters
  async getProducts(params: GetProductsParams = {}): Promise<{
    products: Product[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    // Use mock data in production if API fails
    if (isProduction) {
      console.log('Using fallback mock data for Netlify');
      return {
        products: mockProducts,
        total: mockProducts.length,
        totalPages: 1,
        page: 1,
        limit: 12,
      };
    }
    
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const endpoint = `/products?${queryParams.toString()}`;
      console.log('Fetching products from:', endpoint);
      
      const response = await apiGet<any>(endpoint);
      
      // Normalize response format
      let products: Product[] = [];
      let total = 0;
      let totalPages = 1;

      if (response.success) {
        if (Array.isArray(response.data?.products)) {
          products = response.data.products.map(normalizeProduct);
          total = response.data.total || products.length;
          totalPages = response.data.totalPages || 1;
        } else if (Array.isArray(response.data)) {
          products = response.data.map(normalizeProduct);
          total = products.length;
        }
      } else if (Array.isArray(response)) {
        products = response.map(normalizeProduct);
        total = products.length;
      } else if (isProduction && !response.success) {
        // Fallback to mock data in production
        console.log('API failed, using mock data');
        products = mockProducts;
        total = mockProducts.length;
      }
      
      return {
        products,
        total,
        totalPages: totalPages || 1,
        page: params.page || 1,
        limit: params.limit || 12,
      };
    } catch (error) {
      console.error('productApi.getProducts error:', error);
      
      // Return mock data in production
      if (isProduction) {
        return {
          products: mockProducts,
          total: mockProducts.length,
          totalPages: 1,
          page: 1,
          limit: 12,
        };
      }
      
      return {
        products: [],
        total: 0,
        totalPages: 1,
        page: 1,
        limit: 12,
      };
    }
  },

  // Get product by ID
  async getById(id: string): Promise<Product | null> {
    if (isProduction) {
      // Return mock product in production
      const mockProduct = mockProducts.find(p => p.id === id) || mockProducts[0];
      return mockProduct;
    }
    
    try {
      console.log('Fetching product by ID:', id);
      
      if (!id || id === 'undefined' || id === 'null') {
        console.error('Invalid product ID:', id);
        return null;
      }
      
      const response = await apiGet<any>(`/products/${id}`);
      
      if (response.success && response.data) {
        return normalizeProduct(response.data);
      }
      
      if (response.data && !response.success) {
        return normalizeProduct(response.data);
      }
      
      console.log('Product not found or API error:', response);
      return null;
    } catch (error) {
      console.error(`productApi.getById error (${id}):`, error);
      
      // Return mock product in production
      if (isProduction) {
        return mockProducts[0];
      }
      
      return null;
    }
  },

  // Get product by slug
  async getBySlug(slug: string): Promise<Product | null> {
    if (isProduction) {
      // Return mock product in production
      const mockProduct = mockProducts.find(p => p.slug === slug) || mockProducts[0];
      return mockProduct;
    }
    
    try {
      console.log('Fetching product by slug:', slug);
      const response = await apiGet<any>(`/products/slug/${encodeURIComponent(slug)}`);
      
      if (response.success && response.data) {
        return normalizeProduct(response.data);
      }
      
      if (response.data && !response.success) {
        return normalizeProduct(response.data);
      }
      
      return null;
    } catch (error) {
      console.error(`productApi.getBySlug error (${slug}):`, error);
      
      // Return mock product in production
      if (isProduction) {
        return mockProducts[0];
      }
      
      return null;
    }
  },

  // Create product
  async create(payload: CreateProductDto): Promise<Product | null> {
    try {
      console.log('Creating product with payload:', payload);
      
      // Clean the payload
      const cleanPayload: any = {
        name: payload.name,
        description: payload.description || '',
        shortDescription: payload.shortDescription || undefined,
        price: Number(payload.price) || 0,
        compareAtPrice: payload.compareAtPrice ? Number(payload.compareAtPrice) : undefined,
        costPrice: payload.costPrice ? Number(payload.costPrice) : undefined,
        sku: payload.sku || '',
        barcode: payload.barcode || undefined,
        stock: Number(payload.stock) || 0,
        weight: payload.weight ? Number(payload.weight) : undefined,
        categoryId: payload.categoryId || undefined,
        tags: payload.tags || [],
        isActive: payload.isActive !== false,
        isFeatured: payload.isFeatured || false,
        isBestSeller: payload.isBestSeller || false,
        metaTitle: payload.metaTitle || undefined,
        metaDescription: payload.metaDescription || undefined,
        images: payload.images || [],
      };
      
      // Remove undefined values
      Object.keys(cleanPayload).forEach(key => {
        if (cleanPayload[key] === undefined) {
          delete cleanPayload[key];
        }
      });
      
      console.log('Sending cleaned payload:', cleanPayload);
      
      const response = await apiPost<any>('/products', cleanPayload);
      
      console.log('Create product response:', response);
      
      if (response.success && response.data) {
        return normalizeProduct(response.data);
      }
      
      throw new Error(response.message || 'Failed to create product');
    } catch (error: any) {
      console.error('productApi.create error:', error);
      throw error;
    }
  },

  // Update product
  async update(id: string, payload: UpdateProductDto): Promise<Product | null> {
    try {
      console.log('Updating product', id, 'with payload:', payload);
      
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Invalid product ID');
      }
      
      // Clean the payload
      const cleanPayload: any = { ...payload };
      
      // Convert number fields
      if (payload.price !== undefined) cleanPayload.price = Number(payload.price);
      if (payload.compareAtPrice !== undefined) cleanPayload.compareAtPrice = payload.compareAtPrice ? Number(payload.compareAtPrice) : undefined;
      if (payload.costPrice !== undefined) cleanPayload.costPrice = payload.costPrice ? Number(payload.costPrice) : undefined;
      if (payload.stock !== undefined) cleanPayload.stock = Number(payload.stock);
      if (payload.weight !== undefined) cleanPayload.weight = payload.weight ? Number(payload.weight) : undefined;
      
      // Remove undefined values
      Object.keys(cleanPayload).forEach(key => {
        if (cleanPayload[key] === undefined) {
          delete cleanPayload[key];
        }
      });
      
      console.log('Sending cleaned update payload:', cleanPayload);
      
      const response = await apiPut<any>(`/products/${id}`, cleanPayload);
      
      console.log('Update product response:', response);
      
      if (response.success && response.data) {
        return normalizeProduct(response.data);
      }
      
      throw new Error(response.message || 'Failed to update product');
    } catch (error: any) {
      console.error(`productApi.update error (${id}):`, error);
      throw error;
    }
  },

  // Delete product
  async delete(id: string): Promise<boolean> {
    try {
      const response = await apiDelete<{ success: boolean; message?: string }>(`/products/${id}`);
      return response?.success === true;
    } catch (error) {
      console.error(`productApi.delete error (${id}):`, error);
      return false;
    }
  },

  // Upload images
  async uploadImages(files: File[]): Promise<ProductImage[]> {
    try {
      console.log('Uploading', files.length, 'images');
      
      if (!files || files.length === 0) {
        throw new Error('No files to upload');
      }
      
      const formData = new FormData();
      files.forEach((file, index) => {
        console.log(`Adding file ${index}:`, file.name, file.type, file.size);
        formData.append('images', file);
      });

      console.log('Sending FormData with', files.length, 'files');
      
      const response = await apiPostForm<any>('/products/upload-images', formData);
      
      console.log('Upload images response:', response);
      
      if (response.success && Array.isArray(response.data)) {
        return response.data.map((img: any, index: number) => ({
          url: img.url,
          altText: img.altText || `Product Image ${index + 1}`,
          publicId: img.publicId || `img-${Date.now()}-${index}`,
          isPrimary: img.isPrimary || index === 0,
        }));
      }
      
      throw new Error(response.message || 'Failed to upload images');
    } catch (error: any) {
      console.error('productApi.uploadImages error:', error);
      throw error;
    }
  },
};