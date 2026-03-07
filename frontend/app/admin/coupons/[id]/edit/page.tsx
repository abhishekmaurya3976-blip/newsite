'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Calendar, Percent, DollarSign, Truck } from 'lucide-react';
import { couponApi } from '../../../../lib/api/coupons';

interface FormData {
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
  perUserLimit: number;
  isActive: boolean;
}

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: null,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100,
    perUserLimit: 1,
    isActive: true
  });

  useEffect(() => {
    if (couponId) {
      fetchCoupon();
    }
  }, [couponId]);

  const fetchCoupon = async () => {
    setLoading(true);
    try {
      const response = await couponApi.getById(couponId);
      if (response.success && response.data) {
        const coupon = response.data.coupon;
        setFormData({
          code: coupon.code,
          name: coupon.name,
          description: coupon.description || '',
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderAmount: coupon.minOrderAmount || 0,
          maxDiscountAmount: coupon.maxDiscountAmount || null,
          startDate: new Date(coupon.startDate).toISOString().split('T')[0],
          endDate: new Date(coupon.endDate).toISOString().split('T')[0],
          usageLimit: coupon.usageLimit || 100,
          perUserLimit: coupon.perUserLimit || 1,
          isActive: coupon.isActive !== undefined ? coupon.isActive : true
        });
      } else {
        alert('Coupon not found');
        router.push('/admin/coupons');
      }
    } catch (error) {
      console.error('Error fetching coupon:', error);
      alert('Failed to fetch coupon');
      router.push('/admin/coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Coupon name is required';
    }

    if (formData.discountValue <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0';
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%';
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.usageLimit <= 0) {
      newErrors.usageLimit = 'Usage limit must be greater than 0';
    }

    if (formData.perUserLimit <= 0) {
      newErrors.perUserLimit = 'Per user limit must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      const response = await couponApi.update(couponId, {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minOrderAmount: formData.minOrderAmount,
        maxDiscountAmount: formData.maxDiscountAmount || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        usageLimit: formData.usageLimit,
        perUserLimit: formData.perUserLimit,
        isActive: formData.isActive
      });
      
      if (response.success) {
        alert('Coupon updated successfully!');
        router.push('/admin/coupons');
      } else {
        setErrors({ submit: response.error || 'Failed to update coupon' });
      }
    } catch (error: any) {
      console.error('Update coupon error:', error);
      setErrors({ submit: error.message || 'Failed to update coupon' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading coupon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/coupons"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Coupons
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit Coupon</h1>
              <p className="text-gray-600">Update coupon details</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.code && (
                    <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Discount Settings */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Discount Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="discountType"
                        value="percentage"
                        checked={formData.discountType === 'percentage'}
                        onChange={handleChange}
                        className="w-4 h-4 text-yellow-600"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <Percent className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-medium text-gray-900">Percentage Discount</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Apply a percentage discount</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="discountType"
                        value="fixed"
                        checked={formData.discountType === 'fixed'}
                        onChange={handleChange}
                        className="w-4 h-4 text-yellow-600"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                          <span className="font-medium text-gray-900">Fixed Amount Discount</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Apply a fixed amount discount</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="discountType"
                        value="free_shipping"
                        checked={formData.discountType === 'free_shipping'}
                        onChange={handleChange}
                        className="w-4 h-4 text-yellow-600"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 mr-2 text-purple-600" />
                          <span className="font-medium text-gray-900">Free Shipping</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Provide free shipping</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.discountType === 'percentage' ? 'Discount Percentage *' : 'Discount Amount *'}
                    </label>
                    <div className="relative">
                      {formData.discountType === 'percentage' ? (
                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      ) : (
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      )}
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleChange}
                        min="0"
                        max={formData.discountType === 'percentage' ? 100 : undefined}
                        step="0.01"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                          errors.discountValue ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.discountValue && (
                      <p className="text-red-500 text-sm mt-1">{errors.discountValue}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="minOrderAmount"
                        value={formData.minOrderAmount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Set 0 for no minimum</p>
                  </div>

                  {formData.discountType === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Discount Amount
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          name="maxDiscountAmount"
                          value={formData.maxDiscountAmount || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            maxDiscountAmount: e.target.value === '' ? null : parseFloat(e.target.value)
                          }))}
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Leave empty for no limit"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Validity Period</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                        errors.endDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Limits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Usage Limit *
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.usageLimit ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.usageLimit && (
                    <p className="text-red-500 text-sm mt-1">{errors.usageLimit}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per User Limit *
                  </label>
                  <input
                    type="number"
                    name="perUserLimit"
                    value={formData.perUserLimit}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.perUserLimit ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.perUserLimit && (
                    <p className="text-red-500 text-sm mt-1">{errors.perUserLimit}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active (Coupon can be used)</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                href="/admin/coupons"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Coupon
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}