import api from "./api";
import { Badge, UserBadge } from "../types";

export const badgesService = {
  // Get all available badges
  getAllBadges: async (): Promise<Badge[]> => {
    const response = await api.get("/badges");
    return response.data;
  },

  // Get user's earned badges
  getMyBadges: async (): Promise<UserBadge[]> => {
    const response = await api.get("/badges/my-badges");
    return response.data;
  },

  // Get badges by category
  getBadgesByCategory: async (category: string): Promise<Badge[]> => {
    const response = await api.get(`/badges/category/${category}`);
    return response.data;
  },

  // Get badge progress for a specific badge
  getBadgeProgress: async (
    badgeId: number
  ): Promise<{ progress: number; maxProgress: number }> => {
    const response = await api.get(`/badges/${badgeId}/progress`);
    return response.data;
  },

  // Get user badge stats
  getBadgeStats: async (): Promise<{
    totalBadges: number;
    unlockedBadges: number;
    rareCount: number;
    epicCount: number;
    legendaryCount: number;
  }> => {
    const response = await api.get("/badges/stats");
    return response.data;
  },

  // Get badge leaderboard
  getBadgeLeaderboard: async (): Promise<
    {
      id: number;
      name: string;
      badgeCount: number;
      rareCount: number;
      rank: number;
    }[]
  > => {
    const response = await api.get("/badges/leaderboard");
    return response.data;
  },
};
