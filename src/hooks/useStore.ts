import { useState, useEffect, useCallback } from "react";
import { storeService } from "../services/store";
import {
  paymentService,
  PaymentMethod,
  PaymentResult,
} from "../services/paymentService";
import { StoreItem, UserInventory } from "../types";

export const useStore = (userId?: number) => {
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [userInventory, setUserInventory] = useState<UserInventory[]>([]);
  const [userBalance, setUserBalance] = useState({ fuel: 0, premium: 0 });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Load store items
  const loadStoreItems = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      const items = await storeService.getStoreItems(category);
      setStoreItems(items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load store items"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user inventory
  const loadInventory = useCallback(async () => {
    if (!userId) return;

    try {
      const inventory = await storeService.getUserInventory();
      setUserInventory(inventory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    }
  }, [userId]);

  // Purchase item with payment support
  const handlePurchase = async (
    itemId: string,
    quantity: number = 1,
    paymentMethodId?: string
  ) => {
    setPurchasing(itemId);
    setError(null);
    setPurchaseError(null);

    try {
      let result;

      if (paymentMethodId) {
        // Real money purchase
        result = await paymentService.purchaseWithStoredMethod(
          itemId,
          quantity,
          paymentMethodId
        );
      } else {
        // Regular fuel/premium purchase
        result = await storeService.purchaseItem(itemId);
      }

      if (result.success) {
        const message = (result as any).message || "Purchase successful!";
        setPurchaseSuccess(message);
        // Refresh store data after purchase
        await Promise.all([
          loadStoreItems(),
          loadInventory(),
          loadBalance(),
          loadPaymentMethods(),
        ]);
        return { success: true, message };
      } else {
        const message = (result as any).message || "Purchase failed";
        setPurchaseError(message);
        return { success: false, message };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to purchase item";
      setPurchaseError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setPurchasing(null);
    }
  };

  // Load user balance
  const loadBalance = useCallback(async () => {
    if (!userId) return;

    try {
      // This would typically come from your user service or fuel wallet service
      const balance = await storeService.getUserBalance();
      setUserBalance(balance);
    } catch (err) {
      console.error("Failed to load balance:", err);
    }
  }, [userId]);

  // Load payment methods
  const loadPaymentMethods = useCallback(async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      console.error("Failed to load payment methods:", err);
    }
  }, []);

  // Clear purchase messages
  const clearPurchaseMessages = useCallback(() => {
    setPurchaseSuccess(null);
    setPurchaseError(null);
  }, []);

  // Refresh store
  const refreshStore = useCallback(async () => {
    await Promise.all([
      loadStoreItems(),
      loadInventory(),
      loadBalance(),
      loadPaymentMethods(),
    ]);
  }, [loadStoreItems, loadInventory, loadBalance, loadPaymentMethods]);

  // Activate item
  const activateItem = useCallback(
    async (inventoryItem: any) => {
      try {
        setError(null);
        const result = await storeService.activateItem(inventoryItem);

        if (result.success) {
          // Refresh inventory after activation
          await loadInventory();
        }

        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to activate item"
        );
        throw err;
      }
    },
    [loadInventory]
  );

  // Deactivate item
  const deactivateItem = useCallback(
    async (inventoryItem: any) => {
      try {
        setError(null);
        const result = await storeService.deactivateItem(inventoryItem);

        if (result.success) {
          // Refresh inventory after deactivation
          await loadInventory();
        }

        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to deactivate item"
        );
        throw err;
      }
    },
    [loadInventory]
  );

  // Check item ownership
  const checkItemOwnership = useCallback((itemId: string): boolean => {
    return storeService.ownsItem(itemId);
  }, []);

  // Check if item is active
  const checkItemActive = useCallback((itemId: string): boolean => {
    return storeService.isItemActive(itemId);
  }, []);

  // Check if can purchase item
  const canPurchase = (itemId: string) => {
    const owned = storeService.ownsItem(itemId);
    if (owned) {
      return { canPurchase: false, reason: "Deja deții acest produs" };
    }

    // Additional checks can be added here (balance, requirements, etc.)
    return { canPurchase: true, reason: "" };
  };

  // Get item quantity
  const getItemQuantity = (itemId: string) => {
    const inventoryItem = userInventory.find((item) => item.itemId === itemId);
    return inventoryItem?.usesRemaining || inventoryItem?.quantity || 0;
  };

  // Get active items
  const getActiveItems = useCallback((): UserInventory[] => {
    return storeService.getActiveItems();
  }, []);

  // Get featured items
  const getFeaturedItems = useCallback(async () => {
    try {
      return await storeService.getFeaturedItems();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load featured items"
      );
      return [];
    }
  }, []);

  // Get daily deals
  const getDailyDeals = useCallback(async () => {
    try {
      return await storeService.getDailyDeals();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load daily deals"
      );
      return [];
    }
  }, []);

  // Refresh store items
  const refreshStoreItems = useCallback(() => {
    return loadStoreItems();
  }, [loadStoreItems]);

  // Refresh inventory
  const refreshInventory = useCallback(() => {
    return loadInventory();
  }, [loadInventory]);

  // Use item
  const useItem = useCallback(
    async (inventoryId: number) => {
      try {
        setLoading(true);
        const result = await storeService.useItem(inventoryId);
        if (result.success) {
          await loadInventory(); // Refresh inventory
        }
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to use item");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadInventory]
  );

  // Delete inventory item
  const deleteInventoryItem = useCallback(
    async (inventoryId: number) => {
      try {
        setLoading(true);
        const result = await storeService.deleteInventoryItem(inventoryId);
        if (result.success) {
          await loadInventory(); // Refresh inventory
          setPurchaseSuccess("Item deleted successfully");
        }
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete item";
        setError(errorMessage);
        setPurchaseError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadInventory]
  );

  // Initialize
  useEffect(() => {
    loadStoreItems();
    if (userId) {
      loadInventory();
      loadBalance();
      loadPaymentMethods();
    }
  }, [loadStoreItems, loadInventory, loadBalance, loadPaymentMethods, userId]);

  return {
    storeItems,
    userInventory,
    userBalance,
    paymentMethods,
    loading,
    error,
    purchasing,
    purchaseSuccess,
    purchaseError,
    purchaseItem: handlePurchase,
    activateItem,
    deactivateItem,
    useItem,
    deleteInventoryItem,
    checkItemOwnership,
    checkItemActive,
    canPurchaseItem: canPurchase,
    getItemQuantity,
    getActiveItems,
    getFeaturedItems,
    getDailyDeals,
    refreshStoreItems,
    refreshInventory,
    refreshStore,
    clearPurchaseMessages,
    clearError: () => setError(null),
  };
};
