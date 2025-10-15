import api from "./api";
import { StoreItem, UserInventory } from "../types";

export interface PurchaseResult {
  success: boolean;
  message: string;
  item?: StoreItem;
  newBalance?: number;
  transaction?: {
    id: number;
    amount: number;
    currency: "fuel" | "premium";
  };
}

class StoreService {
  private static instance: StoreService;
  private storeItems: StoreItem[] = [];
  private userInventory: UserInventory[] = [];

  private constructor() {}

  static getInstance(): StoreService {
    if (!StoreService.instance) {
      StoreService.instance = new StoreService();
    }
    return StoreService.instance;
  }

  // Get all store items
  async getStoreItems(category?: string): Promise<StoreItem[]> {
    const url = category ? `/store/items?category=${category}` : "/store/items";
    const response = await api.get(url);
    this.storeItems = response.data;
    return response.data;
  }

  // Get specific store item
  async getStoreItem(itemId: string): Promise<StoreItem> {
    const response = await api.get(`/store/items/${itemId}`);
    return response.data;
  }

  // Get user inventory
  async getUserInventory(): Promise<UserInventory[]> {
    const response = await api.get("/store/inventory");
    this.userInventory = response.data;
    return response.data;
  }

  // Get user balance
  async getUserBalance(): Promise<{ fuel: number; premium: number }> {
    try {
      const response = await api.get("/fuel/wallet");
      return {
        fuel: response.data.balance || 0,
        premium: response.data.premiumBalance || 0,
      };
    } catch (error) {
      console.error("Error fetching user balance:", error);
      return { fuel: 0, premium: 0 };
    }
  }

  // Purchase item
  async purchaseItem(itemId: string): Promise<PurchaseResult> {
    const response = await api.post("/store/purchase", {
      itemId,
    });

    // Refresh inventory after purchase
    if (response.data.success) {
      await this.getUserInventory();
    }

    return response.data;
  }

  // Activate item
  async activateItem(inventoryItem: any): Promise<{
    success: boolean;
    message: string;
    activeUntil?: string;
  }> {
    // Determine the correct itemId to send
    const itemIdToSend =
      inventoryItem.storeItem?.itemId ||
      inventoryItem.itemId ||
      inventoryItem.storeItem?.id ||
      inventoryItem.id;

    if (!itemIdToSend) {
      console.error(
        "❌ [activateItem] No itemId found in inventoryItem:",
        inventoryItem
      );
      throw new Error("Cannot activate item: no itemId found");
    }

    const payload = { itemId: itemIdToSend };

    const response = await api.post("/store/activate", payload);

    // Refresh inventory after activation
    if (response.data.success) {
      await this.getUserInventory();
    }

    return response.data;
  }

  // Deactivate item
  async deactivateItem(inventoryItem: any): Promise<{
    success: boolean;
    message: string;
  }> {
    // Determine the correct itemId to send
    const itemIdToSend =
      inventoryItem.storeItem?.itemId ||
      inventoryItem.itemId ||
      inventoryItem.storeItem?.id ||
      inventoryItem.id;

    if (!itemIdToSend) {
      console.error(
        "❌ [deactivateItem] No itemId found in inventoryItem:",
        inventoryItem
      );
      throw new Error("Cannot deactivate item: no itemId found");
    }

    const payload = { itemId: itemIdToSend };

    const response = await api.post("/store/deactivate", payload);

    // Refresh inventory after deactivation
    if (response.data.success) {
      await this.getUserInventory();
    }

    return response.data;
  }

  // Use consumable item
  async useItem(inventoryId: number): Promise<{
    success: boolean;
    message: string;
    remainingUses?: number;
  }> {
    const response = await api.post(`/store/use/${inventoryId}`);

    // Refresh inventory after use
    if (response.data.success) {
      await this.getUserInventory();
    }

    return response.data;
  }

  // Check if user owns item
  ownsItem(itemId: string): boolean {
    return this.userInventory.some(
      (inventory) => inventory?.storeItem && inventory.itemId === itemId
    );
  }

  // Check if item is active
  isItemActive(itemId: string): boolean {
    const inventory = this.userInventory.find(
      (inv) => inv?.storeItem && inv.itemId === itemId
    );
    return inventory?.isActive || false;
  }

  // Use consumable item
  async useConsumableItem(
    inventoryId: number,
    metadata?: Record<string, unknown>
  ): Promise<{
    success: boolean;
    message: string;
    effect?: string;
    newBalance?: number;
  }> {
    const response = await api.post(
      `/store/use/${inventoryId}`,
      metadata || {}
    );

    // Refresh inventory after use
    if (response.data.success) {
      await this.getUserInventory();
    }

    return response.data;
  }

  // Get active items
  getActiveItems(): UserInventory[] {
    return this.userInventory.filter((inventory) => inventory.isActive);
  }

  // Get items by category
  getItemsByCategory(category: string): StoreItem[] {
    return this.storeItems.filter((item) => item.category === category);
  }

  // Get purchase history
  async getPurchaseHistory(): Promise<
    Array<{
      id: number;
      item: StoreItem;
      purchaseDate: string;
      amount: number;
      currency: "fuel" | "premium";
    }>
  > {
    const response = await api.get("/store/purchase-history");
    return response.data;
  }

  // Get store stats
  async getStoreStats(): Promise<{
    totalPurchases: number;
    totalSpent: number;
    favoriteCategory: string;
    activeItems: number;
  }> {
    const response = await api.get("/store/stats");
    return response.data;
  }

  // Get featured items
  async getFeaturedItems(): Promise<StoreItem[]> {
    const response = await api.get("/store/featured");
    return response.data;
  }

  // Get daily deals
  async getDailyDeals(): Promise<StoreItem[]> {
    const response = await api.get("/store/daily-deals");
    return response.data;
  }

  // Delete expired inventory item
  async deleteInventoryItem(inventoryItemId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.delete(`/store/inventory/${inventoryItemId}`);

    // Refresh inventory after deletion
    if (response.data.success) {
      await this.getUserInventory();
    }

    return response.data;
  }

  // Clear cache
  clearCache(): void {
    this.storeItems = [];
    this.userInventory = [];
  }
}

export const storeService = StoreService.getInstance();
