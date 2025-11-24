import React from 'react';

export interface IconProps {
  icon: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
  className?: string;
  onClick?: () => void;
}

const sizeStyles = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
};

/**
 * Component Icon wrapper pentru consistență
 */
export const Icon: React.FC<IconProps> = ({
  icon,
  size = 'md',
  color,
  className = '',
  onClick,
}) => {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        ${sizeStyles[size]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{ color }}
      onClick={onClick}
    >
      {icon}
    </span>
  );
};
