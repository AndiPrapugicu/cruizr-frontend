import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Badge } from '../atoms/Badge';

export interface CarCardProps {
  image: string;
  make: string;
  model: string;
  year: number;
  badges?: string[];
  onClick?: () => void;
  className?: string;
  isVIP?: boolean;
}

/**
 * Component CarCard pentru display mașini
 * Optimizat pentru grid layout responsive
 */
export const CarCard: React.FC<CarCardProps> = ({
  image,
  make,
  model,
  year,
  badges = [],
  onClick,
  className = '',
  isVIP = false,
}) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Card
        variant="default"
        padding="none"
        onClick={onClick}
        hoverable
        className="overflow-hidden"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={`${make} ${model}`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          
          {/* VIP Badge */}
          {isVIP && (
            <div className="absolute top-3 right-3">
              <Badge variant="warning" size="sm">
                👑 VIP
              </Badge>
            </div>
          )}

          {/* Year Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="gray" size="sm">
              {year}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 md:p-4">
          <h3 className="text-base md:text-lg font-bold text-gray-800 truncate">
            {make} {model}
          </h3>
          
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {badges.slice(0, 3).map((badge, index) => (
                <Badge key={index} variant="primary" size="sm">
                  {badge}
                </Badge>
              ))}
              {badges.length > 3 && (
                <Badge variant="gray" size="sm">
                  +{badges.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
