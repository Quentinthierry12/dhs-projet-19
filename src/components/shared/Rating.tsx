
import React from 'react';

interface RatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
}

export const Rating: React.FC<RatingProps> = ({ 
  value, 
  onChange, 
  max = 5, 
  disabled = false 
}) => {
  return (
    <div className="flex space-x-1">
      {[...Array(max)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            onClick={() => !disabled && onChange(ratingValue)}
            disabled={disabled}
            className={`w-8 h-8 text-2xl transition-colors ${
              ratingValue <= value 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            } ${!disabled ? 'hover:text-yellow-400' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};
