// app/components/products/RatingStars.tsx
'use client';

import { useState } from 'react'; // Add this import
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  interactive = false,
  onRatingChange,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getStarType = (starIndex: number) => {
    const currentRating = hoverRating !== null ? hoverRating : rating;
    
    if (starIndex <= currentRating) {
      return 'full';
    } else if (starIndex - 0.5 <= currentRating) {
      return 'half';
    } else {
      return 'empty';
    }
  };

  const handleStarClick = (starValue: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue: number | null) => {
    if (interactive) {
      setHoverRating(starValue);
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const starType = getStarType(starValue);
          
          return (
            <button
              key={index}
              type="button"
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5`}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              onMouseLeave={() => handleStarHover(null)}
              disabled={!interactive}
            >
              {starType === 'full' ? (
                <Star className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`} />
              ) : starType === 'half' ? (
                <div className="relative">
                  <Star className={`${sizeClasses[size]} text-gray-300`} />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                    <Star className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`} />
                  </div>
                </div>
              ) : (
                <Star className={`${sizeClasses[size]} text-gray-300`} />
              )}
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}