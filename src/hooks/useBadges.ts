import { useState, useEffect, useCallback } from "react";
import { badgesService } from "../services/badges";
import { Badge, UserBadge } from "../types";

export const useBadges = (userId?: number) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all badges
  const loadBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allBadges = await badgesService.getAllBadges();
      setBadges(allBadges);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load badges");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user badges
  const loadUserBadges = useCallback(async () => {
    if (!userId) return;

    try {
      const myBadges = await badgesService.getMyBadges();
      setUserBadges(myBadges);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load user badges"
      );
    }
  }, [userId]);

  // Get badges by category
  const getBadgesByCategory = useCallback(async (category: string) => {
    try {
      return await badgesService.getBadgesByCategory(category);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load badges by category"
      );
      return [];
    }
  }, []);

  // Get badge progress
  const getBadgeProgress = useCallback(async (badgeId: number) => {
    try {
      return await badgesService.getBadgeProgress(badgeId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get badge progress"
      );
      return { progress: 0, maxProgress: 0 };
    }
  }, []);

  // Get badge stats
  const getBadgeStats = useCallback(async () => {
    try {
      return await badgesService.getBadgeStats();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get badge stats"
      );
      return {
        totalBadges: 0,
        unlockedBadges: 0,
        rareCount: 0,
        epicCount: 0,
        legendaryCount: 0,
      };
    }
  }, []);

  // Get badge leaderboard
  const getBadgeLeaderboard = useCallback(async () => {
    try {
      return await badgesService.getBadgeLeaderboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get badge leaderboard"
      );
      return [];
    }
  }, []);

  // Check if user has badge
  const hasBadge = useCallback(
    (badgeId: number): boolean => {
      return userBadges.some((userBadge) => userBadge.badgeId === badgeId);
    },
    [userBadges]
  );

  // Get user badge by badge ID
  const getUserBadge = useCallback(
    (badgeId: number): UserBadge | undefined => {
      return userBadges.find((userBadge) => userBadge.badgeId === badgeId);
    },
    [userBadges]
  );

  // Get badges with user progress
  const getBadgesWithProgress = useCallback(() => {
    return badges.map((badge) => {
      const userBadge = userBadges.find((ub) => ub.badgeId === badge.id);
      return {
        ...badge,
        isUnlocked: !!userBadge,
        unlockedAt: userBadge?.unlockedAt,
      };
    });
  }, [badges, userBadges]);

  // Count badges by rarity
  const countBadgesByRarity = useCallback(() => {
    const counts = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };

    userBadges.forEach((userBadge) => {
      const badge = badges.find((b) => b.id === userBadge.badgeId);
      if (badge) {
        counts[badge.rarity]++;
      }
    });

    return counts;
  }, [badges, userBadges]);

  // Refresh data
  const refresh = useCallback(async () => {
    await Promise.all([loadBadges(), loadUserBadges()]);
  }, [loadBadges, loadUserBadges]);

  // Initialize
  useEffect(() => {
    loadBadges();
    if (userId) {
      loadUserBadges();
    }
  }, [loadBadges, loadUserBadges, userId]);

  return {
    badges,
    userBadges,
    loading,
    error,
    getBadgesByCategory,
    getBadgeProgress,
    getBadgeStats,
    getBadgeLeaderboard,
    hasBadge,
    getUserBadge,
    getBadgesWithProgress,
    countBadgesByRarity,
    refresh,
    clearError: () => setError(null),
  };
};
