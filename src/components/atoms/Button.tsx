import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  animated?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 shadow-md hover:shadow-lg',
  secondary: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-md hover:shadow-lg',
  outline: 'bg-transparent border-2 border-pink-500 text-pink-500 hover:bg-pink-50',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg',
  success: 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs rounded-md',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-6 py-3 text-lg rounded-xl',
  xl: 'px-8 py-4 text-xl rounded-2xl',
};

/**
 * Component Button responsive și animat
 * Suportă diferite variante, dimensiuni și stări
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      animated = true,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const widthStyles = fullWidth ? 'w-full' : '';
    
    const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

    const ButtonContent = (
      <>
        {loading && (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span className="flex-1">{children}</span>
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </>
    );

    if (animated) {
      return (
        <motion.button
          ref={ref}
          className={buttonClasses}
          disabled={disabled || loading}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          type={props.type}
          onClick={props.onClick}
          onSubmit={props.onSubmit}
        >
          {ButtonContent}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {ButtonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';
