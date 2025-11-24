import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFuelWallet } from "../hooks/useFuelWallet";
import { useNotifications } from "../contexts/NotificationContext";
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
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);

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
      {/* Desktop Sidebar - Hidden on Mobile */}
      <motion.div
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex bg-white shadow-xl border-r border-gray-200 flex-col h-full"
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
                  Cruizr
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
                      {Math.floor(wallet?.balance || 0)}
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
                      {Math.floor(wallet?.premiumBalance || 0)}
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
        {/* Top Bar - Desktop only, Mobile has logo in bottom nav */}
        <header className="hidden md:block bg-white shadow-sm border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Search Bar - Desktop only */}
              <div className="max-w-lg">
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <FaBell className="text-gray-600 text-lg" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
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
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <FaBell className="mx-auto text-4xl mb-2 text-gray-300" />
                            <p>No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const getIcon = () => {
                              switch (notif.type) {
                                case 'like':
                                  return <FaHeart className="text-pink-500 text-sm" />;
                                case 'super-like':
                                  return <FaStar className="text-yellow-500 text-sm" />;
                                case 'match':
                                  return <FaHeart className="text-red-500 text-sm" />;
                                case 'message':
                                  return <FaComments className="text-blue-500 text-sm" />;
                                default:
                                  return <FaBell className="text-gray-500 text-sm" />;
                              }
                            };

                            const getBgColor = () => {
                              switch (notif.type) {
                                case 'like':
                                  return 'bg-pink-100';
                                case 'super-like':
                                  return 'bg-yellow-100';
                                case 'match':
                                  return 'bg-red-100';
                                case 'message':
                                  return 'bg-blue-100';
                                default:
                                  return 'bg-gray-100';
                              }
                            };

                            const timeAgo = (timestamp: string) => {
                              const now = new Date();
                              const notifTime = new Date(timestamp);
                              const diffMs = now.getTime() - notifTime.getTime();
                              const diffMins = Math.floor(diffMs / 60000);
                              const diffHours = Math.floor(diffMins / 60);
                              const diffDays = Math.floor(diffHours / 24);

                              if (diffDays > 0) return `${diffDays}d ago`;
                              if (diffHours > 0) return `${diffHours}h ago`;
                              if (diffMins > 0) return `${diffMins}m ago`;
                              return 'Just now';
                            };

                            return (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  if (!notif.isRead) {
                                    markAsRead(notif.id);
                                  }
                                }}
                                className={`p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors ${
                                  !notif.isRead ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-8 h-8 ${getBgColor()} rounded-full flex items-center justify-center shrink-0`}>
                                    {getIcon()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium text-gray-800 ${!notif.isRead ? 'font-bold' : ''}`}>
                                      {notif.title}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                      {notif.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {timeAgo(notif.timestamp)}
                                    </p>
                                  </div>
                                  {!notif.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2"></div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Stats - Hidden on Mobile */}
              <div className="hidden md:flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-2">
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

      {/* Mobile Bottom Navigation - Hidden on Desktop */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg safe-area-pb">
        <div className="flex justify-around items-center h-16 px-2">
          {/* Main 4 navigation items */}
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 transition-colors ${
                  active ? item.color : 'text-gray-400'
                }`}
              >
                <Icon className="text-xl" />
                <span className={`text-xs mt-1 font-medium ${
                  active ? '' : 'text-gray-500'
                }`}>
                  {item.label === 'Dashboard' ? 'Home' : item.label}
                </span>
              </button>
            );
          })}
          
          {/* More Menu Button */}
          <button
            onClick={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 transition-colors ${
              showMobileMoreMenu ? 'text-purple-500' : 'text-gray-400'
            }`}
          >
            <FaBars className="text-xl" />
            <span className={`text-xs mt-1 font-medium ${
              showMobileMoreMenu ? 'text-purple-500' : 'text-gray-500'
            }`}>
              More
            </span>
          </button>
        </div>

        {/* More Menu Popup */}
        <AnimatePresence>
          {showMobileMoreMenu && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setShowMobileMoreMenu(false)}
              />
              
              {/* Menu */}
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-16 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 p-6 max-h-[70vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">More Options</h3>
                  <button
                    onClick={() => setShowMobileMoreMenu(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <FaTimes className="text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Profile */}
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowMobileMoreMenu(false);
                    }}
                    className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition"
                  >
                    <FaUser className="text-purple-500 text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-900">Profile</span>
                  </button>

                  {/* Store */}
                  <button
                    onClick={() => {
                      navigate('/store');
                      setShowMobileMoreMenu(false);
                    }}
                    className="flex flex-col items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition"
                  >
                    <FaStore className="text-indigo-500 text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-900">Store</span>
                  </button>

                  {/* Badges */}
                  <button
                    onClick={() => {
                      navigate('/badges');
                      setShowMobileMoreMenu(false);
                    }}
                    className="flex flex-col items-center p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition"
                  >
                    <FaStar className="text-yellow-500 text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-900">Badges</span>
                  </button>

                  {/* Polls */}
                  <button
                    onClick={() => {
                      navigate('/polls');
                      setShowMobileMoreMenu(false);
                    }}
                    className="flex flex-col items-center p-4 bg-cyan-50 rounded-xl hover:bg-cyan-100 transition"
                  >
                    <FaVoteYea className="text-cyan-500 text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-900">Polls</span>
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowMobileMoreMenu(false);
                    }}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <FaCog className="text-gray-600 text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-900">Settings</span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMoreMenu(false);
                    }}
                    className="flex flex-col items-center p-4 bg-red-50 rounded-xl hover:bg-red-100 transition"
                  >
                    <FaSignOutAlt className="text-red-500 text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-900">Logout</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Sidebar;
