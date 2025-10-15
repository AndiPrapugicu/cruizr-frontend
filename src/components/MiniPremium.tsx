import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCrown, FaGem, FaRocket } from "react-icons/fa";

interface MiniPremiumProps {
  visible: boolean;
  onClose: () => void;
}

const premiumOptions = [
  {
    id: "vip_month",
    name: "VIP Monthly",
    description: "Unlock all premium features for 1 month.",
    price: 1000,
    currency: "premium",
    icon: <FaCrown className="text-yellow-500 text-2xl" />,
  },
  {
    id: "vip_year",
    name: "VIP Yearly",
    description: "Unlock all premium features for 1 year.",
    price: 9000,
    currency: "premium",
    icon: <FaCrown className="text-yellow-500 text-2xl" />,
  },
  {
    id: "premium_pack",
    name: "Premium Pack",
    description: "Get 5000 Premium Points instantly.",
    price: 5000,
    currency: "premium",
    icon: <FaGem className="text-purple-500 text-2xl" />,
  },
];

const MiniPremium: React.FC<MiniPremiumProps> = ({ visible, onClose }) => {
  if (!visible) return null;

  const handleBuy = () => {
    window.location.href = "/store";
  };

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
          className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
                <p className="text-pink-100 text-sm mt-1">
                  Choose your Premium or VIP option
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

          {/* Premium Options */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Available Options
            </h3>
            <div className="space-y-4 mb-6">
              {premiumOptions.map((option) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      {option.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {option.name}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBuy}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Buy
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniPremium;
