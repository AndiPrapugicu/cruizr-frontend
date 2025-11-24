import React, { InputHTMLAttributes, forwardRef } from 'react';

export type InputVariant = 'default' | 'filled' | 'outline';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  error?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<InputVariant, string> = {
  default: 'border border-gray-300 bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200',
  filled: 'border-0 bg-gray-100 focus:bg-gray-50 focus:ring-2 focus:ring-pink-500',
  outline: 'border-2 border-gray-300 bg-transparent focus:border-pink-500',
};

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-5 py-3 text-lg rounded-xl',
};

/**
 * Component Input responsive
 * Suportă icon-uri, label, erori și diferite stiluri
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      error,
      label,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'transition-all duration-200 outline-none w-full';
    const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : '';
    const widthStyles = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`${widthStyles}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              ${baseStyles}
              ${variantStyles[variant]}
              ${sizeStyles[size]}
              ${errorStyles}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
