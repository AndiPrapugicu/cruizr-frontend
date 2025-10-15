import api from "./api";

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: "fuel" | "premium";
  subcategory: string;
  price: number;
  currency: "fuel" | "premium";
  icon: string;
  features: string[];
  duration?: string;
  usesIncluded?: number;
  active: boolean;
  purchased: boolean;
  expiresAt?: string;
  cooldownUntil?: string;
  isImplemented?: boolean; // Whether the feature is fully implemented
  isPermanent?: boolean; // Whether it's a one-time purchase
}

export interface UserBalance {
  fuel: number;
  premium: number;
  lastUpdated: string;
}

export interface PurchaseHistory {
  id: string;
  itemId: string;
  itemName: string;
  price: number;
  currency: "fuel" | "premium";
  purchasedAt: string;
  status: "active" | "expired" | "used";
}

class StoreService {
  private storeItems: StoreItem[] = [];
  private userBalance: UserBalance = {
    fuel: 0,
    premium: 0,
    lastUpdated: new Date().toISOString(),
  };
  private purchaseHistory: PurchaseHistory[] = [];

  // ==================== STORE ITEMS ====================

  /**
   * Get all store items
   */
  async getStoreItems(): Promise<StoreItem[]> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/store/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.storeItems = response.data.items || response.data;
      return this.storeItems;
    } catch (error) {
      console.error("❌ Error loading store items:", error);
      // Return fallback items if API fails
      return this.generateFallbackItems();
    }
  }

  /**
   * Generate fallback store items when API fails
   */
  private generateFallbackItems(): StoreItem[] {
    return [
      {
        id: "fuel-basic-50",
        name: "50 Fuel Points",
        description: "Boost pentru mai multe swipe-uri",
        category: "fuel",
        subcategory: "fuel-packs",
        price: 100,
        currency: "fuel",
        icon: "🔥",
        features: ["50 Fuel Points", "Instant delivery"],
        active: false,
        purchased: false,
      },
      {
        id: "super-like-pack",
        name: "Super Like Pack",
        description: "Să îți remarce cineva profilul",
        category: "premium",
        subcategory: "boosts",
        price: 5,
        currency: "premium",
        icon: "⭐",
        features: ["5 Super Likes", "Highlighted profile"],
        active: false,
        purchased: false,
      },
    ] as StoreItem[];
  }

  /**
   * Get store items by category
   */
  getItemsByCategory(category: "fuel" | "premium"): StoreItem[] {
    return this.storeItems.filter((item) => item.category === category);
  }

  /**
   * Get store items by subcategory
   */
  getItemsBySubcategory(subcategory: string): StoreItem[] {
    return this.storeItems.filter((item) => item.subcategory === subcategory);
  }

  // ==================== USER BALANCE ====================

  /**
   * Get user's current balance
   */
  async getUserBalance(): Promise<UserBalance> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/fuel/wallet", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      this.userBalance = {
        fuel: response.data.balance || 0,
        premium: response.data.premiumBalance || 0,
        lastUpdated: new Date().toISOString(),
      };

      return this.userBalance;
    } catch (error) {
      console.error("❌ Error fetching user balance:", error);
      return {
        fuel: 0,
        premium: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  /**
   * Get cached balance
   */
  getCachedBalance(): UserBalance {
    return this.userBalance;
  }

  // ==================== PURCHASES ====================

  /**
   * Purchase an item
   */
  async purchaseItem(
    itemId: string
  ): Promise<{ success: boolean; message: string; item?: StoreItem }> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/store/purchase",
        {
          itemId: itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update local balance
        this.userBalance = response.data.newBalance;

        // Update store items to reflect purchase
        await this.getStoreItems();

        return {
          success: true,
          message: response.data.message || "Item purchased successfully!",
          item: response.data.item,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Purchase failed",
        };
      }
    } catch (error: any) {
      console.error("❌ Error purchasing item:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error purchasing item",
      };
    }
  }

  /**
   * Get purchase history
   */
  async getPurchaseHistory(): Promise<PurchaseHistory[]> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/users/me/purchase-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.purchaseHistory = response.data.history || response.data;
      return this.purchaseHistory;
    } catch (error) {
      console.error("❌ Error loading purchase history:", error);
      return this.purchaseHistory;
    }
  }

  // ==================== ACTIVE ITEMS ====================

  /**
   * Get user's active items
   */
  async getActiveItems(): Promise<StoreItem[]> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/store/active-items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.items || response.data;
    } catch (error) {
      console.error("❌ Error loading active items:", error);
      return [];
    }
  }

  /**
   * Activate an item
   */
  async activateItem(
    itemId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/store/activate",
        {
          itemId: itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: response.data.success || true,
        message: response.data.message || "Item activated successfully!",
      };
    } catch (error: any) {
      console.error("❌ Error activating item:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error activating item",
      };
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Initialize store with fresh data
   */
  async refreshStore(): Promise<void> {
    await Promise.all([
      this.getStoreItems(),
      this.getUserBalance(),
      this.getPurchaseHistory(),
    ]);
  }

  /**
   * Check if user can afford an item
   */
  canAfford(item: StoreItem): boolean {
    if (item.currency === "fuel") {
      return this.userBalance.fuel >= item.price;
    } else {
      return this.userBalance.premium >= item.price;
    }
  }

  /**
   * Get formatted price
   */
  getFormattedPrice(item: StoreItem): string {
    const currency = item.currency === "fuel" ? "⛽" : "💎";
    return `${item.price} ${currency}`;
  }

  /**
   * Check if item is on cooldown
   */
  isOnCooldown(item: StoreItem): boolean {
    if (!item.cooldownUntil) return false;
    return new Date(item.cooldownUntil) > new Date();
  }

  /**
   * Get remaining cooldown time in human readable format
   */
  getCooldownTime(item: StoreItem): string | null {
    if (!this.isOnCooldown(item)) return null;

    const now = new Date().getTime();
    const cooldownTime = new Date(item.cooldownUntil!).getTime();
    const diff = cooldownTime - now;

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  }

  // ==================== STORE ACTIONS (NEW) ====================

  /**
   * Send Super Like with store item consumption
   */
  async sendSuperLike(
    targetUserId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/store/actions/super-like",
        {
          targetUserId: targetUserId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: response.data.success || true,
        message: response.data.message || "Super like sent successfully!",
      };
    } catch (error: any) {
      console.error("❌ Error sending super like:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error sending super like",
      };
    }
  }

  /**
   * Activate Profile Boost
   */
  async activateProfileBoost(
    boostType: "spotlight-30min" | "boost-3h" | "super-boost-1h"
  ): Promise<{ success: boolean; message: string }> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/store/actions/profile-boost/${boostType}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: response.data.success || true,
        message:
          response.data.message || "Profile boost activated successfully!",
      };
    } catch (error: any) {
      console.error("❌ Error activating boost:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error activating boost",
      };
    }
  }

  /**
   * Reveal who liked me
   */
  async revealLikes(): Promise<{
    success: boolean;
    message: string;
    likedUsers?: any[];
  }> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/store/actions/reveal-likes",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: response.data.success || true,
        message: response.data.message || "Likes revealed successfully!",
        likedUsers: response.data.likedUsers || response.data.users || [],
      };
    } catch (error: any) {
      console.error("❌ Error revealing likes:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error revealing likes",
      };
    }
  }

  /**
   * Rewind last swipe
   */
  async rewindLastSwipe(): Promise<{ success: boolean; message: string }> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/store/actions/swipe-rewind",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: response.data.success || true,
        message: response.data.message || "Swipe rewound successfully!",
      };
    } catch (error: any) {
      console.error("❌ Error rewinding swipe:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error rewinding swipe",
      };
    }
  }

  /**
   * Refresh swipe zone
   */
  async refreshSwipeZone(): Promise<{ success: boolean; message: string }> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/store/actions/refresh-swipe-zone",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: response.data.success || true,
        message: response.data.message || "Swipe zone refreshed successfully!",
      };
    } catch (error: any) {
      console.error("❌ Error refreshing swipe zone:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error refreshing swipe zone",
      };
    }
  }

  /**
   * Get active store features for current user
   */
  async getActiveStoreFeatures(): Promise<{
    success: boolean;
    features: any[];
  }> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/store/actions/active-items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        success: true,
        features:
          response.data.features || response.data.items || response.data || [],
      };
    } catch (error: any) {
      console.error("❌ Error getting active features:", error);
      return {
        success: false,
        features: [],
      };
    }
  }

  /**
   * Check if item is fully implemented
   */
  isItemImplemented(itemId: string): boolean {
    // Items that are fully implemented with working backend logic
    const implementedItems = [
      "profile_frame_basic",
      "profile-boost-1h",
      "profile-boost-6h",
      "super-boost-24h",
      "spotlight-boost-1h",
      "silver-profile-frame",
      "fire-profile-frame",
      "bronze-profile-frame",
      "profile_frame_emerald",
      "profile_frame_platinum",
      "profile_frame_legendary_phoenix",
      "gold-profile-frame",
      "diamond-profile-frame",
      "rainbow-profile-frame",
      "profile_frame_premium_mystic",
      "profile_frame_premium_cosmic",
      "super-like-single",
      "super-like-3pack",
      "super-like-5pack",
      "super-like-10pack",
      "swipe-rewind-single",
      "swipe-rewind-5pack",
    ];

    return implementedItems.includes(itemId);
  }
}

// Export singleton instance
export const storeService = new StoreService();
export default storeService;
