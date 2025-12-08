import { apiGet, apiPost, apiPut, apiDelete, apiPostForm, apiPutForm } from './client';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../../types/category';

// Normalize category data from API
const normalizeCategory = (data: any): Category => {
  if (!data) return data;
  
  return {
    _id: data._id || data.id,
    id: data.id || data._id,
    name: data.name || '',
    slug: data.slug || '',
    description: data.description,
    image: data.image,
    parentId: data.parentId || null,
    isActive: data.isActive !== false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    __v: data.__v,
  };
};

// Normalize array of categories
const normalizeCategories = (data: any[]): Category[] => {
  if (!Array.isArray(data)) return [];
  return data.map(normalizeCategory);
};

export const categoryApi = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    try {
      const response = await apiGet<{ success: boolean; data?: any[] }>('/categories');
      
      if (response.success && Array.isArray(response.data)) {
        return normalizeCategories(response.data);
      }
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return normalizeCategories(response);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },

  // Get category tree
  async getTree(): Promise<Category[]> {
    try {
      const response = await apiGet<{ success: boolean; data?: any[] }>('/categories/tree');
      
      if (response.success && Array.isArray(response.data)) {
        return normalizeCategories(response.data);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch category tree:', error);
      return [];
    }
  },

  // Get category by ID
  async getById(id: string): Promise<Category | null> {
    try {
      const response = await apiGet<{ success: boolean; data?: any }>(`/categories/${id}`);
      
      if (response.success && response.data) {
        return normalizeCategory(response.data);
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      return null;
    }
  },

  // Get category by slug
  async getBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await apiGet<{ success: boolean; data?: any }>(`/categories/slug/${slug}`);
      
      if (response.success && response.data) {
        return normalizeCategory(response.data);
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch category by slug ${slug}:`, error);
      return null;
    }
  },

  // Create category
  async create(data: CreateCategoryDto & { imageFile?: File }): Promise<Category | null> {
    try {
      let response;
      
      // If there's an image file, use FormData
      if (data.imageFile) {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.parentId) formData.append('parentId', data.parentId);
        formData.append('isActive', String(data.isActive ?? true));
        formData.append('image', data.imageFile);
        
        response = await apiPostForm<{ success: boolean; data?: any }>('/categories', formData);
      } else {
        // Otherwise use JSON
        const payload: any = {
          name: data.name,
          description: data.description || '',
          isActive: data.isActive ?? true,
        };
        
        // Only include parentId if it's a valid value
        if (data.parentId && data.parentId.trim() !== '') {
          payload.parentId = data.parentId;
        }
        
        response = await apiPost<{ success: boolean; data?: any }>('/categories', payload);
      }
      
      if (response.success && response.data) {
        return normalizeCategory(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  },

  // Update category
  async update(id: string, data: UpdateCategoryDto & { imageFile?: File }): Promise<Category | null> {
    try {
      let response;
      
      // If there's an image file, use FormData
      if (data.imageFile) {
        const formData = new FormData();
        if (data.name !== undefined) formData.append('name', data.name);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.parentId !== undefined) {
          formData.append('parentId', data.parentId === null ? '' : data.parentId);
        }
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        formData.append('image', data.imageFile);
        
        response = await apiPutForm<{ success: boolean; data?: any }>(`/categories/${id}`, formData);
      } else {
        // Otherwise use JSON
        const payload: any = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.description !== undefined) payload.description = data.description;
        if (data.parentId !== undefined) {
          payload.parentId = data.parentId === null ? '' : data.parentId;
        }
        if (data.isActive !== undefined) payload.isActive = data.isActive;
        
        response = await apiPut<{ success: boolean; data?: any }>(`/categories/${id}`, payload);
      }
      
      if (response.success && response.data) {
        return normalizeCategory(response.data);
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      throw error;
    }
  },

  // Delete category
  async delete(id: string): Promise<boolean> {
    try {
      const response = await apiDelete<{ success: boolean; message?: string }>(`/categories/${id}`);
      return response?.success === true;
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      return false;
    }
  },
};