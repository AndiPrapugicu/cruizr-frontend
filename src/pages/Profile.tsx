import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AddCarModal from "../components/AddCarModal";
import AddPhotosModal from "../components/AddPhotosModal";
import { usePowerUps } from "../hooks/usePowerUps";
import { useTheme } from "../contexts/ThemeContext";
import {
  FaEdit,
  FaCar,
  FaCamera,
  FaMapMarkerAlt,
  FaCrown,
  FaStar,
  FaFire,
  FaTrophy,
  FaCog,
  FaSignOutAlt,
  FaPlus,
  FaTrash,
  FaPalette,
} from "react-icons/fa";

// Helper function to build photo URLs
const getPhotoUrl = (photo: string | BackendPhoto): string => {
  if (typeof photo === "string") {
    // If photo is Base64, use as is
    if (photo.startsWith("data:image")) {
      return photo;
    }
    // If photo already starts with http/https, use as is
    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      console.log("📸 Using full URL:", photo);
      return photo;
    }
    // If it's a relative path, prepend the API base URL
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const fullUrl = photo.startsWith("/") ? `${baseUrl}${photo}` : `${baseUrl}/${photo}`;
    console.log("📸 Built URL from relative path:", fullUrl);
    return fullUrl;
  }
  // For BackendPhoto objects
  return photo.url ? getPhotoUrl(photo.url) : "";
};

interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  photos: string[];
  isMain: boolean;
  engineSize?: string;
  horsepower?: number;
  torque?: number;
  transmission?: string;
  fuelType?: string;
  drivetrain?: string;
  doors?: number;
  seats?: number;
  mileage?: number;
  bodyType?: string;
  upholsteryType?: string;
  interiorColor?: string;
  hasSunroof?: boolean;
  mods?: string[];
}

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
}

interface BackendPhoto {
  url?: string;
}

interface BackendCar {
  id?: number;
  brand?: string;
  make?: string;
  carMake?: string;
  model?: string;
  carModel?: string;
  year?: number;
  carYear?: number;
  color?: string;
  photos?: string[]; // Array of photo URLs as strings
  photo?: string;
  isPrimary?: boolean;
  isMain?: boolean;
  engineSize?: string;
  horsepower?: number;
  torque?: number;
  transmission?: string;
  fuelType?: string;
  drivetrain?: string;
  doors?: number;
  seats?: number;
  mileage?: number;
  bodyType?: string;
  upholsteryType?: string;
  interiorColor?: string;
  hasSunroof?: boolean;
  mods?: string[];
}

interface BackendBadge {
  id?: number;
  name?: string;
  title?: string;
  description?: string;
  icon?: string;
  earned?: boolean;
  unlocked?: boolean;
  progress?: number;
}

interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  photos: string[];
  cars: CarData[];
  badges: BadgeData[];
  isVip: boolean;
  interests: string[];
  stats: {
    matches: number;
    likes: number;
    cars: number;
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { powerUpState, updateProfileFrameColor } = usePowerUps();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "cars" | "badges">(
    "overview"
  );
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showAddPhotosModal, setShowAddPhotosModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Culori predefinite pentru Profile Frame
  const frameColors = [
    "#facc15", // Galben
    "#ec4899", // Roz
    "#3b82f6", // Albastru
    "#10b981", // Verde
    "#f97316", // Portocaliu
    "#a855f7", // Mov
    "#ef4444", // Roșu
    "#14b8a6", // Turcoaz
  ];

  // Get active profile frame and color from powerUpState
  const activeProfileFrame = powerUpState?.activeProfileFrame;
  const hasActiveProfileFrame =
    activeProfileFrame && activeProfileFrame.includes("profile");

  // Check if current frame supports color customization (only basic frame)
  const supportsColorCustomization =
    activeProfileFrame === "profile_frame_basic";

  // Log powerUpState for debugging
  console.log("🎯 [Profile] PowerUpState received:", powerUpState);
  console.log(
    "🎯 [Profile] activeProfileFrame:",
    powerUpState.activeProfileFrame
  );
  console.log(
    "🎯 [Profile] activeProfileFrameColor:",
    powerUpState.activeProfileFrameColor
  );
  console.log("🎯 [Profile] hasActiveProfileFrame:", hasActiveProfileFrame);
  console.log(
    "🎯 [Profile] supportsColorCustomization:",
    supportsColorCustomization
  );

  // Function to get profile frame styles (applied to frame wrapper, not image)
  const getProfileFrameStyles = (): React.CSSProperties => {
    console.log(
      "🎨 [Profile] getProfileFrameStyles called with activeProfileFrame:",
      powerUpState.activeProfileFrame
    );

    if (!powerUpState.activeProfileFrame) return {};

    switch (powerUpState.activeProfileFrame) {
      case "profile-frame":
      case "profile_frame":
      case "profile_frame_basic":
        // Basic frame - effects will be handled by static background
        return {};

      case "bronze-profile-frame":
        return {
          boxShadow: `0 0 0 4px #cd7f3280, 0 25px 50px -12px #cd7f3280`,
        };

      case "silver-profile-frame":
        return {
          boxShadow: `0 0 0 4px #c0c0c080, 0 25px 50px -12px #c0c0c080`,
        };

      case "gold-profile-frame":
        return {
          boxShadow: `
            0 0 0 3px #fff, 
            0 0 0 6px #d4af37, 
            0 0 0 9px #f7dc6f, 
            0 0 20px #d4af37aa, 
            0 0 40px #f7dc6f66`,
          background: `conic-gradient(from 0deg, #d4af37, #f7dc6f, #ffd700, #b8860b, #d4af37)`,
          animation: "luxury-gold-rotate 4s linear infinite",
        };

      case "diamond-profile-frame":
        return {
          boxShadow: `
            0 0 0 3px #fff, 
            0 0 0 6px #e8f4f8, 
            0 0 0 9px #d6eaf8, 
            0 0 25px #85c1e9aa, 
            0 0 50px #3498db66`,
          background: `conic-gradient(from 0deg, #e8f4f8, #d6eaf8, #aed6f1, #85c1e9, #5dade2, #e8f4f8)`,
          animation: "luxury-diamond-sparkle 2.5s ease-in-out infinite",
        };

      case "rainbow-profile-frame":
        return {
          boxShadow: `
            0 0 0 3px #fff, 
            0 0 0 6px #ff006e, 
            0 0 0 9px #fb5607, 
            0 0 30px #ff006eaa, 
            0 0 60px #fb560766`,
          background: `conic-gradient(from 0deg, #ff006e, #fb5607, #ffbe0b, #8338ec, #3a86ff, #ff006e)`,
          animation: "luxury-rainbow-spin 2s linear infinite",
        };

      case "fire-profile-frame":
        return {
          boxShadow: `
            0 0 0 3px #fff, 
            0 0 0 5px #ff6b35, 
            0 0 15px #ff6b35aa, 
            0 0 30px #ff4500aa`,
          background: `conic-gradient(from 0deg, #ff6b35, #ff4500, #ff8c42, #ff6b35)`,
          animation: "fire-subtle-flicker 2s ease-in-out infinite alternate",
        };

      case "profile_frame_emerald":
        return {
          boxShadow: `
            0 0 0 3px #fff, 
            0 0 0 6px #2ecc71, 
            0 0 0 8px #58d68d, 
            0 0 20px #2ecc71aa, 
            0 0 40px #58d68d66`,
          background: `conic-gradient(from 0deg, #2ecc71, #58d68d, #82e5aa, #2ecc71)`,
        };

      case "profile_frame_platinum":
        return {
          boxShadow: `
            0 0 0 3px #fff, 
            0 0 0 6px #bdc3c7, 
            0 0 0 8px #d5dbdb, 
            0 0 22px #95a5a6aa, 
            0 0 45px #bdc3c766`,
          background: `conic-gradient(from 0deg, #bdc3c7, #d5dbdb, #ecf0f1, #95a5a6, #bdc3c7)`,
          filter: "brightness(1.05) contrast(1.1)",
        };

      case "profile_frame_legendary_phoenix":
        return {
          boxShadow: `
            0 0 0 3px #fff, 
            0 0 0 6px #ff8c00, 
            0 0 0 9px #ffaa00, 
            0 0 25px #ff8c00aa, 
            0 0 50px #ffaa0066`,
          background: `conic-gradient(from 0deg, #ff8c00, #ffaa00, #ff6347, #ff8c00)`,
          animation: "phoenix-glow 2s ease-in-out infinite alternate",
        };

      case "profile_frame_premium_mystic":
        return {
          boxShadow: `
            0 0 0 3px #fff, 
            0 0 0 6px #9d4edd, 
            0 0 0 9px #c77dff, 
            0 0 35px #9d4eddaa, 
            0 0 70px #c77dff66`,
          background: `conic-gradient(from 0deg, #9d4edd, #c77dff, #e0aaff, #240046, #9d4edd)`,
          animation: "luxury-mystic-pulse 3.5s ease-in-out infinite alternate",
        };

      case "profile_frame_premium_cosmic":
        return {
          boxShadow: `
            0 0 0 3px #fff, 
            0 0 0 6px #7209b7, 
            0 0 0 9px #a663cc, 
            0 0 40px #7209b7aa, 
            0 0 80px #a663cc66`,
          background: `conic-gradient(from 0deg, #7209b7, #a663cc, #d4a4eb, #0f0014, #3c096c, #7209b7)`,
          animation: "luxury-cosmic-vortex 4.5s linear infinite",
        };

      case "animated-profile-frame":
        // This will be handled by separate div
        return {};

      default:
        console.log(
          "🎨 [Profile] No matching frame type, returning empty styles"
        );
        return {};
    }
  };

  const handleColorChange = (color: string) => {
    console.log("🎨 [Profile] Color change clicked:", color);
    console.log(
      "🎨 [Profile] Current activeProfileFrameColor:",
      powerUpState.activeProfileFrameColor
    );
    updateProfileFrameColor(color);
    setShowColorPicker(false);
    console.log("🎨 [Profile] After update, new color should be:", color);
  };

  const fetchUserProfile = async () => {
    try {
      // Fetch user profile from backend
      const response = await api.get("/users/me");
      const userData = response.data;

      console.log("🔍 [Profile] Raw userData from backend:", userData);

      // Also fetch cars and badges data
      const [carsResponse, badgesResponse, statsResponse] = await Promise.all([
        api.get("/cars").catch(() => ({ data: [] })),
        api.get("/badges/my-badges").catch(() => ({ data: [] })),
        api
          .get("/users/me/stats")
          .catch(() => ({ data: { matches: 0, likes: 0, cars: 0 } })),
      ]);

      console.log("🚗 Raw cars data from backend:", carsResponse.data);
      console.log("🏆 Raw badges data from backend:", badgesResponse.data);
      console.log("📊 Raw stats data from backend:", statsResponse.data);

      // Transform backend data to match frontend interface
      const userProfile: UserProfile = {
        id: userData.id?.toString() || "unknown",
        name: userData.name || userData.firstName || "Unnamed User",
        age: userData.age || calculateAge(userData.birthdate) || 25,
        bio: userData.bio || userData.description || "",
        location: userData.city || userData.location || "Location not set",
        photos:
          userData.photos && userData.photos.length > 0
            ? (() => {
                console.log(
                  "🖼️ [Profile] Using userData.photos:",
                  userData.photos
                );
                return userData.photos.map((photo: BackendPhoto | string) =>
                  getPhotoUrl(
                    typeof photo === "string"
                      ? photo
                      : photo.url || "/default-avatar.jpg"
                  )
                );
              })()
            : userData.imageUrl
            ? (() => {
                console.log(
                  "🖼️ [Profile] Using userData.imageUrl:",
                  userData.imageUrl
                );
                return [getPhotoUrl(userData.imageUrl)];
              })()
            : (() => {
                console.log("🖼️ [Profile] Using default avatar");
                return [getPhotoUrl("/default-avatar.jpg")];
              })(),
        cars: carsResponse.data.map((car: BackendCar) => ({
          id: car.id?.toString() || Math.random().toString(),
          make: car.brand || car.make || car.carMake || "Unknown",
          model: car.model || car.carModel || "Unknown",
          year: car.year || car.carYear || new Date().getFullYear(),
          color: car.color || "Unknown",
          photos:
            car.photos && car.photos.length > 0
              ? car.photos.map((photoUrl: string) => getPhotoUrl(photoUrl))
              : car.photo
              ? [getPhotoUrl(car.photo)]
              : [getPhotoUrl("/default-car.jpg")],
          isMain: car.isPrimary || car.isMain || false,
          engineSize: car.engineSize,
          horsepower: car.horsepower,
          torque: car.torque,
          transmission: car.transmission,
          fuelType: car.fuelType,
          drivetrain: car.drivetrain,
          doors: car.doors,
          seats: car.seats,
          mileage: car.mileage,
          bodyType: car.bodyType,
          upholsteryType: car.upholsteryType,
          interiorColor: car.interiorColor,
          hasSunroof: car.hasSunroof,
          mods: car.mods || [],
        })),
        badges: badgesResponse.data.map((badge: BackendBadge) => ({
          id: badge.id?.toString() || Math.random().toString(),
          name: badge.name || badge.title || "Unknown Badge",
          description: badge.description || "",
          icon: badge.icon || "�",
          earned: badge.earned || badge.unlocked || false,
          progress: badge.progress || undefined,
        })),
        isVip: userData.isVip || false,
        interests: userData.interests || ["Cars", "Racing", "Photography"],
        stats: {
          matches: statsResponse.data.matches || 0,
          likes: statsResponse.data.likes || 0,
          cars: statsResponse.data.cars || 0,
        },
      };

      console.log("📸 [Profile] Final userProfile.photos:", userProfile.photos);
      setUser(userProfile);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setLoading(false);
      // Could show error message here
    }
  };

  const calculateAge = (birthdate: string | null): number => {
    if (!birthdate) return 25;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    fetchUserProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleAddCar = () => {
    setShowAddCarModal(true);
  };

  const handleDeleteCar = async (carId: string) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        await api.delete(`/cars/${carId}`);

        // Update local state
        if (user) {
          const updatedCars = user.cars.filter((car) => car.id !== carId);
          setUser({ ...user, cars: updatedCars });
        }

        console.log("Car deleted successfully");
      } catch (error) {
        console.error("Error deleting car:", error);
        alert("Error deleting car. Please try again.");
      }
    }
  };

  const handleAddPhotos = () => {
    setShowAddPhotosModal(true);
  };

  const getBadgeIcon = (badge: BadgeData) => {
    if (badge.earned) {
      switch (badge.name) {
        case "Speed Demon":
          return <FaFire className="text-red-500" />;
        case "Road Tripper":
          return <FaMapMarkerAlt className="text-blue-500" />;
        case "Car Expert":
          return <FaCar className="text-purple-500" />;
        default:
          return <FaStar className="text-yellow-500" />;
      }
    }
    return <div className="text-gray-400">{badge.icon}</div>;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center w-full h-full ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`w-full h-full ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} overflow-y-auto transition-colors duration-300`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex items-center justify-between">
          <h1 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>My Profile</h1>
          <div className="flex space-x-2 sm:space-x-3">
            <button
              onClick={() => navigate("/settings")}
              className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center`}
            >
              <FaCog className="text-lg sm:text-xl" />
            </button>
            <button
              onClick={handleLogout}
              className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center`}
            >
              <FaSignOutAlt className="text-lg sm:text-xl" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-24 md:pb-6 space-y-4 sm:space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden`}
        >
          {/* Cover Photo */}
          <div className={`h-32 sm:h-48 bg-gradient-to-r relative ${theme === 'dark' ? 'from-blue-600 to-purple-600' : 'from-blue-500 to-blue-600'}`}>
            {user.isVip && (
              <div className="absolute top-4 right-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold flex items-center">
                  <FaCrown className="mr-2" />
                  VIP MEMBER
                </div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 -mt-16">
              {/* Profile Picture with Frame */}
              <div className="relative">
                {/* Frame wrapper with animations - this will contain the frame effects */}
                {powerUpState.activeProfileFrame && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={getProfileFrameStyles()}
                  ></div>
                )}

                {/* Static gradient background for basic frame */}
                {powerUpState.activeProfileFrame && (
                  <div
                    className="absolute inset-0 rounded-full p-1"
                    style={{
                      background: `linear-gradient(to right, ${
                        powerUpState.activeProfileFrameColor || "#facc15"
                      }, ${powerUpState.activeProfileFrameColor || "#facc15"})`,
                    }}
                  >
                    <div className="w-full h-full bg-white rounded-full"></div>
                  </div>
                )}

                {/* Profile image - no styles applied here */}
                <img
                  src={getPhotoUrl(user.photos[0])}
                  alt={user.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover relative z-10"
                  onLoad={() =>
                    console.log(
                      "🖼️ [Profile] Main profile image loaded successfully"
                    )
                  }
                  onError={(e) => {
                    console.error(
                      "❌ [Profile] Failed to load main profile image:",
                      e
                    );
                    console.error(
                      "❌ [Profile] Image src was:",
                      e.currentTarget.src
                    );
                  }}
                />

                {powerUpState.activeProfileFrame ===
                  "animated-profile-frame" && (
                  <div
                    className="absolute inset-0 rounded-full p-1 animate-spin"
                    style={{
                      background: `linear-gradient(to right, ${
                        powerUpState.activeProfileFrameColor || "#ec4899"
                      }, #a855f7, #3b82f6)`,
                    }}
                  >
                    <div className="w-full h-full bg-white rounded-full"></div>
                  </div>
                )}

                <button
                  onClick={handleAddPhotos}
                  className={`absolute bottom-2 right-2 bg-gradient-to-r text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-20 ${theme === 'dark' ? 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'}`}
                >
                  <FaCamera className="text-lg" />
                </button>
              </div>

              <div className="flex-1">
                {/* Removed edit button from here */}
              </div>
            </div>

            {/* Name, Age and Location - moved below profile picture */}
            <div className="mt-6">
              {/* Name and Age with Edit Button */}
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {user.name}, {user.age}
                </h2>
                <button
                  onClick={() => navigate("/profile/edit")}
                  className={`bg-gradient-to-r text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 ${theme === 'dark' ? 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'}`}
                >
                  <FaEdit className="text-lg" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Color Picker for Profile Frame - only for basic frame */}
              {supportsColorCustomization && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full font-medium shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
                  >
                    <FaPalette className="text-lg" />
                    <span>Change Frame Color</span>
                  </button>

                  {showColorPicker && (
                    <div className={`mt-3 p-4 ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                        Select a color for your profile frame:
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        {frameColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorChange(color)}
                            className={`w-12 h-12 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-all duration-300 hover:scale-110 ${
                              powerUpState.activeProfileFrameColor === color
                                ? "ring-4 ring-blue-500 ring-opacity-50"
                                : ""
                            }`}
                            style={{ backgroundColor: color }}
                            title={`Select ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Location */}
              <div className={`flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                <FaMapMarkerAlt className="mr-2" />
                <span>{user.location}</span>
              </div>

              {/* Bio */}
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-4`}>
                {user.bio || "Nicio descriere încă..."}
              </p>

              {/* Interests */}
              {user.interests && user.interests.length > 0 && (
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
                  <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                    Interese
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, index) => (
                      <span
                        key={index}
                        className={`${theme === 'dark' ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'} px-3 py-1 rounded-full text-sm font-medium`}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    {user.stats.matches}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Match-uri</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-blue-600'}`}>
                    {user.stats.likes}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Like-uri</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                    {user.stats.cars}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Mașini</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className={`flex gap-2 sm:gap-1 rounded-2xl p-1 shadow-lg mt-8 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          {[
            { id: "overview", label: "Overview", icon: <FaCamera /> },
            { id: "cars", label: "My Cars", icon: <FaCar /> },
            { id: "badges", label: "Badges", icon: <FaTrophy /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "overview" | "cars" | "badges")
              }
              className={`flex-1 flex items-center justify-center sm:space-x-2 py-4 sm:py-3 px-2 sm:px-4 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? (theme === 'dark' ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-105" : "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105")
                  : theme === 'dark' ? "text-gray-400 hover:bg-slate-700 hover:scale-102" : "text-gray-600 hover:bg-gray-50 hover:scale-102"
              }`}
            >
              <span className="text-xl sm:text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {user.photos.map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative aspect-square rounded-2xl shadow-lg overflow-hidden group ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                >
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                    onLoad={() =>
                      console.log(
                        `🖼️ [Profile] Overview image ${
                          index + 1
                        } loaded successfully`
                      )
                    }
                    onError={(e) => {
                      console.error(
                        `❌ [Profile] Failed to load overview image ${
                          index + 1
                        }:`,
                        e
                      );
                      console.error(
                        `❌ [Profile] Image src was:`,
                        e.currentTarget.src
                      );
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button className="text-white p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition">
                      <FaEdit />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Add Photo Button */}
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: user.photos.length * 0.1 }}
                onClick={handleAddPhotos}
                className={`aspect-square ${theme === 'dark' ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 border-slate-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-300'} rounded-2xl shadow-lg flex flex-col items-center justify-center transition border-2 border-dashed`}
              >
                <FaPlus className="text-2xl mb-2" />
                <span className="text-sm font-medium">Add photo</span>
              </motion.button>
            </motion.div>
          )}

          {activeTab === "cars" && (
            <motion.div
              key="cars"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {user.cars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-xl font-bold flex items-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                        {car.make} {car.model}
                        {car.isMain && (
                          <span className={`ml-2 bg-gradient-to-r text-white text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'from-blue-600 to-purple-600' : 'from-blue-500 to-blue-600'}`}>
                            PRIMARY
                          </span>
                        )}
                      </h3>
                      <p className={`mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {car.year} • {car.color}
                      </p>

                      {/* Car Details */}
                      <div className={`grid grid-cols-2 gap-2 text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {car.engineSize && (
                          <div>
                            <span className="font-medium">Engine:</span>{" "}
                            {car.engineSize}
                          </div>
                        )}
                        {car.horsepower && (
                          <div>
                            <span className="font-medium">Power:</span>{" "}
                            {car.horsepower} HP
                          </div>
                        )}
                        {car.doors && (
                          <div>
                            <span className="font-medium">Doors:</span>{" "}
                            {car.doors}
                          </div>
                        )}
                        {car.seats && (
                          <div>
                            <span className="font-medium">Seats:</span>{" "}
                            {car.seats}
                          </div>
                        )}
                        {car.transmission && (
                          <div>
                            <span className="font-medium">Transmission:</span>{" "}
                            {car.transmission}
                          </div>
                        )}
                        {car.fuelType && (
                          <div>
                            <span className="font-medium">Fuel:</span>{" "}
                            {car.fuelType}
                          </div>
                        )}
                      </div>

                      {/* Modifications */}
                      {car.mods && car.mods.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Modifications:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {car.mods.slice(0, 3).map((mod, modIndex) => (
                              <span
                                key={modIndex}
                                className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                              >
                                {mod}
                              </span>
                            ))}
                            {car.mods.length > 3 && (
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                +{car.mods.length - 3} others
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCar(car.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {car.photos.map((photo, photoIndex) => (
                      <img
                        key={photoIndex}
                        src={photo}
                        alt={`${car.make} ${car.model}`}
                        className="aspect-video object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Add Car Button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: user.cars.length * 0.1 }}
                onClick={handleAddCar}
                className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'}`}
              >
                <FaPlus className="text-3xl mb-3" />
                <span className="text-lg font-medium">
                  Add a new car
                </span>
                <span className="text-sm text-gray-400 mt-1">
                  Show off your car collection
                </span>
              </motion.button>
            </motion.div>
          )}

          {activeTab === "badges" && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {user.badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-6 ${
                    badge.earned
                      ? "border-l-4 border-green-500"
                      : "border-l-4 border-gray-300"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{getBadgeIcon(badge)}</div>
                    <div className="flex-1">
                      <h3
                        className={`font-bold ${
                          badge.earned ? "text-green-600" : theme === 'dark' ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {badge.name}
                      </h3>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {badge.description}
                      </p>

                      {!badge.earned && badge.progress && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progres</span>
                            <span>{badge.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r h-2 rounded-full ${theme === 'dark' ? 'from-blue-500 to-purple-500' : 'from-blue-500 to-blue-600'}`}
                              style={{ width: `${badge.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Car Modal */}
      <AnimatePresence>
        {showAddCarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddCarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <AddCarModal
                onClose={() => setShowAddCarModal(false)}
                onCarAdded={async () => {
                  setShowAddCarModal(false);
                  // Refresh the entire profile to get latest data with proper photo URLs
                  await fetchUserProfile();
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Photos Modal */}
      <AnimatePresence>
        {showAddPhotosModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddPhotosModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-3xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <AddPhotosModal
                onClose={() => setShowAddPhotosModal(false)}
                onPhotosAdded={(newPhotos) => {
                  if (user) {
                    setUser({
                      ...user,
                      photos: [...user.photos, ...newPhotos],
                    });
                  }
                  setShowAddPhotosModal(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
