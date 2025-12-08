'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Save,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { categoryApi } from '../../../../lib/api/categories';
import { Category, UpdateCategoryDto } from '../../../../../types/category';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    parentId: string;
    isActive: boolean;
    imageFile?: File;
  }>({
    name: '',
    description: '',
    parentId: '',
    isActive: true,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isImageChanged, setIsImageChanged] = useState(false);

  // Load category and categories for parent selection
  useEffect(() => {
    loadData();
  }, [categoryId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoryData, categoriesData] = await Promise.all([
        categoryApi.getById(categoryId),
        categoryApi.getAll(),
      ]);

      if (!categoryData) {
        alert('Category not found');
        router.push('/admin/categories');
        return;
      }

      setCategory(categoryData);
      
      // Initialize form data
      setFormData({
        name: categoryData.name || '',
        description: categoryData.description || '',
        parentId: categoryData.parentId || '',
        isActive: categoryData.isActive !== false,
      });

      // Set categories for parent dropdown
      // Filter out current category and its descendants
      const filteredCategories = categoriesData.filter(cat => {
        // Don't include current category
        if (cat._id === categoryId) return false;
        
        // Don't include if it's a descendant of current category
        const isDescendant = (cat: Category): boolean => {
          if (!cat.parentId) return false;
          if (cat.parentId === categoryId) return true;
          
          const parent = categoriesData.find(c => c._id === cat.parentId);
          return parent ? isDescendant(parent) : false;
        };
        
        return !isDescendant(cat);
      });
      
      setCategories(filteredCategories);

      // Set image preview if category has image
      if (categoryData.image) {
        if (typeof categoryData.image === 'string') {
          setImagePreview(categoryData.image);
        } else if (categoryData.image.url) {
          setImagePreview(categoryData.image.url);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  // Handle image change
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setIsImageChanged(true);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setIsImageChanged(true);
    setImagePreview('');
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Category name must be less than 100 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Validate parentId if provided
    if (formData.parentId && formData.parentId.trim()) {
      // Check if parentId is a valid MongoDB ObjectId
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(formData.parentId)) {
        newErrors.parentId = 'Invalid parent category selection';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !category) {
      return;
    }

    setSaving(true);

    try {
      // Prepare update data
      const updateData: UpdateCategoryDto & { imageFile?: File } = {};
      
      // Only include changed fields
      if (formData.name !== category.name) updateData.name = formData.name;
      if (formData.description !== (category.description || '')) updateData.description = formData.description;
      if (formData.parentId !== (category.parentId || '')) {
        updateData.parentId = formData.parentId || null;
      }
      if (formData.isActive !== category.isActive) updateData.isActive = formData.isActive;
      
      // Handle image
      if (isImageChanged) {
        if (imageFile) {
          updateData.imageFile = imageFile;
        } else {
          // If image was removed, send null
          updateData.image = null as any;
        }
      }

      // Update category
      const updatedCategory = await categoryApi.update(categoryId, updateData);

      if (updatedCategory) {
        alert('Category updated successfully!');
        router.push('/admin/categories');
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error: any) {
      console.error('Failed to update category:', error);
      alert(error.message || 'Failed to update category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parentId: category.parentId || '',
        isActive: category.isActive !== false,
      });
      
      // Reset image
      if (category.image) {
        if (typeof category.image === 'string') {
          setImagePreview(category.image);
        } else if (category.image.url) {
          setImagePreview(category.image.url);
        }
      } else {
        setImagePreview('');
      }
      setImageFile(null);
      setIsImageChanged(false);
      
      setErrors({});
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Category not found</h2>
          <p className="text-gray-600 mb-4">The category you're trying to edit doesn't exist.</p>
          <Link
            href="/admin/categories"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/categories"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
          <p className="text-gray-600">Update category details</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            category.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {category.isActive ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={loadData}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Category Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Category Details</h2>
              
              <div className="space-y-6">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) {
                        setErrors({ ...errors, name: '' });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter category name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.name.length}/100 characters
                  </p>
                </div>

                {/* Parent Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => {
                      setFormData({ ...formData, parentId: e.target.value });
                      if (errors.parentId) {
                        setErrors({ ...errors, parentId: '' });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.parentId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">No Parent (Top-level Category)</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.parentId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.parentId}
                    </p>
                  )}
                  {category.parentId && (
                    <p className="mt-1 text-sm text-gray-500">
                      Current parent: {categories.find(c => c._id === category.parentId)?.name || 'Unknown'}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (errors.description) {
                        setErrors({ ...errors, description: '' });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={4}
                    placeholder="Describe this category..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Image & Settings */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Category Image</h2>
              
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {isImageChanged && (
                      <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        New Image
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <input
                      id="category-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="category-image" className="cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload New Image</p>
                      <p className="text-sm text-gray-500">Optional • JPG, PNG, GIF up to 5MB</p>
                    </label>
                  </div>
                )}
                
                {!imagePreview && category.image && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Current image will be kept unless you upload a new one.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>
              
              <div className="space-y-4">
                {/* Active Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Active Status</h3>
                    <p className="text-sm text-gray-500">Category will be visible on store</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors"></div>
                    <div className="absolute left-[2px] top-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform peer-checked:translate-x-full"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/admin/categories"
                    className="text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Link>
                  
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}