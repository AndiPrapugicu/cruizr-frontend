import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'primary' | 'secondary' | 'white' | 'gray';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const colorStyles: Record<SpinnerColor, string> = {
  primary: 'border-pink-500',
  secondary: 'border-purple-500',
  white: 'border-white',
  gray: 'border-gray-500',
};

/**
 * Component Spinner pentru loading states
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  return (
    <div
      className={`
        ${sizeStyles[size]}
        ${colorStyles[color]}
        border-4 border-t-transparent
        rounded-full
        animate-spin
        ${className}
      `}
    />
  );
};

/**
 * Component LoadingOverlay pentru full-page loading
 */
export const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
        <Spinner size="xl" color="primary" />
        {message && (
          <p className="text-gray-700 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};
