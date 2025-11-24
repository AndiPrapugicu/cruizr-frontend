import React from 'react';
import { motion } from 'framer-motion';
import { CarCard } from '../molecules/CarCard';

export interface Car {
  id: string;
  image: string;
  make: string;
  model: string;
  year: number;
  badges?: string[];
  isVIP?: boolean;
}

export interface CarGridProps {
  cars: Car[];
  onCarClick?: (carId: string) => void;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Component CarGrid - Grid responsive pentru mașini
 * Adaptează numărul de coloane pe device
 */
export const CarGrid: React.FC<CarGridProps> = ({
  cars,
  onCarClick,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  loading = false,
  emptyMessage = 'No cars found',
  className = '',
}) => {
  const gridCols = `grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`;

  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-4 md:gap-6 ${className}`}>
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 animate-pulse rounded-2xl aspect-[4/3]"
          />
        ))}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 ${className}`}>
      {cars.map((car, index) => (
        <motion.div
          key={car.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <CarCard
            {...car}
            onClick={() => onCarClick?.(car.id)}
          />
        </motion.div>
      ))}
    </div>
  );
};
