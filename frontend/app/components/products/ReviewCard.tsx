// app/components/products/ReviewCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  ThumbsUp, 
  Edit, 
  Trash2, 
  X, 
  Check,
  Package,
  Flag,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../components/contexts/AuthContext';
import RatingStars from '../shared/RatingStars';

interface ReviewCardProps {
  review: {
    _id: string;
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
  };
  productId: string;
  onEdit?: (review: any) => void;
  onDelete?: (reviewId: string) => void;
  showActions?: boolean;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
}

export default function ReviewCard({ 
  review, 
  productId, 
  onEdit, 
  onDelete, 
  showActions = true,
  onHelpful,
  onReport
}: ReviewCardProps) {
  const { user } = useAuth();
  
  // Safely check if user is logged in and get user ID
  const getUserId = () => {
    if (!user) return null;
    
    // Try different possible properties for user ID
    if (typeof user === 'object') {
      // Check for common user ID properties
      if ('_id' in user && user._id) return user._id;
      if ('id' in user && user.id) return user.id;
      if ('userId' in user && user.userId) return user.userId;
      if ('user_id' in user && user.user_id) return user.user_id;
    }
    
    return null;
  };
  
  const userId = getUserId();
  const isOwner = userId && review.userId === userId;
  
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reporting, setReporting] = useState(false);
  
  const reviewDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleEdit = () => {
    if (onEdit) {
      onEdit(review);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(review._id);
    }
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleHelpful = () => {
    if (!user) {
      // Show login prompt or alert
      alert('Please login to mark reviews as helpful.');
      return;
    }
    
    if (!isHelpful) {
      setIsHelpful(true);
      setHelpfulCount(prev => prev + 1);
      
      // Call the onHelpful callback if provided
      if (onHelpful) {
        onHelpful(review._id);
      }
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fadeIn';
      toast.textContent = 'Marked as helpful!';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  };

  const handleReport = () => {
    if (!user) {
      alert('Please login to report reviews.');
      return;
    }
    
    if (onReport) {
      onReport(review._id);
    } else {
      // Default report behavior
      setReporting(true);
      setTimeout(() => {
        setReporting(false);
        alert('Thank you for reporting this review. Our team will review it shortly.');
      }, 1000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:border-purple-100">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* User Info */}
          <div className="flex items-start mb-3">
            {review.userAvatar ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                <Image
                  src={review.userAvatar}
                  alt={review.userName}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mr-3 flex-shrink-0">
                <UserIcon className="w-5 h-5 text-purple-600" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">
                  {review.userName}
                </h4>
                {review.verifiedPurchase && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                    <Package className="w-3 h-3 mr-1" />
                    Verified Purchase
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{reviewDate}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center">
              <RatingStars rating={review.rating} size="sm" />
              <span className="ml-2 text-sm font-medium text-gray-700">
                {review.rating.toFixed(1)}/5
              </span>
            </div>
          </div>

          {/* Review Title */}
          {review.title && (
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {review.title}
            </h3>
          )}
        </div>

        {/* Action Buttons (Owner only) */}
        {showActions && isOwner && (
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Edit Review"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Review Comment */}
      <p className="text-gray-700 mb-4 whitespace-pre-line leading-relaxed">
        {review.comment}
      </p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {review.images.map((image, index) => (
            <div key={index} className="relative group cursor-pointer">
              <div className="relative h-32 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={handleHelpful}
            disabled={isHelpful || !user}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${
              isHelpful 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 border border-gray-200 hover:border-purple-200'
            } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={!user ? "Login to mark as helpful" : isHelpful ? "Already marked as helpful" : "Mark as helpful"}
          >
            <ThumbsUp className={`w-4 h-4 ${isHelpful ? 'fill-green-600' : ''}`} />
            <span className="text-sm font-medium">
              Helpful {helpfulCount > 0 && `(${helpfulCount})`}
            </span>
          </button>
          
          {!isOwner && (
            <button
              onClick={handleReport}
              disabled={reporting}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {reporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  Reporting...
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4" />
                  Report
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Owner badge */}
        {isOwner && (
          <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            <UserIcon className="w-3 h-3 mr-1" />
            Your Review
          </span>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Delete Review
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium hover:border-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 font-medium flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}