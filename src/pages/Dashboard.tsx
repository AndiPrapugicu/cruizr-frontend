import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaFire,
  FaGem,
  FaStore,
  FaStar,
  FaVoteYea,
  FaChartLine,
  FaCrown,
  FaBolt,
  FaRocket,
} from "react-icons/fa";
import { Flame } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useFuelWallet } from "../hooks/useFuelWallet";
import { useBadges } from "../hooks/useBadges";
import MiniPremium from "../components/MiniPremium";
import BadgeDisplay from "../components/BadgeDisplay";
import MiniStore from "../components/MiniStore";
import MiniPolls from "../components/MiniPolls";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    wallet, 
    transactions,
    loading: walletLoading, 
    recordDailyLogin, 
    loadTransactions,
  } = useFuelWallet();
  const { userBadges, loading: badgesLoading } = useBadges(user?.userId);

  const [showStore, setShowStore] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [dailyLoginClaimed, setDailyLoginClaimed] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState(0);

  // Record daily login when component mounts
  useEffect(() => {
    const handleDailyLogin = async () => {
      if (user && recordDailyLogin) {
        try {
          const result = await recordDailyLogin();
          if (result.isNewDay && result.earned > 0) {
            setDailyLoginClaimed(true);
            setClaimedAmount(result.earned);
            // Show success message
            setTimeout(() => setDailyLoginClaimed(false), 5000);
          }
        } catch (error) {
          console.error("Failed to record daily login:", error);
        }
      }
    };
    
    handleDailyLogin();
  }, [user, recordDailyLogin]);

  // Load recent transactions
  useEffect(() => {
    if (user && loadTransactions) {
      loadTransactions(1, 10);
    }
  }, [user, loadTransactions]);

  if (walletLoading || badgesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 p-4 sm:p-6 pb-24 md:pb-6">
      {/* Daily Login Success Notification */}
      {dailyLoginClaimed && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 left-4 sm:left-auto sm:right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-2xl flex items-center space-x-2 sm:space-x-3"
        >
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <FaBolt className="text-yellow-300 text-xl" />
          </div>
          <div>
            <p className="font-bold">Daily Login Bonus!</p>
            <p className="text-sm text-white text-opacity-90 flex items-center">
              +{claimedAmount} Fuel Points earned <Flame className="ml-1 w-4 h-4" />
            </p>
          </div>
        </motion.div>
      )}

      {/* Welcome Header */}
      <div className="mb-4 sm:mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Here's what's happening with your profile today
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-gray-500">
              {new Date().toLocaleDateString("ro-RO", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Fuel Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <FaFire className="text-white text-lg sm:text-xl" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
            Fuel Points
          </h3>
          <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">
            {Math.floor(wallet?.balance || 0)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs sm:text-sm">
              Level {wallet?.level || 1}
            </span>
            <span className="text-gray-500 text-xs sm:text-sm">
              {wallet?.experience || 0} XP
            </span>
          </div>
        </motion.div>

        {/* Premium Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <FaGem className="text-white text-lg sm:text-xl" />
            </div>
            {user?.isVip && (
              <div className="flex items-center bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                <FaCrown className="mr-1" />
                VIP
              </div>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Premium</h3>
          <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
            {Math.floor(wallet?.premiumBalance || 0)}
          </div>
          <div className="text-gray-500 text-xs sm:text-sm">Premium Points</div>
        </motion.div>

        {/* Badges Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <FaStar className="text-white text-lg sm:text-xl" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Badges</h3>
          <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">
            {userBadges.length}
          </div>
          <div className="text-gray-500 text-xs sm:text-sm">Achievements Unlocked</div>
        </motion.div>

        {/* Activity Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <FaChartLine className="text-white text-lg sm:text-xl" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
            Daily Streak
          </h3>
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
            {wallet?.streakDays || 0}
          </div>
          <div className="text-gray-500 text-xs sm:text-sm">Consecutive days</div>
        </motion.div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => setShowStore(true)}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl hover:bg-pink-50 hover:border-pink-200 transition-all text-left group border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaStore className="text-white text-xl sm:text-2xl" />
            </div>
            <FaRocket className="text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity text-lg sm:text-xl" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors mb-2 sm:mb-3">
            Store
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Purchase power-ups, premium badges, and special features with your
            points.
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => setShowPolls(true)}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left group border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaVoteYea className="text-white text-xl sm:text-2xl" />
            </div>
            <FaBolt className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity text-lg sm:text-xl" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-2 sm:mb-3">
            Community Polls
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Participate in community surveys and create your own questions.
          </p>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all text-white"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <FaCrown className="text-yellow-300 text-xl sm:text-2xl" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white">
            Upgrade to Premium
          </h3>
          <p className="text-sm sm:text-base text-white text-opacity-90 mb-4 sm:mb-6 leading-relaxed">
            Unlock exclusive benefits and advanced features.
          </p>
          <button
            className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-purple-600 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold hover:bg-opacity-30 transition-all text-sm sm:text-base"
            onClick={() => setShowPremium(true)}
          >
            Upgrade Now
          </button>
        </motion.div>
      </div>

      {/* Badge Display Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-6 sm:mb-8"
      >
        <BadgeDisplay userId={user?.userId} showTitle={true} maxBadges={12} />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {transactions && transactions.length > 0 ? (
            transactions.slice(0, 5).map((transaction, index) => {
              // Helper to format time ago
              const getTimeAgo = (date: string) => {
                const now = new Date();
                const txDate = new Date(date);
                const diffMs = now.getTime() - txDate.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);

                if (diffMins < 1) return "Just now";
                if (diffMins < 60) return `${diffMins}m ago`;
                if (diffHours < 24) return `${diffHours}h ago`;
                if (diffDays < 7) return `${diffDays}d ago`;
                return txDate.toLocaleDateString();
              };

              // Helper to get icon and color based on transaction type/reason
              const getTransactionDisplay = () => {
                if (transaction.type === "earned") {
                  switch (transaction.reason) {
                    case "daily_login":
                      return {
                        icon: <FaBolt className="text-green-500" />,
                        bg: "bg-green-50",
                        iconBg: "bg-green-100",
                        title: "Daily Login Bonus",
                        description: `+${transaction.amount} Fuel Points`,
                      };
                    case "profile_completed":
                      return {
                        icon: <FaStar className="text-yellow-500" />,
                        bg: "bg-yellow-50",
                        iconBg: "bg-yellow-100",
                        title: "Profile Completed",
                        description: `+${transaction.amount} Fuel Points`,
                      };
                    default:
                      return {
                        icon: <FaBolt className="text-blue-500" />,
                        bg: "bg-blue-50",
                        iconBg: "bg-blue-100",
                        title: "Fuel Earned",
                        description: `+${transaction.amount} Fuel Points`,
                      };
                  }
                } else {
                  // spent
                  return {
                    icon: <FaStore className="text-purple-500" />,
                    bg: "bg-purple-50",
                    iconBg: "bg-purple-100",
                    title: "Purchase",
                    description: `-${transaction.amount} Fuel Points`,
                  };
                }
              };

              const display = getTransactionDisplay();

              return (
                <div key={transaction.id || index} className={`flex items-center gap-3 p-3 ${display.bg} rounded-lg`}>
                  <div className={`w-8 h-8 ${display.iconBg} rounded-full flex items-center justify-center`}>
                    {display.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{display.title}</p>
                    <p className="text-sm text-gray-600">{display.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(transaction.createdAt)}
                  </span>
                </div>
              );
            })
          ) : (
            /* Call to Action if no activity */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRocket className="text-2xl text-pink-500" />
              </div>
              <p className="text-gray-800 font-medium mb-2">
                Start Your Journey!
              </p>
              <p className="text-gray-600 text-sm mb-4">
                Complete your profile and start matching to see activity here
              </p>
              <button
                onClick={() => (window.location.href = "/nearby")}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                Start Discovering
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <MiniStore visible={showStore} onClose={() => setShowStore(false)} />
      <MiniPolls visible={showPolls} onClose={() => setShowPolls(false)} />
      <MiniPremium
        visible={showPremium}
        onClose={() => setShowPremium(false)}
      />
    </div>
  );
};

export default Dashboard;
