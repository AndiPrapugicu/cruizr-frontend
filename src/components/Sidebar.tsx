import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFuelWallet } from "../hooks/useFuelWallet";
import { useNotifications } from "../contexts/NotificationContext";
import { useTheme } from "../contexts/ThemeContext";
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
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);

  // Check if we're in an individual chat (hide bottom nav on mobile)
  const isInIndividualChat = location.pathname.startsWith('/chat/') && location.pathname !== '/chat';

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
    <div className={`flex w-screen h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} overflow-hidden transition-colors duration-300`}>
      {/* Desktop Sidebar - Hidden on Mobile */}
      <motion.div
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`hidden md:flex ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-xl border-r flex-col h-full transition-colors duration-300`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
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
                <span className={`ml-3 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'gradient-text'}`}>
                  Cruizr
                </span>
              </motion.div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
            >
              <FaBars />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}
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
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {user?.name || "User"}
                </p>
                <div className="flex items-center gap-2">
                  {user?.isVip && (
                    <span className="flex items-center text-yellow-500 text-xs">
                      <FaCrown className="mr-1" />
                      VIP
                    </span>
                  )}
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Level {wallet?.level || 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Quick View */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className={`${theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-50'} rounded-lg p-3`}>
                <div className="flex items-center">
                  <FaFire className="text-orange-500 mr-2" />
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-orange-300' : 'text-gray-600'}`}>Fuel</p>
                    <p className="font-bold text-orange-500">
                      {Math.floor(wallet?.balance || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-lg p-3`}>
                <div className="flex items-center">
                  <FaGem className="text-purple-500 mr-2" />
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-gray-600'}`}>Premium</p>
                    <p className="font-bold text-purple-500">
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
                if (theme === 'dark') {
                  switch (path) {
                    case "/dashboard":
                      return "hover:bg-blue-900/30 hover:text-blue-400";
                    case "/nearby":
                      return "hover:bg-orange-900/30 hover:text-orange-400";
                    case "/likes":
                      return "hover:bg-pink-900/30 hover:text-pink-400";
                    case "/chat":
                      return "hover:bg-green-900/30 hover:text-green-400";
                    case "/profile":
                      return "hover:bg-purple-900/30 hover:text-purple-400";
                    case "/store":
                      return "hover:bg-indigo-900/30 hover:text-indigo-400";
                    case "/badges":
                      return "hover:bg-yellow-900/30 hover:text-yellow-400";
                    default:
                      return "hover:bg-slate-700";
                  }
                }
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
                if (theme === 'dark') {
                  switch (path) {
                    case "/dashboard":
                      return "bg-blue-900/30 text-blue-400";
                    case "/nearby":
                      return "bg-orange-900/30 text-orange-400";
                    case "/likes":
                      return "bg-pink-900/30 text-pink-400";
                    case "/chat":
                      return "bg-green-900/30 text-green-400";
                    case "/profile":
                      return "bg-purple-900/30 text-purple-400";
                    case "/store":
                      return "bg-indigo-900/30 text-indigo-400";
                    case "/badges":
                      return "bg-yellow-900/30 text-yellow-400";
                    default:
                      return "bg-slate-700 text-gray-200";
                  }
                }
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
                      : `${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ${getHoverClass(item.path)}`
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
          <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
            {!collapsed && (
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Quick Actions
              </p>
            )}
            <div className="space-y-2">
              {actionItems.map((item) => {
                const getActionHoverClass = (id: string) => {
                  if (theme === 'dark') {
                    switch (id) {
                      case "polls":
                        return "hover:bg-cyan-900/30 hover:text-cyan-400";
                      default:
                        return "hover:bg-slate-700";
                    }
                  }
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
                    className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ${getActionHoverClass(
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
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
          <div className="space-y-2">
            <motion.button
              onClick={() => navigate("/settings")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <FaCog className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              {!collapsed && <span className="ml-3 font-medium">Settings</span>}
            </motion.button>

            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center p-3 rounded-xl text-red-500 transition-all duration-200 ${theme === 'dark' ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
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
        <header className={`hidden md:block ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm border-b px-4 md:px-8 py-3 md:py-4 shrink-0`}>
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
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors relative`}
                >
                  <FaBell className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-lg`} />
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
                      className={`absolute right-0 mt-2 w-80 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-xl shadow-2xl border z-50`}
                    >
                      <div className={`p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                            Notifications
                          </h3>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
                                className={`p-4 ${theme === 'dark' ? 'hover:bg-slate-700 border-slate-700' : 'hover:bg-gray-50 border-gray-100'} border-b cursor-pointer transition-colors ${
                                  !notif.isRead ? (theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50') : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-8 h-8 ${getBgColor()} rounded-full flex items-center justify-center shrink-0`}>
                                    {getIcon()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} ${!notif.isRead ? 'font-bold' : ''}`}>
                                      {notif.title}
                                    </p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                                      {notif.message}
                                    </p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
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
              <div className={`hidden md:flex items-center gap-4 rounded-lg px-4 py-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-green-500" />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Streak: {wallet?.streakDays || 0}d
                  </span>
                </div>
                <div className={`w-px h-4 ${theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-500" />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Level {wallet?.level || 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Mobile Bottom Navigation - Hidden on Desktop and in individual chat */}
      {!isInIndividualChat && (
        <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t z-50 shadow-2xl safe-area-pb backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex justify-around items-center h-20 px-1">
          {/* Main 4 navigation items */}
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center w-16 transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  active 
                    ? `bg-gradient-to-br ${item.path === '/dashboard' ? 'from-blue-500 to-blue-600' : item.path === '/nearby' ? 'from-orange-500 to-orange-600' : item.path === '/likes' ? 'from-pink-500 to-pink-600' : 'from-green-500 to-green-600'} shadow-lg scale-110` 
                    : theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  <Icon className={`text-xl ${active ? 'text-white' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
                {active && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-current"
                    style={{ color: active ? item.color.replace('text-', '') : 'transparent' }}
                  />
                )}
              </button>
            );
          })}
          
          {/* More Menu Button */}
          <button
            onClick={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
            className="relative flex flex-col items-center justify-center w-16 transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              showMobileMoreMenu 
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg scale-110' 
                : theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}>
              <FaBars className={`text-xl ${showMobileMoreMenu ? 'text-white' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            {showMobileMoreMenu && (
              <motion.div 
                layoutId="activeTab"
                className="absolute -bottom-1 w-1 h-1 rounded-full bg-purple-500"
              />
            )}
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
                className={`fixed bottom-20 left-0 right-0 rounded-t-3xl shadow-2xl z-50 p-6 max-h-[70vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>More Options</h3>
                  <button
                    onClick={() => setShowMobileMoreMenu(false)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition ${theme === 'dark' ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <FaTimes className="text-lg" />
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
      )}
    </div>
  );
};

export default Sidebar;
