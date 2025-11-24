import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../molecules/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { ShoppingCartIcon, SparklesIcon } from '@heroicons/react/24/outline';

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'coins' | 'real';
  image?: string;
  icon?: React.ReactNode;
  category: string;
  discount?: number;
  popular?: boolean;
  limited?: boolean;
  owned?: boolean;
}

export interface StoreGridProps {
  items: StoreItem[];
  onPurchase: (itemId: string) => void;
  userBalance?: number;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  loading?: boolean;
  className?: string;
}

/**
 * Component StoreGrid - Grid pentru items din store
 * Responsive cu indicatori pentru discount, popular, limited
 */
export const StoreGrid: React.FC<StoreGridProps> = ({
  items,
  onPurchase,
  userBalance = 0,
  loading = false,
  className = '',
}) => {
  const canAfford = (item: StoreItem) => {
    if (item.currency === 'real') return true;
    return userBalance >= item.price;
  };

  const getFinalPrice = (item: StoreItem) => {
    if (!item.discount) return item.price;
    return Math.floor(item.price * (1 - item.discount / 100));
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 ${className}`}>
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 animate-pulse rounded-2xl h-64"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 ${className}`}>
      {items.map((item, index) => {
        const finalPrice = getFinalPrice(item);
        const affordable = canAfford(item);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card variant="elevated" padding="none" className="overflow-hidden h-full flex flex-col">
              {/* Image/Icon */}
              <div className="relative bg-gradient-to-br from-pink-100 to-purple-100 p-8 flex items-center justify-center aspect-square">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-6xl">{item.icon || '🎁'}</div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {item.popular && (
                    <Badge variant="warning" size="sm">
                      <SparklesIcon className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {item.limited && (
                    <Badge variant="danger" size="sm">
                      Limited
                    </Badge>
                  )}
                  {item.owned && (
                    <Badge variant="success" size="sm">
                      Owned
                    </Badge>
                  )}
                </div>

                {item.discount && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="danger" size="md">
                      -{item.discount}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 md:p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-1 text-base md:text-lg">
                  {item.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 flex-1">
                  {item.description}
                </p>

                {/* Price */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    {item.discount ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-pink-600">
                          {item.currency === 'coins' ? '🪙' : '$'} {finalPrice}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {item.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-pink-600">
                        {item.currency === 'coins' ? '🪙' : '$'} {item.price}
                      </span>
                    )}
                  </div>
                  <Badge variant="gray" size="sm">
                    {item.category}
                  </Badge>
                </div>

                {/* Purchase Button */}
                <Button
                  variant={item.owned ? 'ghost' : 'primary'}
                  size="md"
                  fullWidth
                  disabled={item.owned || !affordable}
                  onClick={() => onPurchase(item.id)}
                  leftIcon={<ShoppingCartIcon className="w-5 h-5" />}
                >
                  {item.owned ? 'Owned' : !affordable ? 'Insufficient Funds' : 'Purchase'}
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
