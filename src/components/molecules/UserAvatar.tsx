import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';

export interface UserAvatarProps {
  src?: string;
  name: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  showStatus?: boolean;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

/**
 * Component UserAvatar - Avatar cu nume, status și badge
 * Componență molecule pentru profile display
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  status = 'offline',
  showStatus = false,
  subtitle,
  badge,
  size = 'md',
  onClick,
  className = '',
}) => {
  const isClickable = onClick !== undefined;

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar
        src={src}
        alt={name}
        size={size}
        status={status}
        showStatus={showStatus}
        fallback={name}
        onClick={onClick}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-800 truncate text-sm md:text-base">
            {name}
          </h4>
          {badge && (
            <Badge variant={badge.variant} size="sm">
              {badge.text}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-xs md:text-sm text-gray-500 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  if (isClickable) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
