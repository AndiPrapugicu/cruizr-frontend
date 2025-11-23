import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../services/api";

export interface Notification {
  id: string;
  type: "like" | "super-like" | "match" | "message";
  title: string;
  message: string;
  userId?: number;
  userName?: string;
  userPhoto?: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch notifications from unified endpoint
      const response = await api.get("/notifications");
      
      const backendNotifications = response.data || [];

      // Transform backend notifications to frontend format
      const transformedNotifications: Notification[] = backendNotifications.map(
        (notif: any) => ({
          id: notif.id.toString(),
          type: notif.type,
          title: notif.title,
          message: notif.message,
          userId: notif.fromUserId,
          userName: notif.fromUser?.name,
          userPhoto: notif.imageUrl || notif.fromUser?.imageUrl,
          timestamp: notif.createdAt,
          isRead: notif.isRead,
        })
      );

      setNotifications(transformedNotifications);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state immediately
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );

      // Send to backend
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (err) {
      console.error("❌ Error marking notification as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      
      // Send to backend
      await api.patch('/notifications/read-all');
    } catch (err) {
      console.error("❌ Error marking all notifications as read:", err);
    }
  };

  // Clear specific notification
  const clearNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Fetch notifications on mount and set up periodic refresh
  useEffect(() => {
    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
