import api from "./api";

export interface Badge {
  id: number;
  name: string;
  title?: string; // alias for name
  description: string;
  icon: string;
  color?: string;
  isRare?: boolean;
  earned?: boolean;
  unlocked?: boolean; // alias for earned
  progress?: number;
  unlockedAt?: string;
  category?: string; // Add category field
}

export interface UserBadge {
  id: number;
  name: string;
  title?: string;
  description: string;
  icon: string;
  color?: string;
  isRare?: boolean;
  earned: boolean;
  unlocked?: boolean;
  progress: number;
  unlockedAt?: string;
  category?: string; // Add category field
  // For compatibility with old interface
  badge?: Badge;
}

export interface BadgeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

class BadgeService {
  private allBadges: Badge[] = [];
  private userBadges: UserBadge[] = [];
  private categories: BadgeCategory[] = [];

  // ==================== BADGES ====================

  /**
   * Get all available badges
   */
  async getAllBadges(): Promise<Badge[]> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/badges", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.allBadges = response.data;
      return this.allBadges;
    } catch (error) {
      console.error("❌ Error loading all badges:", error);
      return this.allBadges;
    }
  }

  /**
   * Get user's earned badges
   */
  async getMyBadges(): Promise<UserBadge[]> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/badges/my-badges", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.userBadges = response.data;
      return this.userBadges;
    } catch (error) {
      console.error("❌ Error loading user badges:", error);
      return this.userBadges;
    }
  }

  /**
   * Get badge categories
   */
  async getBadgeCategories(): Promise<BadgeCategory[]> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/badges/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.categories = response.data;
      return this.categories;
    } catch (error) {
      console.error("❌ Error loading badge categories:", error);
      return this.categories;
    }
  }

  /**
   * Get badges by category
   */
  getBadgesByCategory(category: string): Badge[] {
    if (category === "all") {
      return this.allBadges;
    }
    return this.allBadges.filter((badge) => badge.category === category);
  }

  /**
   * Get earned badges by category
   */
  getEarnedBadgesByCategory(category: string): UserBadge[] {
    if (category === "all") {
      return this.userBadges;
    }
    return this.userBadges.filter(
      (userBadge) => userBadge.category === category
    );
  }

  // ==================== PROGRESS & TRACKING ====================

  /**
   * Check and update badge progress
   */
  async checkBadgeProgress(action: string, data?: unknown): Promise<Badge[]> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/badges/check-progress",
        {
          action,
          data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newBadges = response.data.newBadges || [];

      // Refresh user badges if new badges were earned
      if (newBadges.length > 0) {
        await this.getMyBadges();
      }

      return newBadges;
    } catch (error) {
      console.error("❌ Error checking badge progress:", error);
      return [];
    }
  }

  /**
   * Track specific actions for badge progress
   */
  async trackAction(action: string, data?: unknown): Promise<void> {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/badges/track-action",
        {
          action,
          data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("❌ Error tracking badge action:", error);
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Get cached badges
   */
  getCachedBadges(): Badge[] {
    return this.allBadges;
  }

  /**
   * Get cached user badges
   */
  getCachedUserBadges(): UserBadge[] {
    return this.userBadges;
  }

  /**
   * Check if user has specific badge
   */
  hasBadge(badgeId: number): boolean {
    return this.userBadges.some((userBadge) => userBadge.id === badgeId);
  }

  /**
   * Get badge progress for specific badge
   */
  getBadgeProgress(badgeId: number): number {
    const userBadge = this.userBadges.find((ub) => ub.id === badgeId);
    return userBadge?.progress || 0;
  }

  /**
   * Get rare badges count
   */
  getRareBadgesCount(): number {
    return this.userBadges.filter((ub) => ub.isRare).length;
  }

  /**
   * Get total badge points
   */
  getTotalBadgePoints(): number {
    // Since backend doesn't have points, count badges (rare = 5 points, normal = 1 point)
    return this.userBadges.reduce((total, ub) => {
      const points = ub.isRare ? 5 : 1;
      return total + points;
    }, 0);
  }

  /**
   * Refresh all badge data
   */
  async refreshBadges(): Promise<void> {
    await Promise.all([
      this.getAllBadges(),
      this.getMyBadges(),
      this.getBadgeCategories(),
    ]);
  }

  /**
   * Get badge by ID
   */
  getBadgeById(id: number): Badge | undefined {
    return this.allBadges.find((badge) => badge.id === id);
  }

  /**
   * Get user badge by ID
   */
  getUserBadgeById(id: number): UserBadge | undefined {
    return this.userBadges.find((ub) => ub.id === id);
  }
}

// Export singleton instance
export const badgeService = new BadgeService();
export default badgeService;
