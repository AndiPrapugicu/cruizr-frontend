import api from "./api";
import {
  FuelWallet,
  FuelTransaction,
  FuelEarnReason,
  FuelSpendReason,
} from "../types";

export interface FuelEarnConfig {
  [key: string]: {
    baseAmount: number;
    maxDaily: number;
    levelMultiplier?: boolean;
    streakMultiplier?: number;
    description: string;
  };
}

export interface FuelStats {
  totalUsers: number;
  totalFuelEarned: number;
  averageBalance: number;
  topEarners: Array<{
    userId: number;
    name: string;
    totalEarned: number;
    level: number;
  }>;
}

class FuelWalletService {
  private static instance: FuelWalletService;
  private wallet: FuelWallet | null = null;

  private constructor() {}

  static getInstance(): FuelWalletService {
    if (!FuelWalletService.instance) {
      FuelWalletService.instance = new FuelWalletService();
    }
    return FuelWalletService.instance;
  }

  // Get current wallet
  async getWallet(): Promise<FuelWallet> {
    if (!this.wallet) {
      const response = await api.get("/fuel/wallet");

      this.wallet = response.data;
    }
    return this.wallet!;
  }

  // Refresh wallet data
  async refreshWallet(): Promise<FuelWallet> {
    const response = await api.get("/fuel/wallet");

    this.wallet = response.data;

    return this.wallet!;
  }

  // Get transaction history
  async getTransactions(
    page = 1,
    limit = 20
  ): Promise<{
    transactions: FuelTransaction[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await api.get(
      `/fuel/transactions?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  // Earn fuel points
  async earnFuel(
    reason: FuelEarnReason,
    amount?: number,
    metadata?: Record<string, unknown>
  ): Promise<{
    success: boolean;
    amountEarned: number;
    newBalance: number;
    transaction: FuelTransaction;
  }> {
    const response = await api.post("/fuel/earn", {
      reason,
      amount,
      metadata,
    });

    // Update local wallet if successful
    if (response.data.success && this.wallet) {
      this.wallet.balance = response.data.newBalance;
      this.wallet.totalEarned += response.data.amountEarned;
    }

    return response.data;
  }

  // Spend fuel points
  async spendFuel(
    reason: FuelSpendReason,
    amount: number,
    metadata?: Record<string, unknown>
  ): Promise<{
    success: boolean;
    amountSpent: number;
    newBalance: number;
    transaction: FuelTransaction;
  }> {
    const response = await api.post("/fuel/spend", {
      reason,
      amount,
      metadata,
    });

    // Update local wallet if successful
    if (response.data.success && this.wallet) {
      this.wallet.balance = response.data.newBalance;
      this.wallet.totalSpent += response.data.amountSpent;
    }

    return response.data;
  }

  // Check if user can afford something
  canAfford(amount: number): boolean {
    return this.wallet ? this.wallet.balance >= amount : false;
  }

  // Record daily login and earn login bonus
  async recordDailyLogin(): Promise<{
    success: boolean;
    earned: number;
    streakDays: number;
    isNewDay: boolean;
  }> {
    const response = await api.post("/fuel/daily-login");

    // Update local wallet if successful and it's a new day
    if (response.data.success && response.data.isNewDay && this.wallet) {
      this.wallet.balance += response.data.earned;
      this.wallet.streakDays = response.data.streakDays;
      this.wallet.totalEarned += response.data.earned;
    }

    return response.data;
  }

  // Get daily earning limits
  async getDailyLimits(): Promise<{
    [key in FuelEarnReason]?: {
      limit: number;
      earned: number;
      remaining: number;
    };
  }> {
    const response = await api.get("/fuel/daily-limits");
    return response.data;
  }

  // Get fuel stats
  async getStats(): Promise<FuelStats> {
    const response = await api.get("/fuel/stats");
    return response.data;
  }

  // Get leaderboard
  async getLeaderboard(
    type: "balance" | "earned" | "level" = "balance"
  ): Promise<
    Array<{
      rank: number;
      userId: number;
      name: string;
      avatar: string;
      value: number;
      level: number;
    }>
  > {
    const response = await api.get(`/fuel/leaderboard?type=${type}`);
    return response.data;
  }

  // Check daily login bonus
  async checkDailyLogin(): Promise<{
    canClaim: boolean;
    streakDays: number;
    bonusAmount: number;
  }> {
    const response = await api.get("/fuel/daily-login");
    return response.data;
  }

  // Claim daily login bonus
  async claimDailyLogin(): Promise<{
    success: boolean;
    amountEarned: number;
    streakDays: number;
    newBalance: number;
  }> {
    const response = await api.post("/fuel/daily-login");

    // Update local wallet if successful
    if (response.data.success && this.wallet) {
      this.wallet.balance = response.data.newBalance;
      this.wallet.streakDays = response.data.streakDays;
      this.wallet.totalEarned += response.data.amountEarned;
    }

    return response.data;
  }

  // Calculate level from experience
  calculateLevel(experience: number): {
    level: number;
    nextLevelExp: number;
    progress: number;
  } {
    // Level formula: level = floor(sqrt(exp / 100))
    const level = Math.floor(Math.sqrt(experience / 100));
    const nextLevelExp = Math.pow(level + 1, 2) * 100;
    const currentLevelExp = Math.pow(level, 2) * 100;
    const progress =
      ((experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;

    return { level, nextLevelExp, progress };
  }

  // Clear local cache
  clearCache(): void {
    this.wallet = null;
  }
}

export const fuelWalletService = FuelWalletService.getInstance();
