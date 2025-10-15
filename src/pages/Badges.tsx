import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrophy,
  FaStar,
  FaCrown,
  FaCar,
  FaHeart,
  FaMapMarkerAlt,
  FaLock,
  FaCheck,
} from "react-icons/fa";
import {
  badgeService,
  Badge,
  UserBadge,
  BadgeCategory,
} from "../services/badgeService";

export default function Badges() {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [categories, setCategories] = useState<BadgeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    loadBadgeData();
  }, []);

  const loadBadgeData = async () => {
    setLoading(true);
    try {
      await badgeService.refreshBadges();
      setAllBadges(badgeService.getCachedBadges());
      setUserBadges(badgeService.getCachedUserBadges());
      setCategories(await badgeService.getBadgeCategories());
    } catch (error) {
      console.error("Error loading badge data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBadges = () => {
    if (selectedCategory === "all") {
      return allBadges;
    }
    return badgeService.getBadgesByCategory(selectedCategory);
  };

  const getBadgeIcon = (badge: Badge) => {
    // Use the icon from backend if available, otherwise fallback to category-based icons
    if (badge.icon) {
      return <span className="text-2xl">{badge.icon}</span>;
    }

    // Fallback based on badge name patterns
    const name = badge.name.toLowerCase();
    if (name.includes("car") || name.includes("ride")) {
      return <FaCar className="text-blue-500" />;
    }
    if (
      name.includes("match") ||
      name.includes("heart") ||
      name.includes("love")
    ) {
      return <FaHeart className="text-red-500" />;
    }
    if (name.includes("travel") || name.includes("trip")) {
      return <FaMapMarkerAlt className="text-green-500" />;
    }

    // Default based on rarity
    if (badge.isRare) {
      return <FaCrown className="text-purple-500" />;
    }
    return <FaStar className="text-gray-500" />;
  };

  const isEarned = (badgeId: number): boolean => {
    return badgeService.hasBadge(badgeId);
  };

  const getBadgeProgress = (badgeId: number): number => {
    return badgeService.getBadgeProgress(badgeId);
  };

  const getEarnedDate = (badgeId: number): string | null => {
    const userBadge = badgeService.getUserBadgeById(badgeId);
    if (!userBadge || !userBadge.unlockedAt) return null;

    try {
      return new Date(userBadge.unlockedAt).toLocaleDateString();
    } catch {
      console.error("Error parsing date:", userBadge.unlockedAt);
      return null;
    }
  };

  const stats = {
    totalEarned: userBadges.length,
    totalAvailable: allBadges.length,
    rareEarned: badgeService.getRareBadgesCount(),
    totalPoints: badgeService.getTotalBadgePoints(),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏆 Badge-uri
          </h1>
          <p className="text-gray-600">
            Colecționează badge-uri prin activitățile tale
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{stats.totalEarned}</div>
              <div className="text-sm opacity-90">Badge-uri câștigate</div>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{stats.totalAvailable}</div>
              <div className="text-sm opacity-90">Total disponibile</div>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{stats.rareEarned}</div>
              <div className="text-sm opacity-90">Badge-uri rare</div>
            </div>
            <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <div className="text-sm opacity-90">Puncte totale</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-yellow-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaTrophy className="mr-1 inline" />
            Toate ({allBadges.length})
          </button>
          {categories.map((category) => {
            const categoryBadges = badgeService.getBadgesByCategory(
              category.id
            );
            const earnedInCategory = badgeService.getEarnedBadgesByCategory(
              category.id
            );

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center ${
                  selectedCategory === category.id
                    ? "bg-yellow-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name} ({earnedInCategory.length}/
                {categoryBadges.length})
              </button>
            );
          })}
        </div>

        {/* Badges Grid */}
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {getFilteredBadges().map((badge, index) => {
            const earned = isEarned(badge.id);
            const progress = getBadgeProgress(badge.id);
            const earnedDate = getEarnedDate(badge.id);

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedBadge(badge)}
                className={`relative bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  earned
                    ? "border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
                    : "border-2 border-gray-200 grayscale opacity-75 hover:opacity-100 hover:grayscale-0"
                } ${
                  badge.isRare ? "ring-2 ring-purple-300 ring-opacity-50" : ""
                }`}
              >
                {/* Rare Badge Indicator */}
                {badge.isRare && (
                  <div className="absolute top-2 right-2">
                    <FaCrown className="text-purple-500 text-sm" />
                  </div>
                )}

                {/* Earned Indicator */}
                {earned && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <FaCheck className="text-xs" />
                    </div>
                  </div>
                )}

                {/* Badge Icon */}
                <div className="flex justify-center mb-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      earned ? "bg-yellow-100" : "bg-gray-100"
                    }`}
                  >
                    {getBadgeIcon(badge)}
                  </div>
                </div>

                {/* Badge Info */}
                <div className="text-center">
                  <h3
                    className={`font-bold text-sm mb-1 ${
                      earned ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {badge.name}
                  </h3>
                  <p
                    className={`text-xs mb-2 line-clamp-2 ${
                      earned ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {badge.description}
                  </p>

                  {/* Points */}
                  <div
                    className={`text-xs font-semibold ${
                      earned ? "text-yellow-600" : "text-gray-400"
                    }`}
                  >
                    Puncte disponibile
                  </div>

                  {/* Progress Bar (for unearned badges with progress) */}
                  {!earned && progress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {progress}% completat
                      </div>
                    </div>
                  )}

                  {/* Earned Date */}
                  {earned && earnedDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      Câștigat pe {earnedDate}
                    </div>
                  )}
                </div>

                {/* Lock overlay for unearned badges */}
                {!earned && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                    <FaLock className="text-gray-400 text-lg" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {getFilteredBadges().length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nu există badge-uri în această categorie
            </h3>
            <p className="text-gray-600">
              Încearcă să selectezi o altă categorie.
            </p>
          </motion.div>
        )}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`p-6 text-center ${
                  selectedBadge.isRare
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : isEarned(selectedBadge.id)
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                    : "bg-gradient-to-r from-gray-400 to-gray-600"
                } text-white rounded-t-3xl`}
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <div className="text-3xl">{getBadgeIcon(selectedBadge)}</div>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedBadge.name}
                </h2>
                {selectedBadge.isRare && (
                  <div className="flex items-center justify-center text-yellow-200 text-sm">
                    <FaCrown className="mr-1" />
                    Badge Rar
                  </div>
                )}
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {selectedBadge.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Status:</span>
                    <span
                      className={`font-semibold ${
                        isEarned(selectedBadge.id)
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {isEarned(selectedBadge.id) ? "Câștigat" : "Necâștigat"}
                    </span>
                  </div>

                  {isEarned(selectedBadge.id) &&
                    getEarnedDate(selectedBadge.id) && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Data câștigării:</span>
                        <span className="font-semibold">
                          {getEarnedDate(selectedBadge.id)}
                        </span>
                      </div>
                    )}

                  <div className="pt-3 border-t">
                    <div className="text-sm text-gray-600 mb-2">Descriere:</div>
                    <div className="text-sm bg-gray-50 p-3 rounded-lg">
                      {selectedBadge.description}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBadge(null)}
                  className="w-full mt-6 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Închide
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
