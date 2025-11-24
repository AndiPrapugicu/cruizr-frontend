import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface PageTransitionProps {
  children: ReactNode;
  variant?: 'fade' | 'slide' | 'scale' | 'none';
  className?: string;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
};

/**
 * PageTransition - Wrapper pentru animații de tranziție între pagini
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'fade',
  className = '',
}) => {
  return (
    <motion.div
      initial={variants[variant].initial}
      animate={variants[variant].animate}
      exit={variants[variant].exit}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * PageContainer - Container pentru pagini cu tranziții
 */
export interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  transition?: 'fade' | 'slide' | 'scale' | 'none';
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  action,
  transition = 'fade',
  className = '',
}) => {
  return (
    <PageTransition variant={transition} className={className}>
      {(title || subtitle || action) && (
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {title && (
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-1">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm md:text-base text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        </div>
      )}
      {children}
    </PageTransition>
  );
};
