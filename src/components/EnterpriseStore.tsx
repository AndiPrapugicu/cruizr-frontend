import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFire,
  FaGem,
  FaShoppingCart,
  FaStar,
  FaBolt,
  FaEye,
  FaHeart,
  FaCrown,
  FaTimes,
  FaCheck,
  FaCreditCard,
  FaLock,
  FaShieldAlt,
  FaPlus,
  FaBox,
  FaPlay,
  FaPause,
  FaToggleOn,
  FaToggleOff,
  FaClock,
  FaInfinity,
  FaTools,
  FaTrash,
} from "react-icons/fa";
import { useStore } from "../hooks/useStore";
import { paymentService, PaymentMethod } from "../services/paymentService";
import { StoreItem, UserInventory } from "../types";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "../contexts/AuthContext";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Card element options
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

interface StoreItemCardProps {
  item: StoreItem;
  onPurchase: (
    itemId: string,
    quantity: number,
    paymentMethodId?: string
  ) => void;
  purchasing: boolean;
  userBalance: { fuel: number; premium: number };
  onBuyPremium: () => void;
  userInventory: UserInventory[];
}

// Premium packages for purchase
const premiumPackages = [
  {
    id: "premium_100",
    name: "Premium Starter",
    amount: 100,
    price: 4.99,
    popular: false,
    description: "Perfect for trying premium features",
  },
  {
    id: "premium_500",
    name: "Premium Pack",
    amount: 500,
    price: 19.99,
    popular: true,
    description: "Most popular choice for active users",
  },
  {
    id: "premium_1000",
    name: "Premium Mega",
    amount: 1000,
    price: 34.99,
    popular: false,
    description: "Best value for power users",
  },
  {
    id: "premium_2500",
    name: "Premium Ultimate",
    amount: 2500,
    price: 79.99,
    popular: false,
    description: "Maximum premium experience",
  },
];

// Utility functions for store item status detection
const isItemImplemented = (item: StoreItem): boolean => {
  if (!item?.id) {
    return false;
  }

  // List of IMPLEMENTED item IDs - items that are functional and purchasable
  // All items NOT in this list will show "Feature In Development"
  const implementedItems = [
    // Profile Frames - all working (using REAL database IDs)
    "profile_frame_basic",
    "bronze-profile-frame",
    "silver-profile-frame",
    "profile_frame_platinum",
    "profile_frame_emerald",
    "fire-profile-frame",
    "profile_frame_legendary_phoenix",
    "gold-profile-frame",
    "diamond-profile-frame",
    "rainbow-profile-frame",
    "profile_frame_premium_mystic",
    "profile_frame_premium_cosmic",

    // Boosts - all working
    "profile-boost-1h",
    "profile-boost-6h",
    "super-boost-24h",
    "spotlight-boost-1h",
    "super-boost-1h",
    "boost-3h",
    "spotlight-30min",

    // Super Likes - all working
    "super-like-single",
    "super-like-3pack",
    "super-like-5pack",
    "super-like-10pack",

    // Other working features
    "see-who-liked-1h",
    "see-who-liked-24h",
  ];

  // Return true if item is in the implemented list (will be purchasable)
  return implementedItems.includes(String(item.id));
};
const isItemPermanent = (item: StoreItem): boolean => {
  if (!item?.id) return false;

  // List of permanent items (one-time purchases)
  const permanentItems = [
    "unlimited-likes-lifetime",
    "premium-membership-lifetime",
    "ad-free-lifetime",
  ];

  return permanentItems.includes(String(item.id));
};

const isItemOwnableWithoutCountdown = (item: StoreItem): boolean => {
  if (!item?.id) return false;

  // Items that when owned don't have countdown/duration and show "Owned" status
  // Exclude consumable items like boosts, super likes etc.
  const ownableItems = [
    // Profile Frames - permanent ownership
    "profile_frame_basic",
    "bronze-profile-frame",
    "silver-profile-frame",
    "profile_frame_platinum",
    "profile_frame_emerald",
    "fire-profile-frame",
    "profile_frame_legendary_phoenix",
    "gold-profile-frame",
    "diamond-profile-frame",
    "rainbow-profile-frame",
    "profile_frame_premium_mystic",
    "profile_frame_premium_cosmic",

    // Permanent memberships
    "premium-membership-permanent",
    "vip-status-permanent",
  ];

  return ownableItems.includes(String(item.id));
};

const getItemButtonText = (
  item: StoreItem,
  isOwned: boolean,
  canAfford: boolean
): string => {
  if (!isItemImplemented(item)) {
    return "Feature In Development";
  }

  // Check if item is owned and is ownable without countdown
  if (isOwned && isItemOwnableWithoutCountdown(item)) {
    return "Owned";
  }

  if (isOwned && isItemPermanent(item)) {
    return "Nu se poate cumpăra din nou";
  }

  if (item.realMoneyCost) {
    return "Purchase Now";
  }

  if (item.currency === "premium" && !canAfford) {
    return "Buy Premium";
  }

  return "Purchase Now";
};

const canPurchaseButton = (
  item: StoreItem,
  isOwned: boolean,
  canAfford: boolean
): boolean => {
  if (!isItemImplemented(item)) {
    return false;
  }

  // If item is owned and is ownable without countdown, disable purchase
  if (isOwned && isItemOwnableWithoutCountdown(item)) {
    return false;
  }

  if (isOwned && isItemPermanent(item)) {
    return false;
  }

  if (item.realMoneyCost) {
    return true;
  }

  return canAfford || item.currency === "premium";
};

const getItemButtonIcon = (
  item: StoreItem,
  isOwned: boolean,
  canAfford: boolean
) => {
  if (!isItemImplemented(item)) {
    return <FaTools />;
  }

  // Check if item is owned and is ownable without countdown - show check icon
  if (isOwned && isItemOwnableWithoutCountdown(item)) {
    return <FaCheck />;
  }

  if (item.realMoneyCost) {
    return <FaCreditCard />;
  }

  if (item.currency === "premium" && !canAfford) {
    return <FaGem />;
  }

  return <FaShoppingCart />;
};

function StoreItemCard({
  item,
  onPurchase,
  purchasing,
  userBalance,
  onBuyPremium,
  userInventory,
}: StoreItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Check if item is owned based on userInventory - moved before any conditional returns
  // For items with countdown (like boosts), we need to check both ownership and remaining uses/time
  // For permanent items (like frames), just check if user has it in inventory
  const isOwned = useMemo(() => {
    if (!userInventory || !item?.id) {
      return false;
    }

    // Find item in user's inventory using both ID and name matching
    const inventoryItem = userInventory.find((invItem) => {
      // Try matching by ID - handle both number and string types
      const storeItemId = invItem.storeItem?.id;
      const idMatch =
        String(storeItemId) === String(item.id) || storeItemId === item.id;
      // Try matching by name as fallback
      const nameMatch = invItem.storeItem?.name === item.name;

      return idMatch || nameMatch;
    });

    if (!inventoryItem) {
      return false;
    }

    // For items that are ownable without countdown (like frames),
    // we consider them owned if they exist in inventory
    if (isItemOwnableWithoutCountdown(item)) {
      return true;
    }

    // For consumable items (boosts, super likes), check if they have uses remaining
    if (inventoryItem.usesRemaining && inventoryItem.usesRemaining > 0) {
      return true;
    }

    // For time-based items, check if they're still active
    if (inventoryItem.isActive && inventoryItem.metadata?.activatedAt) {
      // Assume items are active for some duration - you might need to adjust this logic
      const activatedDate = new Date(inventoryItem.metadata.activatedAt);
      const now = new Date();
      const hoursActive =
        (now.getTime() - activatedDate.getTime()) / (1000 * 60 * 60);

      // Simple check - if activated less than 24 hours ago, consider it active
      return hoursActive < 24;
    }

    return false;
  }, [userInventory, item]);

  // Safety check for item
  if (!item) {
    console.log("❌ [StoreItemCard] No item provided");
    return null;
  }

  const canAfford = () => {
    if (!userBalance || !item) return false;

    if (item.currency === "fuel") {
      return userBalance.fuel >= (item.price || 0) * quantity;
    }
    return userBalance.premium >= (item.price || 0) * quantity;
  };

  const canAffordItem = canAfford();

  const getCostDisplay = () => {
    if (!item) return "N/A";

    if (item.realMoneyCost) {
      return (
        <span className="flex items-center space-x-1">
          <span>${(item.realMoneyCost * quantity).toFixed(2)}</span>
        </span>
      );
    }
    if (item.currency === "fuel") {
      return (
        <span className="flex items-center space-x-1">
          <span>{(item.price || 0) * quantity}</span>
          <FaFire className="text-orange-500" />
        </span>
      );
    }
    if (item.currency === "premium") {
      return (
        <span className="flex items-center space-x-1">
          <span>{(item.price || 0) * quantity}</span>
          <FaGem className="text-purple-500" />
        </span>
      );
    }
    return "Free";
  };

  const getItemIcon = () => {
    if (!item?.type) {
      return <FaHeart className="text-2xl text-pink-500" />;
    }

    switch (item.type) {
      case "boost":
        return <FaBolt className="text-2xl text-yellow-500" />;
      case "super_like":
        return <FaStar className="text-2xl text-blue-500" />;
      case "rewind":
        return <FaEye className="text-2xl text-purple-500" />;
      case "profile_frame":
        return <FaCrown className="text-2xl text-amber-500" />;
      default:
        return <FaHeart className="text-2xl text-pink-500" />;
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
      >
        {/* Item Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getItemIcon()}
              <div>
                <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.category}</p>
              </div>
            </div>
            {item.isPopular && (
              <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
            )}
          </div>

          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {item.description}
          </p>

          {/* Features */}
          {item.features && item.features.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                Features:
              </h4>
              <ul className="space-y-1">
                {item.features.map((feature: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <FaCheck className="text-green-500 mr-2 text-xs" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                -
              </button>
              <span className="font-bold text-lg w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Total Cost:
            </span>
            <span className="text-xl font-bold text-gray-800">
              {getCostDisplay()}
            </span>
          </div>
        </div>

        {/* Purchase Button */}
        <div className="px-6 pb-6">
          <button
            onClick={() => {
              if (!isItemImplemented(item)) {
                return; // Do nothing for unimplemented items
              }

              if (isOwned && isItemOwnableWithoutCountdown(item)) {
                return; // Do nothing for owned items without countdown
              }

              if (item.realMoneyCost) {
                setShowPurchaseModal(true);
              } else if (item.currency === "premium" && !canAffordItem) {
                onBuyPremium();
              } else {
                onPurchase(String(item.id), quantity);
              }
            }}
            disabled={
              purchasing || !canPurchaseButton(item, isOwned, canAffordItem)
            }
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              purchasing
                ? "bg-gray-400 cursor-not-allowed"
                : !isItemImplemented(item)
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : isOwned && isItemOwnableWithoutCountdown(item)
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white cursor-default"
                : isOwned && isItemPermanent(item)
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : item.realMoneyCost
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
                : canAffordItem
                ? "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                : item.currency === "premium"
                ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {purchasing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {getItemButtonIcon(item, isOwned, canAffordItem)}
                <span>{getItemButtonText(item, isOwned, canAffordItem)}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Purchase Modal for Real Money Items */}
      <AnimatePresence>
        {showPurchaseModal && (
          <PurchaseModal
            item={item}
            quantity={quantity}
            onClose={() => setShowPurchaseModal(false)}
            onPurchase={onPurchase}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface PurchaseModalProps {
  item: StoreItem;
  quantity: number;
  onClose: () => void;
  onPurchase: (
    itemId: string,
    quantity: number,
    paymentMethodId?: string
  ) => void;
}

function PurchaseModal({
  item,
  quantity,
  onClose,
  onPurchase,
}: PurchaseModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [showAddCard, setShowAddCard] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);

      const defaultMethod = methods.find((method) => method.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPaymentMethod) return;

    setProcessing(true);
    try {
      await onPurchase(String(item.id), quantity, selectedPaymentMethod);
      onClose();
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  const totalCost = ((item.realMoneyCost || 0) * quantity).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Complete Purchase</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Purchase Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
              <FaShoppingCart className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-600">Quantity: {quantity}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Total:</span>
            <span className="text-2xl font-bold text-green-600">
              ${totalCost}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <FaCreditCard className="mr-2" />
            Payment Method
          </h3>

          {paymentMethods.length > 0 ? (
            <div className="space-y-3 mb-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPaymentMethod === method.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <FaCreditCard className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          •••• •••• •••• {method.card?.last4}
                        </p>
                        <p className="text-sm text-gray-600">
                          {method.card?.brand?.toUpperCase()}{" "}
                          {method.card?.expMonth}/{method.card?.expYear}
                        </p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <button
            onClick={() => setShowAddCard(true)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-pink-500 hover:text-pink-600 transition-colors flex items-center justify-center space-x-2"
          >
            <FaPlus />
            <span>Add New Card</span>
          </button>
        </div>

        {/* Security Info */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-3">
            <FaShieldAlt className="text-green-500" />
            <div className="text-sm">
              <p className="font-medium text-gray-800">Secure Payment</p>
              <p className="text-gray-600">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={!selectedPaymentMethod || processing}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FaLock />
                <span>Pay ${totalCost}</span>
              </>
            )}
          </button>
        </div>

        {/* Add Card Modal */}
        <AnimatePresence>
          {showAddCard && (
            <AddCardModal
              onClose={() => setShowAddCard(false)}
              onCardAdded={() => {
                setShowAddCard(false);
                loadPaymentMethods();
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

interface AddCardModalProps {
  onClose: () => void;
  onCardAdded: () => void;
}

function AddCardModal({ onClose, onCardAdded }: AddCardModalProps) {
  return (
    <Elements stripe={stripePromise}>
      <AddCardForm onClose={onClose} onCardAdded={onCardAdded} />
    </Elements>
  );
}

function AddCardForm({ onClose, onCardAdded }: AddCardModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveCard, setSaveCard] = useState(true);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        setError(error.message || "An error occurred");
        return;
      }

      if (saveCard && paymentMethod) {
        await paymentService.addPaymentMethod(paymentMethod.id);
      }

      onCardAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Add Payment Method
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Information
              </label>
              <div className="p-4 border border-gray-300 rounded-xl">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="saveCard"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <label htmlFor="saveCard" className="text-sm text-gray-700">
                Save this card for future purchases
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!stripe || processing}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <FaPlus />
                    <span>Add Card</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Premium Purchase Modal
function PremiumPurchaseModal({ onClose }: { onClose: () => void }) {
  const [selectedPackage, setSelectedPackage] = useState(premiumPackages[1]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [showAddCard, setShowAddCard] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);

      const defaultMethod = methods.find((method) => method.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPaymentMethod) return;

    setProcessing(true);
    try {
      // Call premium purchase API
      await paymentService.purchaseWithStoredMethod(
        selectedPackage.id,
        1,
        selectedPaymentMethod
      );
      onClose();
    } catch (error) {
      console.error("Premium purchase failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaGem className="text-purple-500 mr-3" />
            Buy Premium Points
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Premium Packages */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Choose Your Package:
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {premiumPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all relative ${
                  selectedPackage.id === pkg.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {pkg.amount}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Premium Points
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-gray-600">{pkg.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <FaCreditCard className="mr-2" />
            Payment Method
          </h3>

          {paymentMethods.length > 0 ? (
            <div className="space-y-3 mb-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPaymentMethod === method.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <FaCreditCard className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          •••• •••• •••• {method.card?.last4}
                        </p>
                        <p className="text-sm text-gray-600">
                          {method.card?.brand?.toUpperCase()}{" "}
                          {method.card?.expMonth}/{method.card?.expYear}
                        </p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <button
            onClick={() => setShowAddCard(true)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center space-x-2"
          >
            <FaPlus />
            <span>Add New Card</span>
          </button>
        </div>

        {/* Security Info */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-3">
            <FaShieldAlt className="text-green-500" />
            <div className="text-sm">
              <p className="font-medium text-gray-800">Secure Payment</p>
              <p className="text-gray-600">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={!selectedPaymentMethod || processing}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FaLock />
                <span>Pay ${selectedPackage.price}</span>
              </>
            )}
          </button>
        </div>

        {/* Add Card Modal */}
        <AnimatePresence>
          {showAddCard && (
            <AddCardModal
              onClose={() => setShowAddCard(false)}
              onCardAdded={() => {
                setShowAddCard(false);
                loadPaymentMethods();
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// Inventory Item Card Component
interface InventoryItemCardProps {
  inventoryItem: UserInventory;
  onActivate: (item: UserInventory) => void;
  onDeactivate: (item: UserInventory) => void;
  onUse: (item: UserInventory) => void;
  onDelete: (item: UserInventory) => void;
  loading: boolean;
}

function InventoryItemCard({
  inventoryItem,
  onActivate,
  onDeactivate,
  onUse,
  onDelete,
  loading,
}: InventoryItemCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every SECOND for real-time countdown with seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for real-time countdown

    return () => clearInterval(timer);
  }, []);

  // Safety checks
  if (!inventoryItem || !inventoryItem.storeItem) {
    return null;
  }

  const { storeItem } = inventoryItem;

  const getItemIcon = () => {
    if (!storeItem?.type) {
      return <FaHeart className="text-2xl text-pink-500" />;
    }

    switch (storeItem.type) {
      case "boost":
        return <FaBolt className="text-2xl text-yellow-500" />;
      case "super_like":
        return <FaStar className="text-2xl text-blue-500" />;
      case "rewind":
        return <FaEye className="text-2xl text-purple-500" />;
      case "profile_frame":
        return <FaCrown className="text-2xl text-amber-500" />;
      default:
        return <FaHeart className="text-2xl text-pink-500" />;
    }
  };

  const getStatusBadge = () => {
    if (!inventoryItem) {
      return (
        <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
          <span>UNKNOWN</span>
        </div>
      );
    }

    if (inventoryItem?.isActive) {
      return (
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
          <FaToggleOn />
          <span>ACTIVE</span>
        </div>
      );
    }
    return (
      <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
        <FaToggleOff />
        <span>INACTIVE</span>
      </div>
    );
  };

  const getRemainingDisplay = (currentTime: Date) => {
    if (!inventoryItem) {
      return (
        <div className="flex items-center text-sm text-gray-600">
          <FaInfinity className="mr-1" />
          <span>Unknown</span>
        </div>
      );
    }

    // Check if item is time-based (has duration in the name)
    const itemName = inventoryItem.storeItem?.name?.toLowerCase() || "";
    const isTimeBased =
      itemName.includes("1h") ||
      itemName.includes("6h") ||
      itemName.includes("24h") ||
      itemName.includes("boost") ||
      itemName.includes("see who liked");

    // For profile frames and other permanent items, show "Permanent"
    if (inventoryItem.storeItem?.type === "profile_frame" || !isTimeBased) {
      return (
        <div className="flex items-center text-sm text-green-600">
          <FaInfinity className="mr-1" />
          <span>Permanent</span>
        </div>
      );
    }

    // For time-based items ONLY (boosts, see who liked, etc.), calculate remaining time
    if (
      isTimeBased &&
      (inventoryItem.metadata?.activatedAt ||
        inventoryItem.metadata?.totalActiveTime)
    ) {
      // Determine total duration based on item name
      let totalDurationHours = 1; // default for 1h items
      if (itemName.includes("6h")) {
        totalDurationHours = 6;
      } else if (itemName.includes("24h")) {
        totalDurationHours = 24;
      } else if (itemName.includes("1h")) {
        totalDurationHours = 1;
      }

      const totalDurationMs = totalDurationHours * 60 * 60 * 1000;

      // Calculate total time spent active (includes previous sessions)
      let totalActiveTimeMs = inventoryItem.metadata?.totalActiveTime || 0;

      // If currently active, add the current session time
      if (inventoryItem.isActive && inventoryItem.metadata?.activatedAt) {
        const currentSessionStart = new Date(
          inventoryItem.metadata.activatedAt
        );
        const currentSessionMs =
          currentTime.getTime() - currentSessionStart.getTime();
        totalActiveTimeMs += currentSessionMs;
      }

      // Calculate remaining time
      const remainingMs = totalDurationMs - totalActiveTimeMs;

      if (remainingMs <= 0) {
        return (
          <div className="flex items-center text-sm text-red-600">
            <FaClock className="mr-1" />
            <span>Expired</span>
          </div>
        );
      }

      // Convert to human readable format with seconds
      const totalSeconds = Math.floor(remainingMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Format time display
      let timeDisplay = "";
      if (hours > 0) {
        timeDisplay = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      } else {
        timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      }

      return (
        <div className="flex items-center text-sm text-blue-600">
          <FaClock className="mr-1" />
          <span>{timeDisplay} left</span>
        </div>
      );
    }

    // For consumable items with uses remaining (like Super Likes)
    if (
      inventoryItem.usesRemaining !== undefined &&
      inventoryItem.usesRemaining !== null
    ) {
      if (inventoryItem.usesRemaining <= 0) {
        return (
          <div className="flex items-center text-sm text-red-600">
            <FaClock className="mr-1" />
            <span>No uses left</span>
          </div>
        );
      }

      return (
        <div className="flex items-center text-sm text-gray-600">
          <FaClock className="mr-1" />
          <span>{inventoryItem.usesRemaining} uses left</span>
        </div>
      );
    }

    // Default for other items
    return (
      <div className="flex items-center text-sm text-gray-600">
        <FaInfinity className="mr-1" />
        <span>Unlimited</span>
      </div>
    );
  };

  const formatDate = (date: string) => {
    if (!date) return "Unknown";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const isExpired = (currentTime: Date) => {
    if (!inventoryItem) return false;

    // FIRST: Check if item has expired by absolute expiry date (same as backend)
    if (inventoryItem?.expiryDate) {
      try {
        const isExpiredByDate =
          new Date(inventoryItem?.expiryDate) < currentTime;
        if (isExpiredByDate) {
          return true; // Item has expired by absolute date
        }
      } catch {
        // If expiryDate is invalid, continue with other checks
      }
    }

    // Check if item is time-based (has duration in the name)
    const itemName = inventoryItem.storeItem?.name?.toLowerCase() || "";
    const isTimeBased =
      itemName.includes("1h") ||
      itemName.includes("6h") ||
      itemName.includes("24h") ||
      itemName.includes("boost") ||
      itemName.includes("see who liked");

    // Profile frames and permanent items never expire
    if (inventoryItem.storeItem?.type === "profile_frame" || !isTimeBased) {
      return false;
    }

    // For time-based items, ALSO check expiry based on total active time used
    if (
      isTimeBased &&
      (inventoryItem.metadata?.activatedAt ||
        inventoryItem.metadata?.totalActiveTime)
    ) {
      // Determine total duration based on item name
      let totalDurationHours = 1; // default for 1h items
      if (itemName.includes("6h")) {
        totalDurationHours = 6;
      } else if (itemName.includes("24h")) {
        totalDurationHours = 24;
      } else if (itemName.includes("1h")) {
        totalDurationHours = 1;
      }

      const totalDurationMs = totalDurationHours * 60 * 60 * 1000;

      // Calculate total time spent active (includes previous sessions)
      let totalActiveTimeMs = inventoryItem.metadata?.totalActiveTime || 0;

      // If currently active, add the current session time
      if (inventoryItem.isActive && inventoryItem.metadata?.activatedAt) {
        const currentSessionStart = new Date(
          inventoryItem.metadata.activatedAt
        );
        const currentSessionMs =
          currentTime.getTime() - currentSessionStart.getTime();
        totalActiveTimeMs += currentSessionMs;
      }

      // Item is expired if total active time exceeds the duration
      return totalActiveTimeMs >= totalDurationMs;
    }

    // For consumable items, check if uses are exhausted
    if (
      inventoryItem.usesRemaining !== undefined &&
      inventoryItem.usesRemaining !== null
    ) {
      return inventoryItem.usesRemaining <= 0;
    }

    return false;
  };

  const canUse = () => {
    if (!inventoryItem) return false;
    if (isExpired(currentTime)) return false;
    if (
      inventoryItem?.usesRemaining !== undefined &&
      inventoryItem?.usesRemaining !== null &&
      inventoryItem?.usesRemaining <= 0
    )
      return false;
    return true;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border ${
        inventoryItem?.isActive ? "border-green-200" : "border-gray-100"
      } ${isExpired(currentTime) ? "opacity-60" : ""}`}
    >
      {/* Item Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getItemIcon()}
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {storeItem?.name || "Unknown Item"}
              </h3>
              <p className="text-sm text-gray-600">
                {storeItem?.category || "Unknown"}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Item Description */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4">
          {storeItem?.description || "No description available"}
        </p>

        {/* Item Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Purchased:</span>
            <span className="font-medium">
              {inventoryItem?.purchaseDate
                ? formatDate(inventoryItem.purchaseDate)
                : "Unknown"}
            </span>
          </div>

          {inventoryItem?.expiryDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Expires:</span>
              <span
                className={`font-medium ${
                  isExpired(currentTime) ? "text-red-600" : "text-gray-800"
                }`}
              >
                {formatDate(inventoryItem?.expiryDate)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uses Remaining:</span>
            {getRemainingDisplay(currentTime)}
          </div>

          {inventoryItem?.metadata?.activatedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Activated:</span>
              <span className="font-medium">
                {formatDate(inventoryItem?.metadata?.activatedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Expired Badge */}
        {isExpired(currentTime) && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded-xl text-sm font-medium mb-4 flex items-center space-x-2">
            <FaClock />
            <span>This item has expired</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {/* Activate/Deactivate Button */}
          {!isExpired(currentTime) && (
            <button
              onClick={() => {
                if (inventoryItem?.isActive) {
                  onDeactivate(inventoryItem);
                } else {
                  onActivate(inventoryItem);
                }
              }}
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : inventoryItem?.isActive
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  {inventoryItem?.isActive ? <FaPause /> : <FaPlay />}
                  <span>
                    {inventoryItem?.isActive ? "Deactivate" : "Activate"}
                  </span>
                </>
              )}
            </button>
          )}

          {/* Use Button (for consumable items) */}
          {storeItem?.type !== "profile_frame" && canUse() && (
            <button
              onClick={() => onUse(inventoryItem)}
              disabled={loading || !inventoryItem?.isActive}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                loading || !inventoryItem?.isActive
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Using...</span>
                </>
              ) : (
                <>
                  <FaBolt />
                  <span>Use Now</span>
                </>
              )}
            </button>
          )}

          {/* Delete Button (for expired items) */}
          {isExpired(currentTime) && (
            <button
              onClick={() => onDelete(inventoryItem)}
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FaTrash />
                  <span>Delete</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteConfirmationModal({
  isOpen,
  itemName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FaTrash className="text-red-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Delete Item</h2>
              <p className="text-gray-600 text-sm">
                This action cannot be undone
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">"{itemName}"</span>{" "}
            from your inventory? This expired item will be permanently removed.
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <FaTrash />
                <span>Delete Item</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function EnterpriseStore() {
  const { user } = useAuth();
  const {
    storeItems,
    userInventory,
    userBalance,
    loading,
    error,
    purchasing,
    purchaseSuccess,
    purchaseError,
    paymentMethods,
    purchaseItem,
    activateItem,
    deactivateItem,
    useItem: consumeItem,
    deleteInventoryItem,
    refreshStore,
    clearPurchaseMessages,
  } = useStore(user?.userId);

  const [currentView, setCurrentView] = useState<"store" | "inventory">(
    "store"
  );
  const [selectedCategory, setSelectedCategory] = useState<
    "fuel" | "premium" | "real_money"
  >("fuel");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [inventoryFilter, setInventoryFilter] = useState<string>("all");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<UserInventory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (purchaseSuccess || purchaseError) {
      const timer = setTimeout(clearPurchaseMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [purchaseSuccess, purchaseError, clearPurchaseMessages]);

  // Wrapper function to handle useItem with proper parameter
  const handleUseItem = useCallback(
    async (inventoryItem: UserInventory) => {
      if (!inventoryItem?.id) {
        console.error("Invalid inventory item for use");
        return;
      }
      try {
        // Use the consumeItem function from the useStore hook
        await consumeItem(inventoryItem.id);
      } catch (error) {
        console.error("Error using item:", error);
      }
    },
    [consumeItem]
  );

  // Wrapper function to handle deleteInventoryItem with proper parameter
  const handleDeleteItem = useCallback(async (inventoryItem: UserInventory) => {
    if (!inventoryItem?.id) {
      console.error("Invalid inventory item for deletion");
      return;
    }

    // Show confirmation modal instead of window.confirm
    setItemToDelete(inventoryItem);
    setShowDeleteModal(true);
  }, []);

  // Function to handle the actual deletion after confirmation
  const confirmDelete = useCallback(async () => {
    if (!itemToDelete?.id) return;

    setIsDeleting(true);
    try {
      await deleteInventoryItem(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [itemToDelete, deleteInventoryItem]);

  // Function to cancel deletion
  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setIsDeleting(false);
  }, []);

  const filteredItems = (storeItems || []).filter((item) => {
    if (!item) return false;

    if (selectedCategory === "real_money") {
      return item.realMoneyCost && item.realMoneyCost > 0;
    }

    const matchesCategory = item.currency === selectedCategory;
    const matchesSubcategory =
      selectedSubcategory === "all" || item.type === selectedSubcategory;
    const isNotRealMoney = !item.realMoneyCost || item.realMoneyCost === 0;

    return matchesCategory && matchesSubcategory && isNotRealMoney;
  });

  const filteredInventory = (userInventory || []).filter((item) => {
    if (!item || !item.storeItem) return false;

    if (inventoryFilter === "all") return true;
    if (inventoryFilter === "active") return item?.isActive;
    if (inventoryFilter === "inactive") return !item?.isActive;
    return item?.storeItem?.type === inventoryFilter;
  });

  const mainTabs = [
    { id: "store", name: "Store", icon: <FaShoppingCart />, color: "pink" },
    { id: "inventory", name: "My Inventory", icon: <FaBox />, color: "blue" },
  ] as const;

  const categories = [
    { id: "fuel", name: "Fuel Items", icon: <FaFire />, color: "orange" },
    { id: "premium", name: "Premium Items", icon: <FaGem />, color: "purple" },
    {
      id: "real_money",
      name: "Special Offers",
      icon: <FaCreditCard />,
      color: "green",
    },
  ] as const;

  const subcategories = [
    { id: "all", name: "All Items" },
    { id: "boost", name: "Boosts" },
    { id: "super_like", name: "Super Likes" },
    { id: "rewind", name: "Rewinds" },
    { id: "profile_frame", name: "Profile Frames" },
  ];

  const inventoryFilters = [
    { id: "all", name: "All Items" },
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" },
    { id: "boost", name: "Boosts" },
    { id: "super_like", name: "Super Likes" },
    { id: "rewind", name: "Rewinds" },
    { id: "profile_frame", name: "Profile Frames" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Loading store...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                CarMatch Store
              </h1>
              <p className="text-gray-600 mt-1">
                {currentView === "store"
                  ? "Enhance your dating experience with premium features"
                  : "Manage your purchased items and activations"}
              </p>
            </div>

            {/* Balance Display */}
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl flex items-center space-x-2">
                <FaFire />
                <span className="font-bold">{userBalance?.fuel || 0}</span>
                <span className="text-xs">Fuel</span>
              </div>
              <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl flex items-center space-x-2">
                <FaGem />
                <span className="font-bold">{userBalance?.premium || 0}</span>
                <span className="text-xs">Premium</span>
              </div>
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl flex items-center space-x-2">
                <FaCreditCard />
                <span className="font-bold">{paymentMethods?.length || 0}</span>
                <span className="text-xs">Payment Methods</span>
              </div>
              <button
                onClick={() => setShowPremiumModal(true)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2"
              >
                <FaPlus />
                <span>Buy Premium</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as "store" | "inventory")}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                  currentView === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600`
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {tab.id === "inventory" && (userInventory?.length || 0) > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                    {userInventory?.length || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {(purchaseSuccess || purchaseError) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="max-w-7xl mx-auto px-4 pt-4"
          >
            <div
              className={`p-4 rounded-xl border ${
                purchaseSuccess
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              } flex items-center justify-between`}
            >
              <div className="flex items-center space-x-2">
                {purchaseSuccess ? <FaCheck /> : <FaTimes />}
                <span>{purchaseSuccess || purchaseError}</span>
              </div>
              <button
                onClick={clearPurchaseMessages}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
        {/* Store View */}
        {currentView === "store" && (
          <>
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(
                      category.id as "fuel" | "premium" | "real_money"
                    );
                    setSelectedSubcategory("all");
                  }}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    selectedCategory === category.id
                      ? `bg-${category.color}-500 text-white shadow-lg`
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* Subcategory Filters */}
            {selectedCategory !== "real_money" && (
              <div className="flex flex-wrap gap-2 mb-8">
                {subcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => setSelectedSubcategory(subcategory.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedSubcategory === subcategory.id
                        ? "bg-pink-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Inventory View */}
        {currentView === "inventory" && (
          <>
            {/* Inventory Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {inventoryFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setInventoryFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    inventoryFilter === filter.id
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            {/* Inventory Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaBox className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {(userInventory || []).length}
                    </p>
                    <p className="text-sm text-gray-600">Total Items</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaToggleOn className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {
                        (userInventory || []).filter((item) => item?.isActive)
                          .length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Active Items</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FaClock className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {
                        (userInventory || []).filter(
                          (item) =>
                            item?.usesRemaining !== undefined &&
                            item?.usesRemaining > 0
                        ).length
                      }
                    </p>
                    <p className="text-sm text-gray-600">With Uses Left</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaCrown className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {
                        (userInventory || []).filter(
                          (item) => item?.storeItem?.type === "profile_frame"
                        ).length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Profile Frames</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Content Grid */}
        {currentView === "store" ? (
          // Store Items Grid
          error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <FaTimes className="text-4xl mx-auto mb-2" />
                <p className="text-lg font-semibold">Error loading store</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={refreshStore}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <FaShoppingCart className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No items available
              </h3>
              <p className="text-gray-600">
                Check back later for new items in this category.
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredItems.map((item) => (
                <StoreItemCard
                  key={item.itemId}
                  item={item}
                  onPurchase={purchaseItem}
                  purchasing={purchasing === item.itemId}
                  userBalance={userBalance}
                  onBuyPremium={() => setShowPremiumModal(true)}
                  userInventory={userInventory || []}
                />
              ))}
            </motion.div>
          )
        ) : // Inventory Items Grid
        filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <FaBox className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {inventoryFilter === "all"
                ? "No items in your inventory"
                : `No ${inventoryFilter} items found`}
            </h3>
            <p className="text-gray-600 mb-4">
              {inventoryFilter === "all"
                ? "Start shopping to add items to your inventory!"
                : "Try a different filter to see more items."}
            </p>
            {inventoryFilter === "all" && (
              <button
                onClick={() => setCurrentView("store")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Browse Store
              </button>
            )}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredInventory.map((inventoryItem) => (
              <InventoryItemCard
                key={inventoryItem?.id}
                inventoryItem={inventoryItem}
                onActivate={activateItem}
                onDeactivate={deactivateItem}
                onUse={handleUseItem}
                onDelete={handleDeleteItem}
                loading={purchasing === inventoryItem?.itemId}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Premium Purchase Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <PremiumPurchaseModal onClose={() => setShowPremiumModal(false)} />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && itemToDelete && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            itemName={itemToDelete.storeItem?.name || "Unknown Item"}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
