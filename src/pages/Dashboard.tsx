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
import { useAuth } from "../contexts/AuthContext";
import { useFuelWallet } from "../hooks/useFuelWallet";
import { useBadges } from "../hooks/useBadges";
import Store from "../components/Store";
import MiniPremium from "../components/MiniPremium";
import BadgeDisplay from "../components/BadgeDisplay";
import MiniStore from "../components/MiniStore";
import MiniPolls from "../components/MiniPolls";
import Polls from "../components/Polls";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { wallet, loading: walletLoading, recordDailyLogin } = useFuelWallet();
  const { userBadges, loading: badgesLoading } = useBadges(user?.userId);

  const [showStore, setShowStore] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  // Record daily login when component mounts
  useEffect(() => {
    if (user && recordDailyLogin) {
      recordDailyLogin().catch((error) => {
        console.error("Failed to record daily login:", error);
      });
    }
  }, [user, recordDailyLogin]);

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
    <div className="w-full h-full overflow-auto bg-gray-50 p-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Here's what's happening with your profile today
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Fuel Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <FaFire className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Fuel Points
          </h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {wallet?.balance || 0}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">
              Level {wallet?.level || 1}
            </span>
            <span className="text-gray-500 text-sm">
              {wallet?.experience || 0} XP
            </span>
          </div>
        </motion.div>

        {/* Premium Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <FaGem className="text-white text-xl" />
            </div>
            {user?.isVip && (
              <div className="flex items-center bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                <FaCrown className="mr-1" />
                VIP
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Premium</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {wallet?.premiumBalance || 0}
          </div>
          <div className="text-gray-500 text-sm">Premium Points</div>
        </motion.div>

        {/* Badges Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <FaStar className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Badges</h3>
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {userBadges.length}
          </div>
          <div className="text-gray-500 text-sm">Achievements Unlocked</div>
        </motion.div>

        {/* Activity Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <FaChartLine className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Daily Streak
          </h3>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {wallet?.streakDays || 0}
          </div>
          <div className="text-gray-500 text-sm">Consecutive days</div>
        </motion.div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => setShowStore(true)}
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:bg-pink-50 hover:border-pink-200 transition-all text-left group border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaStore className="text-white text-2xl" />
            </div>
            <FaRocket className="text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors mb-3">
            Store
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Purchase power-ups, premium badges, and special features with your
            points.
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => setShowPolls(true)}
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left group border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaVoteYea className="text-white text-2xl" />
            </div>
            <FaBolt className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-3">
            Community Polls
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Participate in community surveys and create your own questions.
          </p>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all text-white"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <FaCrown className="text-yellow-300 text-2xl" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-white">
            Upgrade to Premium
          </h3>
          <p className="text-white text-opacity-90 mb-6 leading-relaxed">
            Unlock exclusive benefits and advanced features.
          </p>
          <button
            className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-purple-500 py-3 px-6 rounded-xl font-semibold hover:bg-yellow-400 hover:text-white-900 transition-all"
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
        className="mb-8"
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
          {/* Daily Login */}
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <FaBolt className="text-green-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Daily Login Bonus</p>
              <p className="text-sm text-gray-600">
                +5 Fuel Points • Streak: {wallet?.streak || 1} days
              </p>
            </div>
            <span className="text-xs text-gray-500">Today</span>
          </div>

          {/* Badge Achievement */}
          {userBadges && userBadges.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaStar className="text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Badge Earned</p>
                <p className="text-sm text-gray-600">
                  Unlocked "{userBadges[userBadges.length - 1]?.name}" badge
                </p>
              </div>
              <span className="text-xs text-gray-500">Recent</span>
            </div>
          )}

          {/* Premium Points */}
          {wallet?.premiumBalance && wallet.premiumBalance > 0 && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FaGem className="text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Premium Balance</p>
                <p className="text-sm text-gray-600">
                  {wallet.premiumBalance} Premium Points available
                </p>
              </div>
              <span className="text-xs text-gray-500">Current</span>
            </div>
          )}

          {/* Call to Action if no activity */}
          {!wallet?.lastActivity &&
            (!userBadges || userBadges.length === 0) && (
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
                  onClick={() => (window.location.href = "/discover")}
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
