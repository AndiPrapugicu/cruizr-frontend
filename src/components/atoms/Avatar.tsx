import React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  showStatus?: boolean;
  fallback?: string;
  className?: string;
  onClick?: () => void;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs' },
  sm: { container: 'w-8 h-8', text: 'text-sm' },
  md: { container: 'w-12 h-12', text: 'text-base' },
  lg: { container: 'w-16 h-16', text: 'text-lg' },
  xl: { container: 'w-24 h-24', text: 'text-2xl' },
  '2xl': { container: 'w-32 h-32', text: 'text-4xl' },
};

const statusStyles: Record<AvatarStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

const statusSize: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
  xl: 'w-5 h-5',
  '2xl': 'w-6 h-6',
};

/**
 * Component Avatar responsive
 * Suportă imagini, fallback text, status indicator și diferite dimensiuni
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  status = 'offline',
  showStatus = false,
  fallback,
  className = '',
  onClick,
}) => {
  const [imageError, setImageError] = React.useState(false);
  
  const initials = fallback || alt.substring(0, 2).toUpperCase();
  const isClickable = onClick !== undefined;

  return (
    <div 
      className={`relative inline-block ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div
        className={`
          ${sizeStyles[size].container}
          rounded-full
          overflow-hidden
          flex items-center justify-center
          bg-gradient-to-br from-pink-400 to-purple-500
          ${className}
        `}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className={`font-semibold text-white ${sizeStyles[size].text}`}>
            {initials}
          </span>
        )}
      </div>
      
      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSize[size]}
            ${statusStyles[status]}
            rounded-full
            border-2 border-white
          `}
        />
      )}
    </div>
  );
};
