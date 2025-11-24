import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastProps {
  id?: string;
  type?: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  position?: ToastPosition;
  isVisible?: boolean;
}

const typeConfig = {
  success: {
    icon: CheckCircleIcon,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  error: {
    icon: XCircleIcon,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  info: {
    icon: InformationCircleIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
};

const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

/**
 * Component Toast pentru notificări
 * Fully responsive și animat
 */
export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  message,
  description,
  duration = 5000,
  onClose,
  position = 'top-right',
  isVisible = true,
}) => {
  const config = typeConfig[type];
  const IconComponent = config.icon;

  useEffect(() => {
    if (duration && onClose && isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`
            fixed z-50
            ${positionStyles[position]}
            w-11/12 md:w-auto max-w-md
          `}
        >
          <div
            className={`
              ${config.bg}
              ${config.border}
              border rounded-xl md:rounded-2xl
              shadow-lg
              p-4
              flex items-start gap-3
            `}
          >
            <IconComponent className={`w-6 h-6 flex-shrink-0 ${config.color}`} />
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm md:text-base">
                {message}
              </p>
              {description && (
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  {description}
                </p>
              )}
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Container pentru multiple toasts
 */
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: ToastPosition;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
}) => {
  return (
    <div className={`fixed ${positionStyles[position]} z-50 space-y-2`}>
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <Toast key={toast.id || index} {...toast} position={position} />
        ))}
      </AnimatePresence>
    </div>
  );
};
