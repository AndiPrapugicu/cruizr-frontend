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

      // Fetch different types of notifications
      const [
        likesResponse,
        superLikesResponse,
        matchesResponse,
        messagesResponse,
      ] = await Promise.all([
        api.get("/matches/received-likes").catch(() => ({ data: [] })),
        api.get("/matches/received-super-likes").catch(() => ({ data: [] })),
        api.get("/matches/recent-matches").catch(() => ({ data: [] })),
        api.get("/messages/unread").catch(() => ({ data: [] })),
      ]);

      const newNotifications: Notification[] = [];

      // Process likes
      likesResponse.data.forEach((like: any) => {
        newNotifications.push({
          id: `like-${like.id}`,
          type: "like",
          title: "New Like! 💕",
          message: `${like.name} liked your profile`,
          userId: like.id,
          userName: like.name,
          userPhoto: like.imageUrl,
          timestamp: like.createdAt || new Date().toISOString(),
          isRead: false,
        });
      });

      // Process super likes
      superLikesResponse.data.forEach((superLike: any) => {
        newNotifications.push({
          id: `super-like-${superLike.id}`,
          type: "super-like",
          title: "Super Like! ⭐",
          message: `${superLike.name} sent you a Super Like!`,
          userId: superLike.id,
          userName: superLike.name,
          userPhoto: superLike.imageUrl,
          timestamp: superLike.receivedAt || new Date().toISOString(),
          isRead: false,
        });
      });

      // Process matches
      matchesResponse.data.forEach((match: any) => {
        newNotifications.push({
          id: `match-${match.id}`,
          type: "match",
          title: "It's a Match! 🎉",
          message: `You and ${match.name} liked each other!`,
          userId: match.userId,
          userName: match.name,
          userPhoto: match.imageUrl,
          timestamp: match.createdAt || new Date().toISOString(),
          isRead: false,
        });
      });

      // Process messages
      messagesResponse.data.forEach((message: any) => {
        newNotifications.push({
          id: `message-${message.id}`,
          type: "message",
          title: "New Message 💬",
          message: `${message.senderName}: ${message.content.substring(0, 50)}${
            message.content.length > 50 ? "..." : ""
          }`,
          userId: message.senderId,
          userName: message.senderName,
          userPhoto: message.senderPhoto,
          timestamp: message.createdAt || new Date().toISOString(),
          isRead: false,
        });
      });

      // Sort by timestamp (newest first)
      newNotifications.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Limit to last 50 notifications
      setNotifications(newNotifications.slice(0, 50));
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

      // TODO: Send to backend if needed
      // await api.patch(`/notifications/${notificationId}/read`);
    } catch (err) {
      console.error("❌ Error marking notification as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      // TODO: Send to backend if needed
      // await api.patch('/notifications/mark-all-read');
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
