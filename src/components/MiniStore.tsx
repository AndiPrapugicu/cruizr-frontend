import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaGem,
  FaShoppingCart,
  FaCrown,
  FaStar,
  FaFire,
  FaBolt,
  FaEye,
  FaArrowRight,
} from "react-icons/fa";
import { useStore } from "../hooks/useStore";
import { useFuelWallet } from "../hooks/useFuelWallet";
import { useAuth } from "../contexts/AuthContext";
import { StoreItem } from "../types";
import { useNavigate } from "react-router-dom";

interface MiniStoreProps {
  visible: boolean;
  onClose: () => void;
}

const MiniStore: React.FC<MiniStoreProps> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const { wallet } = useFuelWallet();
  const { storeItems, loading, error, refreshStore } = useStore(user?.userId);
  const navigate = useNavigate();

  // Force refresh when component becomes visible
  useEffect(() => {
    if (visible && user?.userId) {
      refreshStore?.();
    }
  }, [visible, user?.userId, refreshStore]);

  // Get featured items (top items from each category)
  const getFeaturedItems = () => {
    if (!storeItems || storeItems.length === 0) {
      return [];
    }

    // Log all unique types to see what we have
    const uniqueTypes = [...new Set(storeItems.map((item) => item.type))];

    const categories = ["boost", "super_like", "profile_frame", "rewind"];
    const featured: StoreItem[] = [];

    categories.forEach((category) => {
      const categoryItems = storeItems.filter(
        (item) =>
          item.type === category &&
          (!item.realMoneyCost || item.realMoneyCost === 0)
      );

      if (categoryItems.length > 0) {
        // Get the first item from each category
        featured.push(categoryItems[0]);
      }
    });

    // If we don't have enough from categories, add any other items
    if (featured.length < 3) {
      const otherItems = storeItems.filter(
        (item) =>
          !featured.some((f) => f.id === item.id) &&
          (!item.realMoneyCost || item.realMoneyCost === 0)
      );
      featured.push(...otherItems.slice(0, 3 - featured.length));
    }

    return featured.slice(0, 3); // Max 3 featured items
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "boost":
        return <FaBolt className="text-2xl text-yellow-500" />;
      case "super_like":
        return <FaStar className="text-2xl text-blue-500" />;
      case "rewind":
        return <FaEye className="text-2xl text-purple-500" />;
      case "profile_frame":
        return <FaCrown className="text-2xl text-amber-500" />;
      default:
        return <FaShoppingCart className="text-2xl text-pink-500" />;
    }
  };

  const getCostDisplay = (item: StoreItem) => {
    if (item.currency === "fuel") {
      return (
        <span className="flex items-center space-x-1 text-orange-600">
          <span className="font-bold">{item.price}</span>
          <FaFire className="text-sm" />
        </span>
      );
    }
    if (item.currency === "premium") {
      return (
        <span className="flex items-center space-x-1 text-purple-600">
          <span className="font-bold">{item.price}</span>
          <FaGem className="text-sm" />
        </span>
      );
    }
    return "Free";
  };

  const goToFullStore = () => {
    onClose();
    navigate("/store");
  };

  if (!visible) return null;

  const featuredItems = getFeaturedItems();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Store Preview</h2>
                <p className="text-pink-100 text-sm mt-1">
                  Featured items from our store
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>

          {/* Balance Display */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-xl">
                <FaFire />
                <span className="font-bold">{wallet?.balance || 0}</span>
                <span className="text-sm">Fuel</span>
              </div>
              <div className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-xl">
                <FaGem />
                <span className="font-bold">{wallet?.premiumBalance || 0}</span>
                <span className="text-sm">Premium</span>
              </div>
            </div>
          </div>

          {/* Featured Items */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Featured Items
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-600">Loading items...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <FaShoppingCart className="text-4xl text-red-400 mx-auto mb-4" />
                <p className="text-red-600">Error loading store items</p>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
              </div>
            ) : featuredItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 mb-6">
                {featuredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        {getItemIcon(item.type || "")}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">{getCostDisplay(item)}</div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaShoppingCart className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No items available</p>
                <p className="text-sm text-gray-500 mt-1">
                  {storeItems?.length === 0
                    ? "Store is empty"
                    : `Found ${storeItems?.length || 0} total items`}
                </p>
              </div>
            )}

            {/* View Full Store Button */}
            <button
              onClick={goToFullStore}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 group"
            >
              <span>View Full Store</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniStore;
