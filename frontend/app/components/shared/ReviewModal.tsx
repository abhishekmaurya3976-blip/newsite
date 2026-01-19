// app/components/products/ReviewModal.tsx - Updated
'use client';

import { useState, useEffect } from 'react';
import { X, Star, Upload, AlertCircle, Check, Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../components/contexts/AuthContext';
import { useRating } from '../../contexts/RatingsContext';
import RatingStars from './RatingStars';

interface ReviewModalProps {
  productId: string;
  productName: string;
  onClose: () => void;
  editingReview?: any;
}

export default function ReviewModal({ 
  productId, 
  productName, 
  onClose,
  editingReview 
}: ReviewModalProps) {
  const [rating, setRating] = useState(editingReview?.rating || 0);
  const [title, setTitle] = useState(editingReview?.title || '');
  const [comment, setComment] = useState(editingReview?.comment || '');
  const [images, setImages] = useState<string[]>(editingReview?.images || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [purchaseInfo, setPurchaseInfo] = useState<any>(null);

  const { user } = useAuth();
  const { submitReview, updateReview, canReviewProduct } = useRating();

  // Check eligibility when component mounts
  useEffect(() => {
    const checkEligibility = async () => {
      if (productId && user) {
        try {
          const token = localStorage.getItem('userToken');
          const response = await fetch(`http://localhost:5000/api/reviews/can-review/${productId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setPurchaseInfo(data.data);
              
              // If not eligible, show appropriate message
              if (!data.data.canReview) {
                if (!data.data.hasPurchased) {
                  setError('You need to purchase this product before you can review it.');
                } else if (data.data.hasReviewed) {
                  setError('You have already reviewed this product.');
                }
              }
            }
          }
        } catch (error) {
          console.error('Error checking eligibility:', error);
        }
      }
    };

    if (!editingReview) {
      checkEligibility();
    }
  }, [productId, user, editingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please write a review comment');
      return;
    }
    
    if (comment.length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const reviewData = {
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images,
      };

      let result;
      if (editingReview) {
        result = await updateReview(editingReview._id, reviewData);
      } else {
        result = await submitReview(reviewData);
      }

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In a real app, you would upload to a cloud storage service
    // For demo, we'll create object URLs
    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, 4 - images.length); i++) {
      newImages.push(URL.createObjectURL(files[i]));
    }
    
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (!editingReview && purchaseInfo && !purchaseInfo.canReview) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Review Not Eligible</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {!purchaseInfo.hasPurchased ? 'Purchase Required' : 'Already Reviewed'}
              </h3>
              <p className="text-gray-600">
                {!purchaseInfo.hasPurchased 
                  ? 'You need to purchase this product before you can write a review.'
                  : 'You have already reviewed this product. You can edit your existing review from the reviews page.'
                }
              </p>
            </div>

            {purchaseInfo.hasPurchased && purchaseInfo.orderDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Package className="w-4 h-4 text-green-600 mr-2" />
                  <span className="font-medium text-gray-900">Your Purchase Details:</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Order: {purchaseInfo.orderDetails.orderNumber}</p>
                  <p>Delivered: {new Date(purchaseInfo.orderDetails.deliveredAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
              {!purchaseInfo.hasPurchased && (
                <button
                  onClick={() => {
                    onClose();
                    window.location.href = `/products/${productId}`;
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium"
                >
                  View Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Review {editingReview ? 'Updated' : 'Submitted'}!
          </h3>
          <p className="text-gray-600">
            Thank you for your review. It will be visible to other customers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {editingReview ? 'Edit Review' : 'Write a Review'}
            </h2>
            <p className="text-gray-600 mt-1">{productName}</p>
            
            {/* Purchase Info */}
            {!editingReview && purchaseInfo?.hasPurchased && purchaseInfo?.orderDetails && (
              <div className="flex items-center mt-2 text-sm text-green-600">
                <Package className="w-4 h-4 mr-2" />
                <span>You purchased this product on {new Date(purchaseInfo.orderDetails.orderDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              <RatingStars
                rating={rating}
                interactive={true}
                onRatingChange={setRating}
                size="lg"
              />
              <span className="ml-2 text-lg font-medium text-gray-700">
                {rating > 0 ? `${rating.toFixed(1)}/5` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Review Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Summarize your experience"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Review Comment *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32"
              placeholder="Share details of your experience with this product..."
              minLength={10}
              maxLength={1000}
              required
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${comment.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                Minimum 10 characters
              </span>
              <span className="text-xs text-gray-500">
                {comment.length}/1000
              </span>
            </div>
          </div>

          {/* Image Upload
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Add Photos (Optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Review ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {images.length < 4 && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-purple-500 transition-colors">
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Upload</span>
                  </div>
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">
              You can upload up to 4 images. JPG, PNG up to 5MB each.
            </p>
          </div> */}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !rating || !comment.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {editingReview ? 'Updating...' : 'Submitting...'}
                </div>
              ) : editingReview ? (
                'Update Review'
              ) : (
                'Submit Review'
              )}
            </button>
          </div>

          {/* Verification Note */}
          {!editingReview && purchaseInfo?.hasPurchased && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 flex items-center">
                <Package className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Your review will be marked as "Verified Purchase" since you've bought this product.</span>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}