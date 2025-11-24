import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BellIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

export interface TopHeaderProps {
  title?: string;
  showLogo?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showSettings?: boolean;
  showMenu?: boolean;
  notificationCount?: number;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
}

/**
 * TopHeader - Header responsive pentru aplicație
 * Adaptat pentru mobile (hamburger menu) și desktop (full nav)
 */
export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  showLogo = true,
  showSearch = true,
  showNotifications = true,
  showSettings = true,
  showMenu = false,
  notificationCount = 0,
  onSearchClick,
  onNotificationClick,
  onMenuClick,
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <header
      className={`
        bg-white border-b border-gray-200
        sticky top-0 z-30
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {showMenu && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-600 hover:text-pink-500 transition-colors"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            )}

            {showLogo && (
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm md:text-base">C</span>
                </div>
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                  Cruizr
                </span>
              </Link>
            )}

            {title && !showLogo && (
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                {title}
              </h1>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3">
            {showSearch && (
              <button
                onClick={onSearchClick}
                className="p-2 text-gray-600 hover:text-pink-500 transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}

            {showNotifications && (
              <button
                onClick={onNotificationClick}
                className="relative p-2 text-gray-600 hover:text-pink-500 transition-colors"
              >
                <BellIcon className="w-5 h-5 md:w-6 md:h-6" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            )}

            {showSettings && (
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-pink-500 transition-colors"
              >
                <Cog6ToothIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
