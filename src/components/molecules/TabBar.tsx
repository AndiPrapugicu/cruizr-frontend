import React from 'react';
import { motion } from 'framer-motion';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

export interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
}

/**
 * Component TabBar responsive
 * Adaptabil pentru mobile (scrollable) și desktop (full width)
 */
export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  fullWidth = false,
  className = '',
}) => {
  const renderTab = (tab: Tab) => {
    const isActive = activeTab === tab.id;

    const baseStyles = 'px-4 py-2.5 md:py-3 font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap';
    
    const variantStyles = {
      default: isActive
        ? 'text-pink-600 border-b-2 border-pink-600'
        : 'text-gray-600 border-b-2 border-transparent hover:text-pink-500',
      pills: isActive
        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full shadow-md'
        : 'text-gray-600 hover:bg-gray-100 rounded-full',
      underline: isActive
        ? 'text-pink-600 relative'
        : 'text-gray-600 hover:text-pink-500',
    };

    return (
      <button
        key={tab.id}
        onClick={() => !tab.disabled && onChange(tab.id)}
        disabled={tab.disabled}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${fullWidth ? 'flex-1' : ''}
        `}
      >
        {tab.icon && <span className="text-lg md:text-xl">{tab.icon}</span>}
        <span className="text-sm md:text-base">{tab.label}</span>
        {tab.badge !== undefined && tab.badge > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
            {tab.badge > 99 ? '99+' : tab.badge}
          </span>
        )}
        
        {/* Underline indicator for 'underline' variant */}
        {variant === 'underline' && isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </button>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          flex gap-1
          ${fullWidth ? 'w-full' : 'overflow-x-auto scrollbar-hide'}
          ${variant === 'default' || variant === 'underline' ? 'border-b border-gray-200' : ''}
          ${variant === 'pills' ? 'bg-gray-100 p-1 rounded-full' : ''}
        `}
      >
        {tabs.map(renderTab)}
      </div>
    </div>
  );
};
