export interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: "fuel" | "premium" | "real_money";
  type: "boost" | "super_like" | "rewind" | "profile_frame" | "special_offer";
  fuelCost?: number;
  premiumCost?: number;
  realMoneyCost?: number;
  features?: string[];
  isPopular?: boolean;
  isLimited?: boolean;
  quantity?: number;
  effects?: {
    duration?: number;
    multiplier?: number;
    uses?: number;
  };
  metadata?: {
    rarity?: "common" | "rare" | "epic" | "legendary";
    tier?: number;
    badge?: string;
  };
}

export interface UserBalance {
  fuel: number;
  premium: number;
  coins?: number;
  tokens?: number;
}

export interface PaymentMethod {
  id: string;
  type: "card";
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  customerId?: string;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  newBalance?: UserBalance;
  item?: StoreItem;
}

export interface StoreState {
  items: StoreItem[];
  balance: UserBalance;
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  purchasing: string | null;
  purchaseSuccess: string | null;
  purchaseError: string | null;
}

export type CategoryType = "fuel" | "premium" | "real_money";
export type SubcategoryType =
  | "all"
  | "boost"
  | "super_like"
  | "rewind"
  | "profile_frame";
