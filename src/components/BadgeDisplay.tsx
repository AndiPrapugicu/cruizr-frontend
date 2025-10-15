import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaStar,
  FaFire,
  FaCrown,
  FaGem,
  FaCar,
  FaUsers,
  FaTrophy,
} from "react-icons/fa";
import { useBadges } from "../hooks/useBadges";
import { useAuth } from "../contexts/AuthContext";
import { Badge, BadgeCategory, BadgeRarity } from "../types";

interface BadgeDisplayProps {
  userId?: number;
  showTitle?: boolean;
  maxBadges?: number;
  onBadgePress?: (badge: Badge) => void;
  category?: BadgeCategory;
  showAll?: boolean;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  userId,
  showTitle = true,
  maxBadges = 6,
  onBadgePress,
  category,
  showAll = false,
}) => {
  const { user } = useAuth();
  const { userBadges, loading, getBadgesWithProgress, countBadgesByRarity } =
    useBadges(userId || user?.userId);

  const [showAllModal, setShowAllModal] = useState(false);

  const badgesWithProgress = getBadgesWithProgress();
  const filteredBadges = category
    ? badgesWithProgress.filter((badge) => badge.category === category)
    : badgesWithProgress;

  // Sort badges to show unlocked ones first
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;
    if (a.isUnlocked && b.isUnlocked) {
      // Among unlocked badges, sort by rarity (legendary first)
      const rarityOrder = {
        [BadgeRarity.LEGENDARY]: 4,
        [BadgeRarity.EPIC]: 3,
        [BadgeRarity.RARE]: 2,
        [BadgeRarity.COMMON]: 1,
      };
      return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
    }
    return 0;
  });

  const displayBadges = showAll
    ? sortedBadges
    : sortedBadges.slice(0, maxBadges);

  const rarityCounts = countBadgesByRarity();

  const getBadgeIcon = (badge: Badge) => {
    switch (badge.category) {
      case BadgeCategory.CARS:
        return <FaCar className="text-blue-500" />;
      case BadgeCategory.SOCIAL:
        return <FaUsers className="text-green-500" />;
      case BadgeCategory.ACTIVITY:
        return <FaFire className="text-red-500" />;
      case BadgeCategory.ACHIEVEMENTS:
        return <FaTrophy className="text-yellow-500" />;
      case BadgeCategory.SPECIAL:
        return <FaCrown className="text-purple-500" />;
      default:
        return <FaStar className="text-gray-500" />;
    }
  };

  const getRarityColor = (rarity: BadgeRarity) => {
    switch (rarity) {
      case BadgeRarity.COMMON:
        return "border-gray-300 bg-gray-50";
      case BadgeRarity.RARE:
        return "border-blue-300 bg-blue-50";
      case BadgeRarity.EPIC:
        return "border-purple-300 bg-purple-50";
      case BadgeRarity.LEGENDARY:
        return "border-yellow-300 bg-yellow-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const getRarityIcon = (rarity: BadgeRarity) => {
    switch (rarity) {
      case BadgeRarity.RARE:
        return <FaGem className="text-blue-500" />;
      case BadgeRarity.EPIC:
        return <FaStar className="text-purple-500" />;
      case BadgeRarity.LEGENDARY:
        return <FaCrown className="text-yellow-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-4 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Badge-uri</h3>
          {filteredBadges.length > maxBadges && !showAll && (
            <button
              onClick={() => setShowAllModal(true)}
              className="text-yellow-500 font-medium hover:text-yellow-600 hover:bg-yellow-50 px-3 py-1 rounded-lg transition-all"
            >
              See all ({sortedBadges.length})
            </button>
          )}
        </div>
      )}

      {/* Badge Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <span className="text-sm font-bold">{userBadges.length}</span>
          </div>
          <span className="text-xs text-gray-600">Total</span>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <span className="text-sm font-bold text-blue-600">
              {rarityCounts.rare}
            </span>
          </div>
          <span className="text-xs text-gray-600">Rare</span>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <span className="text-sm font-bold text-purple-600">
              {rarityCounts.epic}
            </span>
          </div>
          <span className="text-xs text-gray-600">Epic</span>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <span className="text-sm font-bold text-yellow-600">
              {rarityCounts.legendary}
            </span>
          </div>
          <span className="text-xs text-gray-600">Legendary</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {displayBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onBadgePress?.(badge)}
            className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
              badge.isUnlocked
                ? getRarityColor(badge.rarity) + " shadow-sm hover:shadow-md"
                : "border-gray-300 bg-gray-50 grayscale opacity-60"
            }`}
          >
            {/* Rarity indicator */}
            {badge.isUnlocked && badge.rarity !== BadgeRarity.COMMON && (
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                {getRarityIcon(badge.rarity)}
              </div>
            )}

            <div className="text-center">
              <div
                className={`text-2xl mb-2 ${
                  !badge.isUnlocked ? "grayscale opacity-40" : ""
                }`}
              >
                {getBadgeIcon(badge)}
              </div>
              <h4
                className={`font-semibold text-xs line-clamp-2 ${
                  badge.isUnlocked ? "text-gray-800" : "text-gray-500"
                }`}
              >
                {badge.name}
              </h4>
              {badge.isUnlocked && badge.unlockedAt && (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ✓ Obținut
                </p>
              )}
              {!badge.isUnlocked && badge.progress && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (badge.progress.current / badge.progress.total) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {badge.progress.current}/{badge.progress.total}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {displayBadges.length === 0 && (
        <div className="text-center py-8">
          <FaStar className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nu există badge-uri disponibile.</p>
        </div>
      )}

      {/* Show All Modal */}
      <AnimatePresence>
        {showAllModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAllModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Toate Badge-urile</h2>
                    <p className="text-pink-100 text-sm mt-1">
                      {userBadges.length} din {sortedBadges.length} obținute
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAllModal(false)}
                    className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {sortedBadges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onBadgePress?.(badge)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                        badge.isUnlocked
                          ? getRarityColor(badge.rarity) +
                            " shadow-md hover:shadow-lg"
                          : "border-gray-200 bg-gray-50 grayscale opacity-60"
                      }`}
                    >
                      {/* Rarity indicator */}
                      {badge.isUnlocked &&
                        badge.rarity !== BadgeRarity.COMMON && (
                          <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                            {getRarityIcon(badge.rarity)}
                          </div>
                        )}

                      <div className="text-center">
                        <div
                          className={`text-3xl mb-2 ${
                            !badge.isUnlocked ? "grayscale opacity-40" : ""
                          }`}
                        >
                          {getBadgeIcon(badge)}
                        </div>
                        <h4
                          className={`font-semibold text-sm mb-1 ${
                            badge.isUnlocked ? "text-gray-800" : "text-gray-500"
                          }`}
                        >
                          {badge.name}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-tight">
                          {badge.description}
                        </p>

                        {/* Progress for unlocked badges */}
                        {badge.isUnlocked && badge.unlockedAt && (
                          <p className="text-xs text-green-600 mt-2 font-medium">
                            ✓ Obținut
                          </p>
                        )}

                        {/* Progress for locked badges */}
                        {!badge.isUnlocked && badge.progress && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (badge.progress.current /
                                      badge.progress.total) *
                                      100
                                  )}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {badge.progress.current}/{badge.progress.total}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Empty state */}
                {sortedBadges.length === 0 && (
                  <div className="text-center py-12">
                    <FaStar className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Nu există badge-uri disponibile.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgeDisplay;
