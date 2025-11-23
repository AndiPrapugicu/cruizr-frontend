// Badge Types
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color?: string;
  category: string;
  rarity: string;
  requirements: string;
  isUnlocked?: boolean;
  progress?: {
    current: number;
    total: number;
  };
  maxProgress?: number;
  unlockedAt?: string;
}

export interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  unlockedAt: string;
  badge: Badge;
}

// Fuel System Types
export interface FuelWallet {
  id: number;
  userId: number;
  balance: number;
  premiumBalance: number;
  premiumPoints: number;
  totalEarned: number;
  totalSpent: number;
  totalPremiumPurchased: number;
  totalPremiumSpent: number;
  level: number;
  experience: number;
  nextLevelExp: number;
  lastActivity: string;
  streakDays: number;
  lastLoginDate: string;
}

export interface FuelTransaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  reason: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type FuelTransactionType = "earn" | "spend";

export type FuelEarnReason =
  | "mutual_like"
  | "new_match"
  | "first_message"
  | "message_streak"
  | "profile_complete"
  | "add_car"
  | "add_photo"
  | "add_video"
  | "add_modification"
  | "unlock_badge"
  | "rare_badge"
  | "legendary_badge"
  | "daily_login"
  | "weekly_streak"
  | "monthly_streak"
  | "car_review"
  | "garage_tour"
  | "contest_win"
  | "referral"
  | "special_event";

export type FuelSpendReason =
  | "buy_superlike"
  | "buy_boost"
  | "buy_rewind"
  | "buy_passport"
  | "unlock_premium_filter"
  | "buy_premium_badge"
  | "unlock_special_feature"
  | "garage_upgrade"
  | "custom_plate"
  | "special_effect";

// Store Types
export interface StoreItem {
  id: number;
  itemId: string;
  name: string;
  description: string;
  price: number;
  currency: "fuel" | "premium";
  category: string;
  storeCategory?: string; // Real category from database: boosts, likes, customization, etc.
  subcategory?: string; // Subcategory: visibility, engagement, frames, etc.
  type?: string;
  icon?: string;
  duration?: number;
  maxUses?: number;
  isActive?: boolean;
  isPermanent?: boolean;
  isLimited?: boolean;
  isPopular?: boolean;
  limitedQuantity?: number;
  requirements?: string;
  effects?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  features?: string[];
  fuelCost?: number;
  premiumCost?: number;
  realMoneyCost?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserInventory {
  id: number;
  userId: number;
  itemId: string;
  storeItemId: number;
  storeItem: StoreItem;
  purchaseDate: string;
  expiryDate?: string;
  usesRemaining?: number;
  isActive: boolean;
  metadata?: {
    activatedAt?: string;
    totalUsed?: number;
    [key: string]: any;
  };
  updatedAt: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: "text" | "image" | "gif";
  timestamp: string;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  users: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
}

// Poll Types
export interface Poll {
  id: number;
  userId: number;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  category: string;
  user: {
    id: number;
    name: string;
    imageUrl: string;
  };
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
  percentage: number;
  isSelected?: boolean;
}

export type PollCategory = "cars" | "general" | "dating" | "automotive";

export interface PollVote {
  id: number;
  pollId: number;
  optionId: number;
  userId: number;
  createdAt: string;
}
