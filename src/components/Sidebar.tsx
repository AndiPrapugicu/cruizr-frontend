import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFuelWallet } from "../hooks/useFuelWallet";
import {
  FaHome,
  FaFire,
  FaHeart,
  FaComments,
  FaUser,
  FaStore,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaTimes,
  FaGem,
  FaCrown,
  FaVoteYea,
  FaStar,
  FaChartLine,
  FaBars,
} from "react-icons/fa";

// Helper function to build photo URLs
const getPhotoUrl = (photo: string): string => {
  if (!photo) return "";
  // If photo already starts with http/https, use as is
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }
  // If it's a relative path, prepend the API base URL
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  return photo.startsWith("/") ? `${baseUrl}${photo}` : `${baseUrl}/${photo}`;
};

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { wallet } = useFuelWallet();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    {
      path: "/dashboard",
      icon: FaHome,
      label: "Dashboard",
      color: "text-blue-500",
    },
    {
      path: "/nearby",
      icon: FaFire,
      label: "Discover",
      color: "text-orange-500",
    },
    { path: "/likes", icon: FaHeart, label: "Likes", color: "text-pink-500" },
    {
      path: "/chat",
      icon: FaComments,
      label: "Messages",
      color: "text-green-500",
    },
    {
      path: "/profile",
      icon: FaUser,
      label: "Profile",
      color: "text-purple-500",
    },
    {
      path: "/store",
      icon: FaStore,
      label: "Store",
      color: "text-indigo-500",
    },
    {
      path: "/badges",
      icon: FaStar,
      label: "Badges",
      color: "text-yellow-500",
    },
  ];

  const actionItems = [
    {
      id: "polls",
      icon: FaVoteYea,
      label: "Polls",
      color: "text-cyan-500",
      onClick: () => {
        navigate("/polls");
      },
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex w-screen h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white shadow-xl border-r border-gray-200 flex flex-col h-full"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="ml-3 text-xl font-bold gradient-text">
                  CarMatch
                </span>
              </motion.div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaBars className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 border-b border-gray-100"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                {user?.imageUrl ? (
                  <img
                    src={getPhotoUrl(user.imageUrl)}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                    onLoad={() =>
                      console.log(
                        "🖼️ [Sidebar] Profile image loaded successfully"
                      )
                    }
                    onError={(e) => {
                      console.error(
                        "❌ [Sidebar] Failed to load profile image:",
                        e
                      );
                      console.error(
                        "❌ [Sidebar] Image src was:",
                        e.currentTarget.src
                      );
                    }}
                  />
                ) : (
                  <FaUser className="text-white text-lg" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="font-semibold text-gray-800">
                  {user?.name || "User"}
                </p>
                <div className="flex items-center gap-2">
                  {user?.isVip && (
                    <span className="flex items-center text-yellow-500 text-xs">
                      <FaCrown className="mr-1" />
                      VIP
                    </span>
                  )}
                  <span className="text-gray-500 text-sm">
                    Level {wallet?.level || 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Quick View */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="flex items-center">
                  <FaFire className="text-orange-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-600">Fuel</p>
                    <p className="font-bold text-orange-600">
                      {wallet?.balance || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center">
                  <FaGem className="text-purple-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-600">Premium</p>
                    <p className="font-bold text-purple-600">
                      {wallet?.premiumBalance || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isCurrentActive = isActive(item.path);

              // Define specific hover classes for each item
              const getHoverClass = (path: string) => {
                switch (path) {
                  case "/dashboard":
                    return "hover:bg-blue-50 hover:text-blue-600";
                  case "/nearby":
                    return "hover:bg-orange-50 hover:text-orange-600";
                  case "/likes":
                    return "hover:bg-pink-50 hover:text-pink-600";
                  case "/chat":
                    return "hover:bg-green-50 hover:text-green-600";
                  case "/profile":
                    return "hover:bg-purple-50 hover:text-purple-600";
                  case "/store":
                    return "hover:bg-indigo-50 hover:text-indigo-600";
                  case "/badges":
                    return "hover:bg-yellow-50 hover:text-yellow-600";
                  default:
                    return "hover:bg-gray-100";
                }
              };

              // Define active state classes that match hover colors
              const getActiveClass = (path: string) => {
                switch (path) {
                  case "/dashboard":
                    return "bg-blue-50 text-blue-600";
                  case "/nearby":
                    return "bg-orange-50 text-orange-600";
                  case "/likes":
                    return "bg-pink-50 text-pink-600";
                  case "/chat":
                    return "bg-green-50 text-green-600";
                  case "/profile":
                    return "bg-purple-50 text-purple-600";
                  case "/store":
                    return "bg-indigo-50 text-indigo-600";
                  case "/badges":
                    return "bg-yellow-50 text-yellow-600";
                  default:
                    return "bg-gray-100 text-gray-700";
                }
              };

              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
                    isCurrentActive
                      ? getActiveClass(item.path)
                      : `text-gray-700 ${getHoverClass(item.path)}`
                  }`}
                >
                  <item.icon
                    className={`text-lg ${isCurrentActive ? "" : item.color}`}
                  />
                  {!collapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Action Items */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            {!collapsed && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Quick Actions
              </p>
            )}
            <div className="space-y-2">
              {actionItems.map((item) => {
                const getActionHoverClass = (id: string) => {
                  switch (id) {
                    case "polls":
                      return "hover:bg-cyan-50 hover:text-cyan-600";
                    default:
                      return "hover:bg-gray-100";
                  }
                };

                return (
                  <motion.button
                    key={item.id}
                    onClick={item.onClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center p-3 rounded-xl text-gray-700 transition-all duration-200 ${getActionHoverClass(
                      item.id
                    )}`}
                  >
                    <item.icon className={`text-lg ${item.color}`} />
                    {!collapsed && (
                      <span className="ml-3 font-medium">{item.label}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100">
          <div className="space-y-2">
            <motion.button
              onClick={() => navigate("/settings")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center p-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-all duration-200"
            >
              <FaCog className="text-lg text-gray-500" />
              {!collapsed && <span className="ml-3 font-medium">Settings</span>}
            </motion.button>

            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center p-3 rounded-xl hover:bg-red-50 text-red-600 transition-all duration-200"
            >
              <FaSignOutAlt className="text-lg" />
              {!collapsed && <span className="ml-3 font-medium">Logout</span>}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Search Bar */}
              <div className="max-w-lg">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users, cars, or anything..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <FaBell className="text-gray-600 text-lg" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">
                            Notifications
                          </h3>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {/* Notification items */}
                        <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                              <FaHeart className="text-pink-500 text-sm" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                New like received!
                              </p>
                              <p className="text-xs text-gray-600">
                                Someone liked your profile
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                2 minutes ago
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Add more notification items */}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Streak: {wallet?.streakDays || 0}d
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Level {wallet?.level || 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 h-full overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Sidebar;
