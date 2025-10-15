import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaGem,
  FaShoppingCart,
  FaCrown,
  FaRocket,
  FaMagic,
  FaStar,
  FaCheck,
  FaBoxOpen,
  FaCheckCircle,
  FaTools,
} from "react-icons/fa";
import { useStore } from "../hooks/useStore";
import { useFuelWallet } from "../hooks/useFuelWallet";
import { useAuth } from "../contexts/AuthContext";
import { usePowerUps } from "../hooks/usePowerUps";
import { StoreItem } from "../types";

const STORE_CATEGORIES = {
  POWER_UPS: "power_ups",
  PREMIUM_FEATURES: "premium_features",
  CUSTOMIZATION: "customization",
  BADGES: "badges",
  SPECIAL: "special",
} as const;

interface StoreProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: "fuel" | "premium" | "inventory";
}

const Store: React.FC<StoreProps> = ({
  visible,
  onClose,
  initialTab = "fuel",
}) => {
  const { user } = useAuth();
  const { wallet, refreshWallet } = useFuelWallet();
  const {
    updatePowerUpState,
    activateProfileBoost,
    activateUnlimitedSwipes,
    updateProfileFrameColor,
  } = usePowerUps();
  const {
    storeItems,
    userInventory,
    loading,
    error,
    purchaseItem,
    checkItemOwnership,
    canPurchaseItem,
    refreshStoreItems,
    activateItem,
    deactivateItem,
    useItem,
    refreshInventory,
  } = useStore(user?.userId);

  const [selectedTab, setSelectedTab] = useState<
    "fuel" | "premium" | "inventory"
  >(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    STORE_CATEGORIES.POWER_UPS
  );
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);

  // Culori predefinite pentru Profile Frame
  const frameColors = [
    { name: "Galben", color: "#facc15" },
    { name: "Roz", color: "#ec4899" },
    { name: "Albastru", color: "#3b82f6" },
    { name: "Verde", color: "#10b981" },
    { name: "Portocaliu", color: "#f97316" },
    { name: "Mov", color: "#a855f7" },
    { name: "Roșu", color: "#ef4444" },
    { name: "Turcoaz", color: "#14b8a6" },
  ];

  useEffect(() => {
    if (visible) {
      refreshStoreItems();
      refreshWallet();
    }
  }, [visible, refreshStoreItems, refreshWallet]);

  // Încarcă inventory când se selectează tab-ul
  useEffect(() => {
    if (visible && selectedTab === "inventory" && userInventory.length === 0) {
      // Trigger refresh inventory dacă nu avem date
      refreshStoreItems();
    }
  }, [selectedTab, visible, userInventory.length, refreshStoreItems]);

  const filteredItems = storeItems.filter(
    (item) =>
      item.currency === selectedTab && item.category === selectedCategory
  );

  const handlePurchase = async (item: StoreItem) => {
    if (purchasing || !canPurchaseItem(item.itemId).canPurchase) return;

    setPurchasing(item.id);
    try {
      const result = await purchaseItem(item.itemId);
      if (result.success) {
        // Show success notification
        setNotification({
          show: true,
          message: `${item.name} a fost cumpărat cu succes!`,
          type: "success",
        });
        refreshWallet();

        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification({ show: false, message: "", type: "success" });
        }, 3000);
      } else {
        // Show error notification
        setNotification({
          show: true,
          message: result.message || "Eroare la cumpărare",
          type: "error",
        });

        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification({ show: false, message: "", type: "error" });
        }, 3000);
      }
    } catch (err) {
      setNotification({
        show: true,
        message: "Eroare la cumpărare. Încearcă din nou.",
        type: "error",
      });

      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "error" });
      }, 3000);
    } finally {
      setPurchasing(null);
    }
  };

  // Utility functions for store items
  const isItemImplemented = (itemId: string): boolean => {
    const implementedItems = [
      "profile_frame_basic",
      "profile-boost-1h",
      "profile-boost-6h",
      "super-boost-24h",
      "spotlight-boost-1h",
      "silver-profile-frame",
      "fire-profile-frame",
      "bronze-profile-frame",
      "profile_frame_emerald",
      "profile_frame_platinum",
      "profile_frame_legendary_phoenix",
      "gold-profile-frame",
      "diamond-profile-frame",
      "rainbow-profile-frame",
      "profile_frame_premium_mystic",
      "profile_frame_premium_cosmic",
      "super-like-single",
      "super-like-3pack",
      "super-like-5pack",
      "super-like-10pack",
      "swipe-rewind-single",
      "swipe-rewind-5pack",
    ];

    return implementedItems.includes(itemId);
  };

  const isItemPermanent = (item: StoreItem): boolean => {
    // Profile frames and permanent items can only be purchased once
    const permanentItemTypes = ["profile_frame", "frames", "customization"];

    return permanentItemTypes.some(
      (type) =>
        item.itemId?.includes("frame") ||
        item.category === type ||
        (item as any).subcategory === type
    );
  };

  const getItemButtonText = (
    item: StoreItem,
    isOwned: boolean,
    isPurchasing: boolean
  ): string => {
    if (isPurchasing) return "";

    if (!isItemImplemented(item.itemId)) {
      return "Feature In Development";
    }

    if (isOwned && isItemPermanent(item)) {
      return "Nu se poate cumpăra din nou";
    }

    if (isOwned) {
      return "Deținut";
    }

    return "Cumpără";
  };

  const getItemButtonIcon = (
    item: StoreItem,
    isOwned: boolean,
    isPurchasing: boolean
  ) => {
    if (isPurchasing) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
        />
      );
    }

    if (!isItemImplemented(item.itemId)) {
      return <FaTools className="inline mr-1" />;
    }

    if (isOwned && isItemPermanent(item)) {
      return <FaTimes className="inline mr-1" />;
    }

    if (isOwned) {
      return <FaCheck className="inline mr-1" />;
    }

    return <FaShoppingCart className="inline mr-1" />;
  };

  const canPurchaseButton = (
    item: StoreItem,
    isOwned: boolean,
    canPurchase: any
  ): boolean => {
    // Can't purchase if not implemented
    if (!isItemImplemented(item.itemId)) return false;

    // Can't purchase permanent items if already owned
    if (isOwned && isItemPermanent(item)) return false;

    // Can't purchase if already owned (for non-permanent items)
    if (isOwned) return false;

    // Use existing canPurchase logic
    return canPurchase.canPurchase;
  };

  const getItemIcon = (item: StoreItem) => {
    // Get subcategory or fallback to category for icon determination
    const type = item.subcategory || item.category;

    switch (type) {
      case "frames":
      case "customization":
      case "profile_frame":
        return <FaMagic className="text-purple-500" />; // 🎨 palette icon equivalent
      case "visibility":
      case "boosts":
      case "boost":
        return <FaRocket className="text-blue-500" />; // 👁️ eye icon equivalent
      case "likes":
      case "engagement":
        return <FaStar className="text-red-500" />; // ❤️ heart replacement
      case "tools":
      case "utility":
        return <FaGem className="text-gray-600" />; // 🔧 tools icon equivalent
      case "discovery":
      case "insight":
        return <FaCrown className="text-blue-600" />; // 👥 users icon equivalent
      case "location":
      case "travel":
        return <FaRocket className="text-green-500" />; // 📍 map marker equivalent
      case "messaging":
      case "communication":
        return <FaBoxOpen className="text-indigo-500" />; // ✉️ envelope equivalent
      case "matching":
        return <FaCheckCircle className="text-pink-500" />; // ⬆️ arrow up equivalent
      case "premium":
      case "membership":
      case "vip":
        return <FaCrown className="text-yellow-500" />;
      case STORE_CATEGORIES.POWER_UPS:
        return <FaRocket className="text-blue-500" />;
      case STORE_CATEGORIES.PREMIUM_FEATURES:
        return <FaCrown className="text-yellow-500" />;
      case STORE_CATEGORIES.CUSTOMIZATION:
        return <FaMagic className="text-purple-500" />;
      case STORE_CATEGORIES.BADGES:
        return <FaStar className="text-orange-500" />;
      default:
        return <FaGem className="text-green-500" />;
    }
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case STORE_CATEGORIES.POWER_UPS:
        return "Power-ups";
      case STORE_CATEGORIES.PREMIUM_FEATURES:
        return "Premium";
      case STORE_CATEGORIES.CUSTOMIZATION:
        return "Customizare";
      case STORE_CATEGORIES.BADGES:
        return "Badge-uri";
      case STORE_CATEGORIES.SPECIAL:
        return "Special";
      default:
        return category;
    }
  };

  const getItemActionText = (inventoryItem: any) => {
    if (!inventoryItem.storeItem) return "";

    const item = inventoryItem.storeItem;

    // Items consumabile (cu utilizări)
    if (
      inventoryItem.usesRemaining !== null &&
      inventoryItem.usesRemaining !== undefined
    ) {
      if (inventoryItem.usesRemaining <= 0) return "Consumat";

      switch (item.itemId) {
        case "super-like-5pack":
        case "super-like":
          return "Folosește";
        case "rewind":
          return "Rewind";
        case "profile-boost":
        case "super-boost":
          return "Activează";
        default:
          return "Folosește";
      }
    }

    // Items permanente sau temporare
    if (inventoryItem.isActive) {
      return "Dezactivează";
    } else {
      return "Activează";
    }
  };

  const handleItemAction = async (inventoryItem: any) => {
    if (!inventoryItem.storeItem) return;

    const item = inventoryItem.storeItem;

    console.log("🎯 [Store] handleItemAction called:", {
      itemId: item.itemId,
      isActive: inventoryItem.isActive,
      action: inventoryItem.isActive ? "deactivate" : "activate",
    });

    try {
      // Items consumabile
      if (
        inventoryItem.usesRemaining !== null &&
        inventoryItem.usesRemaining > 0
      ) {
        await handleUseItem(inventoryItem);
      } else {
        // Items activabile/dezactivabile
        if (inventoryItem.isActive) {
          await deactivateItem(inventoryItem);

          // Update PowerUpContext pentru visual effects
          if (
            item.itemId === "profile-frame" ||
            item.itemId === "profile_frame" ||
            item.itemId === "animated-profile-frame"
          ) {
            updatePowerUpState({
              activeProfileFrame: undefined,
              activeAnimatedFrame: undefined,
            });
          }

          setNotification({
            show: true,
            message: `${item.name} a fost dezactivat!`,
            type: "success",
          });
        } else {
          await activateItem(inventoryItem);

          // Update PowerUpContext pentru visual effects
          if (
            item.itemId === "profile-frame" ||
            item.itemId === "profile_frame" ||
            item.itemId === "animated-profile-frame"
          ) {
            console.log("🎨 [Store] Activating Profile Frame:", {
              itemId: item.itemId,
              powerUpUpdate: {
                activeProfileFrame: item.itemId,
                activeAnimatedFrame:
                  item.itemId === "animated-profile-frame"
                    ? item.itemId
                    : undefined,
              },
            });

            updatePowerUpState({
              activeProfileFrame: item.itemId,
              activeAnimatedFrame:
                item.itemId === "animated-profile-frame"
                  ? item.itemId
                  : undefined,
            });

            console.log("🎨 [Store] PowerUp state updated for Profile Frame");
          }

          setNotification({
            show: true,
            message: `${item.name} a fost activat!`,
            type: "success",
          });
        }

        // Refresh inventory după activare/dezactivare
        refreshInventory();
      }

      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      setNotification({
        show: true,
        message: "Eroare la acțiunea cu item-ul",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "error" });
      }, 3000);
    }
  };

  const handleUseItem = async (inventoryItem: any) => {
    const item = inventoryItem.storeItem;

    switch (item.itemId) {
      case "super-like-5pack":
      case "super-like":
        // Pentru Super Like - adaugă în state global
        const currentSuperLikes = parseInt(
          localStorage.getItem("superLikesAvailable") || "0"
        );
        const newSuperLikes = item.itemId === "super-like-5pack" ? 5 : 1;
        updatePowerUpState({
          superLikesAvailable: currentSuperLikes + newSuperLikes,
        });
        setNotification({
          show: true,
          message: `${newSuperLikes} Super Like${
            newSuperLikes > 1 ? "s" : ""
          } adăugat${
            newSuperLikes > 1 ? "e" : ""
          }! Folosește-le în secțiunea de swipe.`,
          type: "success",
        });
        break;

      case "rewind":
        // Pentru Rewind - adaugă în state global
        const currentRewinds = parseInt(
          localStorage.getItem("rewindsAvailable") || "0"
        );
        updatePowerUpState({
          rewindsAvailable: currentRewinds + 1,
        });
        setNotification({
          show: true,
          message:
            "Rewind adăugat! Folosește-l în secțiunea de swipe pentru a anula ultima acțiune.",
          type: "success",
        });
        break;

      case "profile-boost":
        // Pentru Profile Boost - activează pentru durata specificată
        const boostDuration = item.duration || 60; // default 60 minute
        activateProfileBoost(boostDuration);
        setNotification({
          show: true,
          message: `Profile Boost activat pentru ${boostDuration} minute! Profilul tău va fi mai vizibil.`,
          type: "success",
        });
        break;

      case "super-boost":
        // Pentru Super Boost - activează pentru durata specificată
        const superBoostDuration = item.duration || 30; // default 30 minute
        activateProfileBoost(superBoostDuration);
        setNotification({
          show: true,
          message: `Super Boost activat pentru ${superBoostDuration} minute! Profilul tău va fi foarte vizibil!`,
          type: "success",
        });
        break;

      case "unlimited-swipes-24h":
        // Pentru Unlimited Swipes
        activateUnlimitedSwipes(24); // 24 ore
        setNotification({
          show: true,
          message: "Unlimited Swipes activat pentru 24 ore! Swipe cât vrei!",
          type: "success",
        });
        break;

      case "see-who-liked-me":
        // Pentru See Who Liked Me
        updatePowerUpState({
          seeWhoLikedActive: true,
        });
        setNotification({
          show: true,
          message:
            "See Who Liked Me activat! Poți vedea cine te-a apreciat în secțiunea Likes.",
          type: "success",
        });
        break;

      case "read-receipts":
        // Pentru Read Receipts
        updatePowerUpState({
          readReceiptsActive: true,
        });
        setNotification({
          show: true,
          message:
            "Read Receipts activat! Vei vedea când match-urile citesc mesajele tale.",
          type: "success",
        });
        break;

      case "passport-travel":
        // Pentru Passport Travel
        updatePowerUpState({
          passportTravelActive: true,
        });
        setNotification({
          show: true,
          message:
            "Passport Travel activat! Poți schimba locația în setări pentru a explora alte orașe.",
          type: "success",
        });
        break;

      case "profile-frame":
      case "profile_frame":
      case "animated-profile-frame":
        // Pentru Profile Frame
        updatePowerUpState({
          activeProfileFrame: item.itemId,
          activeAnimatedFrame:
            item.itemId === "animated-profile-frame" ? item.itemId : undefined,
        });
        setNotification({
          show: true,
          message: `${item.name} activat! Profilul tău are un nou look.`,
          type: "success",
        });
        break;

      default:
        // Pentru alte items consumabile
        if (useItem) {
          await useItem(inventoryItem.id);
        }
        setNotification({
          show: true,
          message: `${item.name} a fost folosit!`,
          type: "success",
        });
        break;
    }

    // Refresh inventory după folosire
    refreshInventory();
  };

  const handleColorChange = (color: string, inventoryItem: any) => {
    updateProfileFrameColor(color);
    setShowColorPicker(null);

    setNotification({
      show: true,
      message: `Culoarea Profile Frame-ului a fost schimbată!`,
      type: "success",
    });

    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Store</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Wallet Balance */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2">
                <span className="text-orange-300 mr-2 text-lg">⛽</span>
                <span className="font-semibold text-orange-300">
                  {wallet?.balance || 0} Fuel
                </span>
              </div>
              <div className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2">
                <span className="text-purple-300 mr-2 text-lg">💎</span>
                <span className="font-semibold text-purple-300">
                  {wallet?.premiumBalance || 0} Premium
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setSelectedTab("fuel")}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                selectedTab === "fuel"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-600 hover:text-orange-500"
              }`}
            >
              <span className="inline mr-2 text-lg">⛽</span>
              Fuel Store
            </button>
            <button
              onClick={() => setSelectedTab("premium")}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                selectedTab === "premium"
                  ? "border-b-2 border-purple-500 text-purple-500"
                  : "text-gray-600 hover:text-purple-500"
              }`}
            >
              <span className="inline mr-2 text-lg">💎</span>
              Premium Store
            </button>
            <button
              onClick={() => setSelectedTab("inventory")}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                selectedTab === "inventory"
                  ? "border-b-2 border-green-500 text-green-500"
                  : "text-gray-600 hover:text-green-500"
              }`}
            >
              <FaBoxOpen className="inline mr-2" />
              Inventar
            </button>
          </div>

          {/* Category Navigation - doar pentru store tabs */}
          {selectedTab !== "inventory" && (
            <div className="flex overflow-x-auto border-b">
              {Object.values(STORE_CATEGORIES).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 whitespace-nowrap font-medium transition-colors ${
                    selectedCategory === category
                      ? "border-b-2 border-pink-500 text-pink-500"
                      : "text-gray-600 hover:text-pink-500"
                  }`}
                >
                  {getCategoryDisplayName(category)}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {selectedTab === "inventory" ? (
              // Inventory Content
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Inventarul tău
                </h3>
                {userInventory && userInventory.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userInventory
                      .filter((inventoryItem) => inventoryItem.storeItem) // Filtrează doar items care au storeItem-ul valid
                      .map((inventoryItem) => (
                        <motion.div
                          key={inventoryItem.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 ${
                            inventoryItem.isActive
                              ? "border-green-400 shadow-lg"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              {inventoryItem.storeItem ? (
                                getItemIcon(inventoryItem.storeItem)
                              ) : (
                                <FaBoxOpen className="text-gray-500" />
                              )}
                              <div className="ml-3">
                                <h4 className="font-semibold text-gray-800">
                                  {inventoryItem.storeItem?.name ||
                                    "Item necunoscut"}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {inventoryItem.storeItem?.description ||
                                    "Fără descriere"}
                                </p>
                              </div>
                            </div>
                            {inventoryItem.isActive && (
                              <FaCheckCircle className="text-green-500" />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                              <span>
                                {inventoryItem.usesRemaining !== null &&
                                inventoryItem.usesRemaining !== undefined
                                  ? `Utilizări rămase: ${inventoryItem.usesRemaining}`
                                  : `Cantitate: ${inventoryItem.quantity || 1}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  inventoryItem.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {inventoryItem.isActive ? "Activ" : "Inactiv"}
                              </span>

                              {/* Buton de activare/dezactivare sau folosire */}
                              {inventoryItem.storeItem && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleItemAction(inventoryItem)
                                    }
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                      inventoryItem.isActive
                                        ? "bg-red-500 text-white hover:bg-red-600"
                                        : inventoryItem.usesRemaining &&
                                          inventoryItem.usesRemaining > 0
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                    disabled={
                                      !inventoryItem.isActive &&
                                      inventoryItem.usesRemaining !== null &&
                                      inventoryItem.usesRemaining <= 0
                                    }
                                  >
                                    {getItemActionText(inventoryItem)}
                                  </button>

                                  {/* Buton de culoare pentru Profile Frame */}
                                  {inventoryItem.isActive &&
                                    (inventoryItem.storeItem.itemId ===
                                      "profile-frame" ||
                                      inventoryItem.storeItem.itemId ===
                                        "profile_frame" ||
                                      inventoryItem.storeItem.itemId ===
                                        "animated-profile-frame") && (
                                      <div className="relative">
                                        <button
                                          onClick={() =>
                                            setShowColorPicker(
                                              showColorPicker ===
                                                inventoryItem.id
                                                ? null
                                                : inventoryItem.id
                                            )
                                          }
                                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                                        >
                                          🎨 Culoare
                                        </button>

                                        {/* Color Picker */}
                                        {showColorPicker ===
                                          inventoryItem.id && (
                                          <div className="absolute top-8 right-0 bg-white border rounded-lg shadow-lg p-3 z-50 min-w-[200px]">
                                            <div className="text-xs font-semibold text-gray-700 mb-2">
                                              Alege culoarea:
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                              {frameColors.map((frameColor) => (
                                                <button
                                                  key={frameColor.color}
                                                  onClick={() =>
                                                    handleColorChange(
                                                      frameColor.color,
                                                      inventoryItem
                                                    )
                                                  }
                                                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors"
                                                  style={{
                                                    backgroundColor:
                                                      frameColor.color,
                                                  }}
                                                  title={frameColor.name}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </>
                              )}
                            </div>
                          </div>

                          {inventoryItem.expiryDate && (
                            <div className="mt-2 text-xs text-gray-500">
                              Expiră:{" "}
                              {new Date(
                                inventoryItem.expiryDate
                              ).toLocaleDateString()}
                            </div>
                          )}

                          {/* Informații suplimentare despre folosire */}
                          {inventoryItem.metadata?.totalUsed && (
                            <div className="mt-1 text-xs text-gray-500">
                              Folosit: {inventoryItem.metadata.totalUsed} ori
                            </div>
                          )}
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaBoxOpen className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Nu ai încă produse în inventar.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Cumpără produse din store pentru a le vedea aici!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Store Content
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                      onClick={refreshStoreItems}
                      className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      Încearcă din nou
                    </button>
                  </div>
                ) : filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => {
                      const canPurchase = canPurchaseItem(item.itemId);
                      const isOwned = checkItemOwnership(item.itemId);
                      const isPurchasing = purchasing === item.id;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              {getItemIcon(item)}
                              <div className="ml-3">
                                <h3 className="font-semibold text-gray-800">
                                  {item.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            {isOwned && <FaCheck className="text-green-500" />}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {item.currency === "fuel" ? (
                                <span className="text-orange-500 mr-1 text-lg">
                                  ⛽
                                </span>
                              ) : (
                                <span className="text-purple-500 mr-1 text-lg">
                                  💎
                                </span>
                              )}
                              <span className="font-bold text-lg">
                                {item.price}
                              </span>
                            </div>

                            <button
                              onClick={() => handlePurchase(item)}
                              disabled={
                                !canPurchaseButton(
                                  item,
                                  isOwned,
                                  canPurchase
                                ) || isPurchasing
                              }
                              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                !isItemImplemented(item.itemId)
                                  ? "bg-gray-400 text-white cursor-not-allowed"
                                  : isOwned && isItemPermanent(item)
                                  ? "bg-gray-500 text-white cursor-not-allowed"
                                  : isOwned
                                  ? "bg-green-100 text-green-600 cursor-not-allowed"
                                  : canPurchase.canPurchase && !isPurchasing
                                  ? "bg-pink-500 text-white hover:bg-pink-600"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              {getItemButtonIcon(item, isOwned, isPurchasing)}
                              {getItemButtonText(item, isOwned, isPurchasing)}
                            </button>
                          </div>

                          {!canPurchase.canPurchase && !isOwned && (
                            <p className="text-xs text-red-500 mt-2">
                              {canPurchase.reason}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaShoppingCart className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Nu există produse disponibile în această categorie.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -50, x: "-50%" }}
              className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-60 px-6 py-3 rounded-lg shadow-lg ${
                notification.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              <div className="flex items-center">
                {notification.type === "success" ? (
                  <FaCheckCircle className="mr-2" />
                ) : (
                  <FaTimes className="mr-2" />
                )}
                {notification.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default Store;
