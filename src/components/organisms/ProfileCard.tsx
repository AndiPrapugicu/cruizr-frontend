import React from 'react';
import { Card } from '../molecules/Card';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { HeartIcon, ChatBubbleLeftIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

export interface ProfileCardData {
  id: string;
  name: string;
  age: number;
  avatar: string;
  photos: string[];
  bio: string;
  location?: string;
  distance?: number;
  car?: {
    make: string;
    model: string;
    year: number;
  };
  badges?: string[];
  interests?: string[];
  isLiked?: boolean;
  isVIP?: boolean;
}

export interface ProfileCardProps {
  profile: ProfileCardData;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onMessage?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Component ProfileCard - Card complex pentru profile de utilizatori
 * Responsive și interactiv pentru swipe/click interactions
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onLike,
  onDislike,
  onMessage,
  showActions = true,
  compact = false,
  className = '',
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);
  const photos = profile.photos.length > 0 ? profile.photos : [profile.avatar];

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <Card
      variant="elevated"
      padding="none"
      className={`overflow-hidden ${className}`}
    >
      {/* Photo Gallery */}
      <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden group">
        <img
          src={photos[currentPhotoIndex]}
          alt={profile.name}
          className="w-full h-full object-cover"
        />

        {/* Photo Navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ←
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              →
            </button>

            {/* Photo Indicators */}
            <div className="absolute top-4 left-0 right-0 flex gap-1 px-4">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* VIP Badge */}
        {profile.isVIP && (
          <div className="absolute top-4 right-4">
            <Badge variant="warning" size="md">
              👑 VIP
            </Badge>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-1">
            {profile.name}, {profile.age}
          </h2>
          
          {profile.location && (
            <div className="flex items-center gap-1 text-sm mb-2">
              <MapPinIcon className="w-4 h-4" />
              <span>{profile.location}</span>
              {profile.distance && <span>• {profile.distance} km away</span>}
            </div>
          )}

          {profile.car && (
            <p className="text-sm opacity-90">
              🚗 {profile.car.year} {profile.car.make} {profile.car.model}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      {!compact && (
        <div className="p-4 md:p-6">
          {profile.bio && (
            <p className="text-gray-700 text-sm md:text-base mb-4">{profile.bio}</p>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {profile.badges && profile.badges.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Achievements
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.badges.slice(0, 5).map((badge, index) => (
                  <Badge key={index} variant="primary" size="sm">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="p-4 md:p-6 pt-0 flex gap-3 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 md:flex-none"
            onClick={() => onDislike?.(profile.id)}
          >
            ✕
          </Button>
          
          {onMessage && (
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 md:flex-none"
              onClick={() => onMessage(profile.id)}
              leftIcon={<ChatBubbleLeftIcon className="w-5 h-5" />}
            >
              Message
            </Button>
          )}
          
          <Button
            variant="primary"
            size="lg"
            className="flex-1 md:flex-none"
            onClick={() => onLike?.(profile.id)}
            leftIcon={profile.isLiked ? <HeartSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
          >
            {profile.isLiked ? 'Liked' : 'Like'}
          </Button>
        </div>
      )}
    </Card>
  );
};
