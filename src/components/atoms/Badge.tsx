import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-pink-100 text-pink-700 border-pink-200',
  secondary: 'bg-purple-100 text-purple-700 border-purple-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const dotStyles: Record<BadgeVariant, string> = {
  primary: 'bg-pink-500',
  secondary: 'bg-purple-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  gray: 'bg-gray-500',
};

/**
 * Component Badge pentru etichete și statusuri
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />
      )}
      {children}
    </span>
  );
};
