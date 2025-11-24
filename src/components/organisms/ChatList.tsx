import React from 'react';
import { motion } from 'framer-motion';
import { UserAvatar } from '../molecules/UserAvatar';
import { Badge } from '../atoms/Badge';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read?: boolean;
}

export interface ChatListItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: ChatMessage;
  unreadCount: number;
  isOnline?: boolean;
  isPinned?: boolean;
}

export interface ChatListProps {
  chats: ChatListItem[];
  onChatClick: (chatId: string) => void;
  activeChat?: string;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Component ChatList - Listă de conversații
 * Responsive cu hover states și badges pentru unread
 */
export const ChatList: React.FC<ChatListProps> = ({
  chats,
  onChatClick,
  activeChat,
  loading = false,
  emptyMessage = 'No messages yet',
  className = '',
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 animate-pulse rounded-xl h-20"
          />
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // Sort: pinned first, then by timestamp
  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
  });

  return (
    <div className={`space-y-1 ${className}`}>
      {sortedChats.map((chat) => {
        const isActive = activeChat === chat.id;

        return (
          <motion.div
            key={chat.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div
              onClick={() => onChatClick(chat.id)}
              className={`
                p-3 md:p-4 rounded-xl cursor-pointer
                transition-all duration-200
                ${isActive
                  ? 'bg-pink-50 border-2 border-pink-500'
                  : 'bg-white hover:bg-gray-50 border-2 border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <UserAvatar
                    src={chat.userAvatar}
                    name={chat.userName}
                    size="md"
                    status={chat.isOnline ? 'online' : 'offline'}
                    showStatus
                  />
                  {chat.isPinned && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                      <span className="text-xs">📌</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-800 truncate text-sm md:text-base">
                      {chat.userName}
                    </h4>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatTime(chat.lastMessage.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm truncate ${
                        chat.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {chat.lastMessage.text}
                    </p>
                    
                    {chat.unreadCount > 0 && (
                      <Badge variant="danger" size="sm" className="ml-2">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
