import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const variantStyles = {
  default: 'bg-white shadow-md',
  elevated: 'bg-white shadow-xl',
  outlined: 'bg-white border-2 border-gray-200',
  gradient: 'bg-gradient-to-br from-pink-50 to-purple-50 shadow-md',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-3 md:p-4',
  md: 'p-4 md:p-6',
  lg: 'p-6 md:p-8',
};

/**
 * Component Card responsive
 * Container universal pentru conținut
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hoverable = false,
}) => {
  const isClickable = onClick !== undefined;

  const content = (
    <div
      className={`
        rounded-xl md:rounded-2xl
        transition-all duration-300
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${isClickable || hoverable ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );

  if (isClickable || hoverable) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-3 flex-1">
        {icon && (
          <div className="flex-shrink-0 text-pink-500">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
};

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`text-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};
