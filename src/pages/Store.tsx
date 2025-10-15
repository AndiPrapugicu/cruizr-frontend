import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGem,
  FaShoppingCart,
  FaBolt,
  FaEye,
  FaCrown,
  FaTimes,
  FaCheck,
  FaClock,
  FaTools,
  FaUsers,
  FaMapMarkerAlt,
  FaEnvelope,
  FaHeart as FaHeartSolid,
  FaArrowUp,
  FaPalette,
} from "react-icons/fa";
import { storeService, StoreItem, UserBalance } from "../services/storeService";

export default function Store() {
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [userBalance, setUserBalance] = useState<UserBalance>({
    fuel: 0,
    premium: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"fuel" | "premium">(
    "fuel"
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    loadStoreData();
  }, []);

  // Update timer every second for cooldowns
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerKey((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadStoreData = async () => {
    setLoading(true);
    try {
      const [items, balance] = await Promise.all([
        storeService.getStoreItems(),
        storeService.getUserBalance(),
      ]);
      setStoreItems(items);
      setUserBalance(balance);
    } catch (error) {
      console.error("Error loading store data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: StoreItem) => {
    if (!storeService.canAfford(item)) {
      alert(
        `Nu ai suficient ${
          item.currency === "fuel" ? "combustibil" : "premium currency"
        }!`
      );
      return;
    }

    setPurchasing(item.id);
    try {
      const result = await storeService.purchaseItem(item.id);

      if (result.success) {
        setPurchaseSuccess(item.id);
        setTimeout(() => setPurchaseSuccess(null), 3000);

        // Refresh data
        await loadStoreData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Eroare la cumpărare. Te rog încearcă din nou.");
    } finally {
      setPurchasing(null);
    }
  };

  const getFilteredItems = () => {
    let filtered = storeItems.filter(
      (item) => item.category === selectedCategory
    );

    if (selectedSubcategory !== "all") {
      filtered = filtered.filter(
        (item) => item.subcategory === selectedSubcategory
      );
    }

    return filtered;
  };

  const getSubcategories = () => {
    const items = storeItems.filter(
      (item) => item.category === selectedCategory
    );
    const subcategories = [...new Set(items.map((item) => item.subcategory))];
    return subcategories;
  };

  const getItemIcon = (subcategory: string) => {
    switch (subcategory) {
      case "visibility":
      case "boosts":
        return <FaEye className="text-blue-500" />;
      case "boost":
        return <FaBolt className="text-yellow-500" />;
      case "likes":
      case "engagement":
        return <FaHeartSolid className="text-red-500" />;
      case "customization":
      case "frames":
      case "profile_frame":
        return <FaPalette className="text-purple-500" />;
      case "premium":
      case "membership":
      case "vip":
        return <FaCrown className="text-gold-500" />;
      case "tools":
      case "utility":
        return <FaTools className="text-gray-600" />;
      case "discovery":
      case "insight":
        return <FaUsers className="text-blue-600" />;
      case "location":
      case "travel":
        return <FaMapMarkerAlt className="text-green-500" />;
      case "messaging":
      case "communication":
        return <FaEnvelope className="text-indigo-500" />;
      case "matching":
        return <FaArrowUp className="text-pink-500" />;
      default:
        return <FaGem className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏪 Store</h1>
          <p className="text-gray-600">
            Îmbunătățește-ți experiența cu articole premium
          </p>

          {/* Balance Display */}
          <div className="flex items-center space-x-6 mt-4">
            <div className="flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
              <span className="mr-2 text-lg">⛽</span>
              <span className="font-semibold">{userBalance.fuel} Fuel</span>
            </div>
            <div className="flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
              <span className="mr-2 text-lg">💎</span>
              <span className="font-semibold">
                {userBalance.premium} Premium
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => {
              setSelectedCategory("fuel");
              setSelectedSubcategory("all");
            }}
            className={`px-6 py-3 rounded-md transition-all duration-200 flex items-center ${
              selectedCategory === "fuel"
                ? "bg-white shadow-sm text-orange-600 font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="mr-2 text-lg">⛽</span>
            Fuel Items
          </button>
          <button
            onClick={() => {
              setSelectedCategory("premium");
              setSelectedSubcategory("all");
            }}
            className={`px-6 py-3 rounded-md transition-all duration-200 flex items-center ${
              selectedCategory === "premium"
                ? "bg-white shadow-sm text-purple-600 font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="mr-2 text-lg">💎</span>
            Premium Items
          </button>
        </div>

        {/* Subcategory Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedSubcategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedSubcategory === "all"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Toate
          </button>
          {getSubcategories().map((subcategory) => (
            <button
              key={subcategory}
              onClick={() => setSelectedSubcategory(subcategory)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize flex items-center ${
                selectedSubcategory === subcategory
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="mr-1">{getItemIcon(subcategory)}</span>
              {subcategory}
            </button>
          ))}
        </div>

        {/* Store Items Grid */}
        <motion.div
          key={`${selectedCategory}-${selectedSubcategory}-${timerKey}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {getFilteredItems().map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                item.purchased
                  ? "border-green-300 bg-green-50"
                  : item.active
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              {/* Item Header */}
              <div
                className={`p-4 ${
                  selectedCategory === "fuel"
                    ? "bg-gradient-to-r from-orange-400 to-red-500"
                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                } text-white`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {item.price} {item.currency === "fuel" ? "⛽" : "💎"}
                    </div>
                    {item.duration && (
                      <div className="text-xs opacity-90">{item.duration}</div>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-lg mt-2">{item.name}</h3>

                {/* Cooldown Timer */}
                {storeService.isOnCooldown(item) && (
                  <div className="mt-2 text-center">
                    <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full inline-flex items-center">
                      <FaClock className="mr-1" />
                      {storeService.getCooldownTime(item)}
                    </div>
                  </div>
                )}
              </div>

              {/* Item Content */}
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Features */}
                {item.features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-2">
                      Caracteristici
                    </h4>
                    <ul className="space-y-1">
                      {item.features.slice(0, 3).map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-gray-600 flex items-center"
                        >
                          <FaCheck className="mr-2 text-green-500 text-xs" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={
                    purchasing === item.id ||
                    (item.isPermanent && item.purchased) ||
                    storeService.isOnCooldown(item) ||
                    !storeService.canAfford(item) ||
                    !storeService.isItemImplemented(item.id)
                  }
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                    !storeService.isItemImplemented(item.id)
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : item.isPermanent && item.purchased
                      ? "bg-gray-500 text-white cursor-not-allowed"
                      : storeService.isOnCooldown(item)
                      ? "bg-yellow-400 text-white cursor-not-allowed"
                      : item.active
                      ? "bg-blue-500 text-white cursor-default"
                      : !storeService.canAfford(item)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : purchasing === item.id
                      ? "bg-gray-400 text-white cursor-wait"
                      : selectedCategory === "fuel"
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-purple-500 text-white hover:bg-purple-600"
                  }`}
                >
                  {purchasing === item.id ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Se cumpără...
                    </>
                  ) : !storeService.isItemImplemented(item.id) ? (
                    <>
                      <FaTools className="mr-2" />
                      Feature In Development
                    </>
                  ) : item.isPermanent && item.purchased ? (
                    <>
                      <FaTimes className="mr-2" />
                      Nu se poate cumpăra din nou
                    </>
                  ) : storeService.isOnCooldown(item) ? (
                    <>
                      <FaClock className="mr-2" />
                      În cooldown ({storeService.getCooldownTime(item)})
                    </>
                  ) : item.active ? (
                    <>
                      <FaBolt className="mr-2" />
                      Activ
                    </>
                  ) : !storeService.canAfford(item) ? (
                    <>
                      <FaTimes className="mr-2" />
                      Insuficient{" "}
                      {item.currency === "fuel" ? "fuel" : "premium"}
                    </>
                  ) : (
                    <>
                      <FaShoppingCart className="mr-2" />
                      Cumpără
                    </>
                  )}
                </button>
              </div>

              {/* Purchase Success Animation */}
              <AnimatePresence>
                {purchaseSuccess === item.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center rounded-xl"
                  >
                    <div className="text-white text-center">
                      <FaCheck className="text-3xl mx-auto mb-2" />
                      <div className="font-bold">Cumpărare reușită!</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {getFilteredItems().length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nu există articole în această categorie
            </h3>
            <p className="text-gray-600">
              Încearcă să selectezi o altă categorie sau subcategorie.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
