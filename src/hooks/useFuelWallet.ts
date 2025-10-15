import { useState, useEffect, useCallback } from "react";
import { fuelWalletService } from "../services/fuelWallet";
import {
  FuelWallet,
  FuelTransaction,
  FuelEarnReason,
  FuelSpendReason,
} from "../types";

export const useFuelWallet = () => {
  const [wallet, setWallet] = useState<FuelWallet | null>(null);
  const [transactions, setTransactions] = useState<FuelTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load wallet data
  const loadWallet = useCallback(async () => {
    try {
      console.log("🎯 useFuelWallet: Starting to load wallet...");
      setLoading(true);
      setError(null);
      const walletData = await fuelWalletService.getWallet();
      console.log("💼 useFuelWallet: Received wallet data:", walletData);
      setWallet(walletData);
      console.log("✅ useFuelWallet: Wallet state updated");
    } catch (err) {
      console.error("❌ useFuelWallet: Error loading wallet:", err);
      setError(err instanceof Error ? err.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh wallet
  const refreshWallet = useCallback(async () => {
    try {
      console.log("🔄 useFuelWallet: Refreshing wallet...");
      const walletData = await fuelWalletService.refreshWallet();
      console.log("💼 useFuelWallet: Refreshed wallet data:", walletData);
      setWallet(walletData);
      return walletData;
    } catch (err) {
      console.error("❌ useFuelWallet: Error refreshing wallet:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh wallet");
      throw err;
    }
  }, []);

  // Load transactions
  const loadTransactions = useCallback(async (page = 1, limit = 20) => {
    try {
      const result = await fuelWalletService.getTransactions(page, limit);
      if (page === 1) {
        setTransactions(result.transactions);
      } else {
        setTransactions((prev) => [...prev, ...result.transactions]);
      }
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transactions"
      );
      throw err;
    }
  }, []);

  // Earn fuel
  const earnFuel = useCallback(
    async (
      reason: FuelEarnReason,
      amount?: number,
      metadata?: Record<string, unknown>
    ) => {
      try {
        const result = await fuelWalletService.earnFuel(
          reason,
          amount,
          metadata
        );
        if (result.success) {
          setWallet((prev) =>
            prev
              ? {
                  ...prev,
                  balance: result.newBalance,
                  totalEarned: prev.totalEarned + result.amountEarned,
                }
              : null
          );
        }
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to earn fuel");
        throw err;
      }
    },
    []
  );

  // Spend fuel
  const spendFuel = useCallback(
    async (
      reason: FuelSpendReason,
      amount: number,
      metadata?: Record<string, unknown>
    ) => {
      try {
        const result = await fuelWalletService.spendFuel(
          reason,
          amount,
          metadata
        );
        if (result.success) {
          setWallet((prev) =>
            prev
              ? {
                  ...prev,
                  balance: result.newBalance,
                  totalSpent: prev.totalSpent + result.amountSpent,
                }
              : null
          );
        }
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to spend fuel");
        throw err;
      }
    },
    []
  );

  // Record daily login
  const recordDailyLogin = useCallback(async () => {
    try {
      const result = await fuelWalletService.recordDailyLogin();
      if (result.success && result.isNewDay) {
        // Refresh wallet to get updated streak and balance
        await refreshWallet();
      }
      return result;
    } catch (err) {
      console.error("❌ Error recording daily login:", err);
      throw err;
    }
  }, [refreshWallet]);

  // Check if can afford
  const canAfford = useCallback(
    (amount: number): boolean => {
      return wallet ? wallet.balance >= amount : false;
    },
    [wallet]
  );

  // Get daily limits
  const getDailyLimits = useCallback(async () => {
    try {
      return await fuelWalletService.getDailyLimits();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get daily limits"
      );
      throw err;
    }
  }, []);

  // Check daily login
  const checkDailyLogin = useCallback(async () => {
    try {
      return await fuelWalletService.checkDailyLogin();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check daily login"
      );
      throw err;
    }
  }, []);

  // Claim daily login
  const claimDailyLogin = useCallback(async () => {
    try {
      const result = await fuelWalletService.claimDailyLogin();
      if (result.success) {
        setWallet((prev) =>
          prev
            ? {
                ...prev,
                balance: result.newBalance,
                streakDays: result.streakDays,
                totalEarned: prev.totalEarned + result.amountEarned,
              }
            : null
        );
      }
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to claim daily login"
      );
      throw err;
    }
  }, []);

  // Initialize
  useEffect(() => {
    console.log("🚀 useFuelWallet: useEffect triggered, calling loadWallet()");
    loadWallet();
  }, [loadWallet]);

  return {
    wallet,
    transactions,
    loading,
    error,
    loadWallet,
    refreshWallet,
    loadTransactions,
    earnFuel,
    spendFuel,
    recordDailyLogin,
    canAfford,
    getDailyLimits,
    checkDailyLogin,
    claimDailyLogin,
    clearError: () => setError(null),
  };
};
