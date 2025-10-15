import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { storeService } from "../services/storeService";

interface PowerUpContextType {
  // State
  isBoostActive: boolean;
  isSpotlightActive: boolean;
  isSeeWhoLikedActive: boolean;
  superLikesRemaining: number;
  rewindsRemaining: number;
  loading: boolean;
  error: string | null;

  // Profile Frame State
  powerUpState: {
    activeProfileFrame: string | null;
    activeProfileFrameColor: string | null;
  };

  // Actions
  activateBoost: (
    boostType: "spotlight-30min" | "boost-3h" | "super-boost-1h"
  ) => Promise<boolean>;
  sendSuperLike: (targetUserId: number) => Promise<boolean>;
  revealLikes: () => Promise<{ success: boolean; likedUsers?: any[] }>;
  rewindLastSwipe: () => Promise<boolean>;
  refreshSwipeZone: () => Promise<boolean>;
  refreshActiveFeatures: () => Promise<void>;
  updateProfileFrameColor: (color: string) => Promise<void>;
  clearError: () => void;
}

const PowerUpContext = createContext<PowerUpContextType | undefined>(undefined);

export { PowerUpContext };

export function PowerUpProvider({ children }: { children: React.ReactNode }) {
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [isSpotlightActive, setIsSpotlightActive] = useState(false);
  const [isSeeWhoLikedActive, setIsSeeWhoLikedActive] = useState(false);
  const [superLikesRemaining, setSuperLikesRemaining] = useState(0);
  const [rewindsRemaining, setRewindsRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile Frame State
  const [activeProfileFrame, setActiveProfileFrame] = useState<string | null>(
    null
  );
  const [activeProfileFrameColor, setActiveProfileFrameColor] = useState<
    string | null
  >(null);

  // Load active features on mount
  useEffect(() => {
    refreshActiveFeatures();
  }, []);

  const refreshActiveFeatures = useCallback(async () => {
    try {
      setLoading(true);
      const result = await storeService.getActiveStoreFeatures();

      if (result.success) {
        // Parse active features and update state
        const features = result.features;
        console.log(
          "🔍 [PowerUpContext] All active features received:",
          features
        );
        console.log("🔍 [PowerUpContext] Features count:", features.length);

        // Check for active boosts
        const boostFeature = features.find(
          (f) =>
            f.storeItem?.subcategory === "visibility" &&
            f.isActive &&
            (f.storeItem?.name?.includes("boost") ||
              f.storeItem?.name?.includes("Boost")) &&
            !f.storeItem?.name?.includes("spotlight")
        );
        setIsBoostActive(!!boostFeature);

        // Check for active spotlight
        const spotlightFeature = features.find(
          (f) =>
            f.storeItem?.subcategory === "visibility" &&
            f.isActive &&
            (f.storeItem?.name?.includes("spotlight") ||
              f.storeItem?.name?.includes("Spotlight"))
        );
        setIsSpotlightActive(!!spotlightFeature);

        // Check for see who liked me
        const seeWhoLikedFeature = features.find(
          (f) =>
            f.storeItem?.subcategory === "insight" &&
            f.isActive &&
            (f.storeItem?.name?.includes("see who liked") ||
              f.storeItem?.name?.includes("See Who Liked"))
        );
        setIsSeeWhoLikedActive(!!seeWhoLikedFeature);

        // Count remaining super likes
        const superLikeFeatures = features.filter(
          (f) =>
            f.storeItem?.subcategory === "engagement" && f.usesRemaining > 0
        );
        const totalSuperLikes = superLikeFeatures.reduce(
          (sum, f) => sum + (f.usesRemaining || 0),
          0
        );
        setSuperLikesRemaining(totalSuperLikes);

        // Count remaining rewinds
        const rewindFeatures = features.filter(
          (f) =>
            f.storeItem?.subcategory === "utility" &&
            f.usesRemaining > 0 &&
            !f.storeItem?.name?.includes("see who liked")
        );
        const totalRewinds = rewindFeatures.reduce(
          (sum, f) => sum + (f.usesRemaining || 0),
          0
        );
        setRewindsRemaining(totalRewinds);

        // Check for active profile frames
        const profileFrameFeature = features.find(
          (f) => f.storeItem?.subcategory === "profile_frame" && f.isActive
        );
        if (profileFrameFeature) {
          console.log(
            "🎯 [PowerUpContext] Found active profile frame:",
            profileFrameFeature
          );
          setActiveProfileFrame(
            profileFrameFeature.itemId ||
              profileFrameFeature.storeItem?.itemId ||
              null
          );
          // Set default color if not specified
          setActiveProfileFrameColor(
            profileFrameFeature.metadata?.color || "#facc15"
          );
        } else {
          console.log(
            "🎯 [PowerUpContext] No active profile frame found in features:",
            features
          );
          setActiveProfileFrame(null);
          setActiveProfileFrameColor(null);
        }
      }
    } catch (error) {
      console.error("Error refreshing active features:", error);
      setError("Failed to load active features");
    } finally {
      setLoading(false);
    }
  }, []);

  const activateBoost = useCallback(
    async (boostType: "spotlight-30min" | "boost-3h" | "super-boost-1h") => {
      try {
        setLoading(true);
        setError(null);

        const result = await storeService.activateProfileBoost(boostType);

        if (result.success) {
          // Update state based on boost type
          if (boostType.includes("spotlight")) {
            setIsSpotlightActive(true);
          } else {
            setIsBoostActive(true);
          }

          // Refresh to get updated features
          await refreshActiveFeatures();
          return true;
        } else {
          setError(result.message);
          return false;
        }
      } catch (error) {
        console.error("Error activating boost:", error);
        setError("Failed to activate boost");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refreshActiveFeatures]
  );

  const sendSuperLike = useCallback(
    async (targetUserId: number) => {
      try {
        setLoading(true);
        setError(null);

        const result = await storeService.sendSuperLike(targetUserId);

        if (result.success) {
          // Decrease super likes count
          setSuperLikesRemaining((prev) => Math.max(0, prev - 1));

          // Refresh to get updated counts
          await refreshActiveFeatures();
          return true;
        } else {
          setError(result.message);
          return false;
        }
      } catch (error) {
        console.error("Error sending super like:", error);
        setError("Failed to send super like");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refreshActiveFeatures]
  );

  const revealLikes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await storeService.revealLikes();

      if (result.success) {
        setIsSeeWhoLikedActive(true);
        await refreshActiveFeatures();
        return { success: true, likedUsers: result.likedUsers };
      } else {
        setError(result.message);
        return { success: false };
      }
    } catch (error) {
      console.error("Error revealing likes:", error);
      setError("Failed to reveal likes");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [refreshActiveFeatures]);

  const rewindLastSwipe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await storeService.rewindLastSwipe();

      if (result.success) {
        // Decrease rewinds count
        setRewindsRemaining((prev) => Math.max(0, prev - 1));

        // Refresh to get updated counts
        await refreshActiveFeatures();
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (error) {
      console.error("Error rewinding swipe:", error);
      setError("Failed to rewind swipe");
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshActiveFeatures]);

  const refreshSwipeZone = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await storeService.refreshSwipeZone();

      if (result.success) {
        await refreshActiveFeatures();
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (error) {
      console.error("Error refreshing swipe zone:", error);
      setError("Failed to refresh swipe zone");
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshActiveFeatures]);

  const updateProfileFrameColor = useCallback(async (color: string) => {
    try {
      setLoading(true);
      setError(null);

      // Update the color in state immediately for better UX
      setActiveProfileFrameColor(color);

      // Here you would call an API to save the color preference
      // For now, we'll just update the local state
      console.log("Updating profile frame color to:", color);
    } catch (error) {
      console.error("Error updating profile frame color:", error);
      setError("Failed to update profile frame color");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: PowerUpContextType = {
    // State
    isBoostActive,
    isSpotlightActive,
    isSeeWhoLikedActive,
    superLikesRemaining,
    rewindsRemaining,
    loading,
    error,

    // Profile Frame State
    powerUpState: {
      activeProfileFrame,
      activeProfileFrameColor,
    },

    // Actions
    activateBoost,
    sendSuperLike,
    revealLikes,
    rewindLastSwipe,
    refreshSwipeZone,
    refreshActiveFeatures,
    updateProfileFrameColor,
    clearError,
  };

  return (
    <PowerUpContext.Provider value={value}>{children}</PowerUpContext.Provider>
  );
}

export function usePowerUps(): PowerUpContextType {
  const context = useContext(PowerUpContext);
  if (context === undefined) {
    throw new Error("usePowerUps must be used within a PowerUpProvider");
  }
  return context;
}
