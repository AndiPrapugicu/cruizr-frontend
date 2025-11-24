import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  HeartIcon as HeartSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
  UserIcon as UserSolid,
  FireIcon as FireSolid,
} from '@heroicons/react/24/solid';

export interface BottomNavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface BottomNavigationProps {
  items?: BottomNavItem[];
  className?: string;
}

const defaultNavItems: BottomNavItem[] = [
  {
    name: 'Home',
    path: '/dashboard',
    icon: HomeIcon,
    activeIcon: HomeSolid,
  },
  {
    name: 'Discover',
    path: '/nearby',
    icon: FireIcon,
    activeIcon: FireSolid,
  },
  {
    name: 'Likes',
    path: '/likes',
    icon: HeartIcon,
    activeIcon: HeartSolid,
  },
  {
    name: 'Chat',
    path: '/chat',
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatSolid,
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: UserIcon,
    activeIcon: UserSolid,
  },
];

/**
 * BottomNavigation - Navigation bar pentru mobile
 * Fixed la bottom, visible doar pe mobile/tablet
 */
export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items = defaultNavItems,
  className = '',
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || (path === '/nearby' && location.pathname === '/');
  };

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-40
        bg-white border-t border-gray-200
        lg:hidden
        safe-area-bottom
        ${className}
      `}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const active = isActive(item.path);
          const IconComponent = active ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex-1 flex flex-col items-center justify-center relative"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <IconComponent
                    className={`w-6 h-6 transition-colors ${
                      active ? 'text-pink-500' : 'text-gray-600'
                    }`}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs mt-1 font-medium ${
                    active ? 'text-pink-500' : 'text-gray-600'
                  }`}
                >
                  {item.name}
                </span>
              </motion.div>
              
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="bottomNavActiveTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-pink-500 rounded-b-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
