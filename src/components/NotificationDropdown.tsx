import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell,
  FaTimes,
  FaHeart,
  FaStar,
  FaFire,
  FaComment,
  FaCheck,
  FaTrash,
} from "react-icons/fa";
import { useNotifications } from "../contexts/NotificationContext";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <FaHeart className="text-pink-500" />;
      case "super-like":
        return <FaStar className="text-yellow-500" />;
      case "match":
        return <FaFire className="text-red-500" />;
      case "message":
        return <FaComment className="text-blue-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Acum";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaBell className="text-lg" />
            <h3 className="text-lg font-semibold">Notificări</h3>
            {unreadCount > 0 && (
              <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="p-3 border-b border-gray-100 flex justify-between">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
            >
              <FaCheck className="text-xs" />
              <span>Marchează toate</span>
            </button>
            <button
              onClick={clearAllNotifications}
              className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center space-x-1"
            >
              <FaTrash className="text-xs" />
              <span>Șterge toate</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-500">Se încarcă...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <FaBell className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nu ai notificări noi</p>
              <p className="text-gray-400 text-sm">
                Când vei primi like-uri sau mesaje, le vei vedea aici
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.5)" }}
                  className={`p-4 cursor-pointer transition-colors relative ${
                    !notification.isRead
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      notification.isRead
                    )
                  }
                >
                  <div className="flex items-start space-x-3">
                    {/* User Photo */}
                    <div className="flex-shrink-0">
                      {notification.userPhoto ? (
                        <img
                          src={notification.userPhoto}
                          alt={notification.userName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-800 truncate flex items-center space-x-2">
                          <span>{notification.title}</span>
                          <span className="text-xs">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Se actualizează automat la fiecare 30 de secunde
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationDropdown;
