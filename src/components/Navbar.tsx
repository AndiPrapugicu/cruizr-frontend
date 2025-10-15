import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  Cog6ToothIcon,
  FireIcon,
  BellIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
  UserIcon as UserSolid,
  FireIcon as FireSolid,
} from "@heroicons/react/24/solid";
import { useNotifications } from "../contexts/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: FireIcon, // We'll use a different icon if you want
      activeIcon: FireSolid,
    },
    {
      name: "Discover",
      path: "/nearby",
      icon: FireIcon,
      activeIcon: FireSolid,
    },
    {
      name: "Likes",
      path: "/likes",
      icon: HeartIcon,
      activeIcon: HeartSolid,
    },
    {
      name: "Chat",
      path: "/chat",
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatSolid,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserIcon,
      activeIcon: UserSolid,
    },
  ];

  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      (path === "/nearby" && location.pathname === "/")
    );
  };

  return (
    <div className={`bg-white shadow-lg ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-gray-800">CarMatch</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <button className="p-2 text-gray-600 hover:text-pink-500 transition-colors">
            <MagnifyingGlassIcon className="w-6 h-6" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-2 text-gray-600 hover:text-pink-500 transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* Settings */}
          <button
            className="p-2 text-gray-600 hover:text-pink-500 transition-colors"
            onClick={() => navigate("/settings")}
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const IconComponent = active ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                active
                  ? "text-pink-500 bg-pink-50"
                  : "text-gray-600 hover:text-pink-500 hover:bg-gray-50"
              }`}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
              {item.name === "Chat" && unreadCount > 0 && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
