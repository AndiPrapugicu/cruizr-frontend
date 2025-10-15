// Badge Types
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirements: string;
  isUnlocked?: boolean;
  progress?: number;
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

export enum BadgeCategory {
  CARS = "cars",
  SOCIAL = "social",
  ACTIVITY = "activity",
  ACHIEVEMENTS = "achievements",
  SPECIAL = "special",
}

export enum BadgeRarity {
  COMMON = "common",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
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
  type: FuelTransactionType;
  amount: number;
  reason: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export enum FuelTransactionType {
  EARN = "earn",
  SPEND = "spend",
}

export enum FuelEarnReason {
  MUTUAL_LIKE = "mutual_like",
  NEW_MATCH = "new_match",
  FIRST_MESSAGE = "first_message",
  MESSAGE_STREAK = "message_streak",
  PROFILE_COMPLETE = "profile_complete",
  ADD_CAR = "add_car",
  ADD_PHOTO = "add_photo",
  ADD_VIDEO = "add_video",
  ADD_MODIFICATION = "add_modification",
  UNLOCK_BADGE = "unlock_badge",
  RARE_BADGE = "rare_badge",
  LEGENDARY_BADGE = "legendary_badge",
  DAILY_LOGIN = "daily_login",
  WEEKLY_STREAK = "weekly_streak",
  MONTHLY_STREAK = "monthly_streak",
  CAR_REVIEW = "car_review",
  GARAGE_TOUR = "garage_tour",
  CONTEST_WIN = "contest_win",
  REFERRAL = "referral",
  SPECIAL_EVENT = "special_event",
}

export enum FuelSpendReason {
  BUY_SUPERLIKE = "buy_superlike",
  BUY_BOOST = "buy_boost",
  BUY_REWIND = "buy_rewind",
  BUY_PASSPORT = "buy_passport",
  UNLOCK_PREMIUM_FILTER = "unlock_premium_filter",
  BUY_PREMIUM_BADGE = "buy_premium_badge",
  UNLOCK_SPECIAL_FEATURE = "unlock_special_feature",
  GARAGE_UPGRADE = "garage_upgrade",
  CUSTOM_PLATE = "custom_plate",
  SPECIAL_EFFECT = "special_effect",
}

// Store Types
export interface StoreItem {
  id: number;
  itemId: string;
  name: string;
  description: string;
  price: number;
  currency: "fuel" | "premium";
  category: string;
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
  category: PollCategory;
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

export enum PollCategory {
  CARS = "cars",
  GENERAL = "general",
  DATING = "dating",
  AUTOMOTIVE = "automotive",
}

export interface PollVote {
  id: number;
  pollId: number;
  optionId: number;
  userId: number;
  createdAt: string;
}
