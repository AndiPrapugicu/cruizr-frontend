import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TinderCard from "react-tinder-card";
import {
  FaHeart,
  FaTimes,
  FaStar,
  FaMapMarkerAlt,
  FaCar,
  FaFire,
  FaGem,
  FaCrown,
  FaCog,
  FaInfoCircle,
  FaPlay,
} from "react-icons/fa";
import api from "../services/api";
import { usePowerUps } from "../contexts/PowerUpContext";

// Helper function to build photo URLs
const getPhotoUrl = (photo: string | PhotoItem): string => {
  if (typeof photo === "string") {
    // If photo already starts with http/https, use as is
    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }
    // If it's a relative path, prepend the API base URL
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return photo.startsWith("/") ? `${baseUrl}${photo}` : `${baseUrl}/${photo}`;
  }
  // For PhotoItem objects
  return photo.url || "";
};

interface User {
  id: string;
  name: string;
  age: number;
  distance: number;
  bio: string;
  photos: string[];
  carDetails?: {
    make: string;
    model: string;
    year: number;
    photo: string;
    engine?: {
      displacement: string;
      horsepower: number;
      type: string; // "sedan", "coupe", "suv", etc.
    };
    modifications?: string[];
  };
  isVip: boolean;
  badges: string[];
  lastSeen: string;
  isOnline: boolean;
  hasVideo: boolean;
  interests?: string[];
  garageVideo?: string;
}

interface ShowDetailModal {
  show: boolean;
  user: User | null;
}

interface MatchNotification {
  show: boolean;
  user: User;
}

interface BackendUser {
  id: number;
  name?: string;
  firstName?: string;
  age?: number;
  birthdate?: string;
  distance?: number;
  bio?: string;
  description?: string;
  photos?: Array<{ url: string } | string>;
  imageUrl?: string;
  carModel?: string;
  carMake?: string;
  carYear?: number;
  carPhoto?: string;
  isVip?: boolean;
  badges?: string[];
  lastActive?: string;
  isOnline?: boolean;
  hasVideo?: boolean;
}

interface PhotoItem {
  url?: string;
}

export default function Nearby() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchNotification, setMatchNotification] =
    useState<MatchNotification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<ShowDetailModal>({
    show: false,
    user: null,
  });
  const childRefs = useRef<(unknown | null)[]>([]);

  // ✨ Add PowerUp context integration
  const {
    isBoostActive,
    isSpotlightActive,
    isSeeWhoLikedActive,
    superLikesRemaining,
    rewindsRemaining,
    loading: powerUpLoading,
    error: powerUpError,
    activateBoost,
    sendSuperLike,
    revealLikes,
    // rewindLastSwipe,
    // refreshActiveFeatures,
    clearError,
  } = usePowerUps();

  // Handle PowerUp errors
  useEffect(() => {
    if (powerUpError) {
      console.error("PowerUp Error:", powerUpError);
      // Auto clear error after 5 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [powerUpError, clearError]);

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      try {
        // Get user's current location
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Fetch nearby users from backend
            const response = await api.get("/users/nearby", {
              params: {
                lat: latitude,
                lng: longitude,
                distance: 25, // 25km radius
              },
            });

            // Transform backend data to match frontend interface
            const nearbyUsers: User[] = response.data.map(
              (user: BackendUser) => ({
                id: user.id.toString(),
                name: user.name || user.firstName || "Unknown",
                age: user.age || calculateAge(user.birthdate),
                distance: user.distance || 0,
                bio: user.bio || user.description || "",
                photos:
                  user.photos && user.photos.length > 0
                    ? user.photos.map((photo: PhotoItem | string) => {
                        const photoUrl =
                          typeof photo === "string" ? photo : photo.url;
                        return photoUrl?.startsWith("http")
                          ? photoUrl
                          : `http://localhost:3000${
                              photoUrl || "/default-avatar.jpg"
                            }`;
                      })
                    : [
                        user.imageUrl?.startsWith("http")
                          ? user.imageUrl
                          : `http://localhost:3000${
                              user.imageUrl || "/default-avatar.jpg"
                            }`,
                      ],
                carDetails: user.carModel
                  ? {
                      make: user.carMake || "Unknown",
                      model: user.carModel,
                      year: user.carYear || new Date().getFullYear(),
                      photo: user.carPhoto || "/default-car.jpg",
                      engine: {
                        displacement: "2.0L",
                        horsepower: 250,
                        type: "sedan",
                      },
                      modifications: [
                        "Cold Air Intake",
                        "Exhaust System",
                        "Lowering Kit",
                      ],
                    }
                  : undefined,
                interests: [
                  "Cars",
                  "Racing",
                  "Tuning",
                  "Road Trips",
                  "Photography",
                ],
                garageVideo: user.hasVideo
                  ? "/sample-garage-tour.mp4"
                  : undefined,
                isVip: user.isVip || false,
                badges: user.badges || [],
                lastSeen: user.lastActive
                  ? formatLastSeen(user.lastActive)
                  : "Recently active",
                isOnline: user.isOnline || false,
                hasVideo: user.hasVideo || false,
              })
            );

            // Log each user for debugging
            nearbyUsers.forEach((user, index) => {
              console.log(`User ${index + 1}:`, {
                id: user.id,
                name: user.name,
                age: user.age,
                distance: user.distance,
                photos: user.photos?.length || 0,
                carDetails: user.carDetails
                  ? `${user.carDetails.make} ${user.carDetails.model}`
                  : "No car",
                isVip: user.isVip,
                isOnline: user.isOnline,
                badges: user.badges?.length || 0,
              });
            });

            setUsers(nearbyUsers);
            setCurrentIndex(nearbyUsers.length - 1); // Set index to last user
            setLoading(false);
            childRefs.current = Array(nearbyUsers.length)
              .fill(0)
              .map((_, i) => childRefs.current[i] || null);
          },
          (error) => {
            console.error("❌ Geolocation error:", error);
            // Fallback: load users without location
            loadUsersWithoutLocation();
          }
        );
      } catch (error) {
        console.error("Error fetching nearby users:", error);
        setLoading(false);
        // Could show a toast notification here
      }
    };

    const loadUsersWithoutLocation = async () => {
      try {
        // Fallback API call without location
        const response = await api.get("/users/nearby", {
          params: {
            lat: 45.7408, // Timișoara default
            lng: 21.2599, // Timișoara default
            distance: 50,
          },
        });

        const transformedUsers = response.data.map((user: BackendUser) => ({
          id: user.id.toString(),
          name: user.name || user.firstName || "Unknown",
          age: user.age || calculateAge(user.birthdate),
          distance: user.distance || 0,
          bio: user.bio || user.description || "",
          photos:
            user.photos && user.photos.length > 0
              ? user.photos.map((photo: PhotoItem | string) => {
                  const photoUrl =
                    typeof photo === "string" ? photo : photo.url;
                  return photoUrl?.startsWith("http")
                    ? photoUrl
                    : `http://localhost:3000${
                        photoUrl || "/default-avatar.jpg"
                      }`;
                })
              : [
                  user.imageUrl?.startsWith("http")
                    ? user.imageUrl
                    : `http://localhost:3000${
                        user.imageUrl || "/default-avatar.jpg"
                      }`,
                ],
          carDetails: user.carModel
            ? {
                make: user.carMake || "Unknown",
                model: user.carModel,
                year: user.carYear || new Date().getFullYear(),
                photo: user.carPhoto || "/default-car.jpg",
                engine: {
                  displacement: "2.0L",
                  horsepower: 250,
                  type: "sedan",
                },
                modifications: [
                  "Cold Air Intake",
                  "Exhaust System",
                  "Lowering Kit",
                ],
              }
            : undefined,
          interests: ["Cars", "Racing", "Tuning", "Road Trips", "Photography"],
          garageVideo: user.hasVideo ? "/sample-garage-tour.mp4" : undefined,
          isVip: user.isVip || false,
          badges: user.badges || [],
          lastSeen: user.lastActive
            ? formatLastSeen(user.lastActive)
            : "Recently active",
          isOnline: user.isOnline || false,
          hasVideo: user.hasVideo || false,
        }));

        setUsers(transformedUsers);
        setCurrentIndex(transformedUsers.length - 1); // Set index to last user

        setLoading(false);
        childRefs.current = Array(transformedUsers.length)
          .fill(0)
          .map((_, i) => childRefs.current[i] || null);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    const calculateAge = (birthdate: string | null | undefined): number => {
      if (!birthdate) return 25; // default age
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

    const formatLastSeen = (lastActive: string): string => {
      const now = new Date();
      const lastActiveDate = new Date(lastActive);
      const diffInMinutes = Math.floor(
        (now.getTime() - lastActiveDate.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 5) return "Acum";
      if (diffInMinutes < 60) return `Activ în urmă cu ${diffInMinutes} minute`;
      if (diffInMinutes < 1440)
        return `Activ în urmă cu ${Math.floor(diffInMinutes / 60)} ore`;

      return `Activ în urmă cu ${Math.floor(diffInMinutes / 1440)} zile`;
    };

    fetchNearbyUsers();
  }, []);

  const swiped = async (direction: string, user: User, index: number) => {
    console.log(`Swiped ${direction} on ${user.name}`);
    setCurrentIndex(index - 1);

    try {
      // Send swipe to backend
      const response = await api.post("/matches/swipe", {
        userId: parseInt(user.id),
        direction: direction,
      });

      if (direction === "right" && response.data.isMatch) {
        setMatchNotification({
          show: true,
          user: user,
        });
      }
    } catch (error) {
      console.error("Error sending swipe:", error);
      // Could show a toast notification here
    }
  };

  const outOfFrame = (name: string, index: number) => {
    console.log(`${name} left the screen!`, index);
  };

  const swipe = (dir: string) => {
    if (currentIndex >= 0 && childRefs.current[currentIndex]) {
      const cardRef = childRefs.current[currentIndex] as {
        swipe: (direction: string) => void;
      };
      cardRef.swipe(dir);
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Speed Demon":
        return <FaFire className="text-red-500" />;
      case "Road Tripper":
        return <FaMapMarkerAlt className="text-blue-500" />;
      case "Car Expert":
        return <FaCar className="text-purple-500" />;
      case "Tuning Master":
        return <FaGem className="text-green-500" />;
      case "Classic Lover":
        return <FaCrown className="text-yellow-500" />;
      case "New Driver":
        return <FaStar className="text-blue-400" />;
      case "Adventure Seeker":
        return <FaMapMarkerAlt className="text-green-400" />;
      default:
        return <FaStar className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <div
        className="w-full h-full overflow-hidden bg-white relative"
        style={{
          position: "relative",
          contain: "layout style paint",
          isolation: "isolate",
        }}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover People
          </h1>
          <p className="text-gray-600">Find your perfect match nearby</p>
        </div>

        {/* Main Swipe Area */}
        <div className="flex gap-8 h-[calc(100vh-140px)] px-8 py-6">
          {/* Card Stack Section */}
          <motion.div
            className="flex-1 flex items-start justify-center relative"
            animate={{
              x: showDetailModal.show ? -150 : 0,
              scale: showDetailModal.show ? 1 : 1,
              transition: { duration: 0.6, ease: "easeInOut" },
            }}
          >
            <div
              className="relative w-full max-w-md mx-auto"
              style={{ height: "600px", minHeight: "600px" }}
            >
              {users.length > 0 &&
                users.map((user, index) => {
                  return (
                    <TinderCard
                      ref={(el) => {
                        childRefs.current[index] = el;
                      }}
                      className="absolute w-full h-full"
                      key={user.id}
                      onSwipe={(dir) => swiped(dir, user, index)}
                      onCardLeftScreen={() => outOfFrame(user.name, index)}
                      preventSwipe={["up", "down"]}
                      swipeRequirementType="position"
                      swipeThreshold={150}
                      flickOnSwipe={false}
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        whileHover={{ scale: 1.02 }}
                        className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          backgroundColor: "white",
                          borderRadius: "24px",
                          boxShadow:
                            index === currentIndex
                              ? "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                              : "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                          transform:
                            index === currentIndex
                              ? "scale(1)"
                              : `scale(${
                                  0.98 -
                                  Math.min((currentIndex - index) * 0.01, 0.05)
                                })`,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          zIndex: users.length - index,
                        }}
                      >
                        {user.isVip && (
                          <div className="absolute top-4 right-4 z-20">
                            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center shadow-lg backdrop-blur-sm">
                              <FaCrown className="mr-2 text-yellow-100" />
                              VIP
                            </div>
                          </div>
                        )}

                        {user.isOnline && (
                          <div className="absolute top-4 left-4 z-20">
                            <div className="flex items-center bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
                              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                              Online Now
                            </div>
                          </div>
                        )}

                        <div className="relative h-full overflow-hidden rounded-3xl">
                          <img
                            src={getPhotoUrl(user.photos[0])}
                            alt={user.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            style={{
                              filter:
                                "brightness(1.05) contrast(1.02) saturate(1.1)",
                            }}
                          />

                          {/* Gradient overlay for better text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"></div>

                          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
                            {user.photos.map((_, photoIndex) => (
                              <div
                                key={photoIndex}
                                className={`w-8 h-1 rounded-full transition-all duration-300 ${
                                  photoIndex === 0
                                    ? "bg-white shadow-lg"
                                    : "bg-white/40 hover:bg-white/60"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Info Button - positioned in top right corner */}
                          <button
                            onClick={() =>
                              setShowDetailModal({ show: true, user })
                            }
                            className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-md text-white p-3 rounded-full shadow-lg hover:bg-white/30 transition-all duration-200 cursor-pointer"
                          >
                            <FaInfoCircle className="text-lg" />
                          </button>

                          {user.hasVideo && (
                            <div className="absolute top-16 right-4 z-10">
                              <div className="bg-black/70 backdrop-blur-sm text-white p-2.5 rounded-full shadow-lg hover:bg-black/80 transition-all duration-200 cursor-pointer">
                                <FaPlay className="text-sm" />
                              </div>
                            </div>
                          )}

                          {/* Name, Age and Location overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                            <div className="text-white space-y-2">
                              <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold tracking-tight">
                                  {user.name}, {user.age}
                                </h2>
                                <div className="flex items-center text-white/80 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                  <FaMapMarkerAlt className="mr-1 text-sm" />
                                  <span className="text-sm font-medium">
                                    {user.distance}km
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-white/90 text-sm">
                                  <FaMapMarkerAlt className="mr-1.5 text-xs" />
                                  Lives in Timișoara
                                </div>
                                {user.badges.length > 0 && (
                                  <div className="flex items-center text-xs text-purple-200 bg-purple-500/30 backdrop-blur-sm px-2 py-1 rounded-full">
                                    <FaStar className="mr-1" />
                                    {user.badges.length} badges
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </TinderCard>
                  );
                })}
            </div>
          </motion.div>

          {/* Detail Panel - appears next to cards */}
          <AnimatePresence>
            {showDetailModal.show && showDetailModal.user && (
              <motion.div
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-[450px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col"
                style={{
                  height: "600px",
                  position: "relative",
                  isolation: "isolate",
                  contain: "layout style paint",
                }}
              >
                {/* Header */}
                <div className="relative p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white flex-shrink-0">
                  <button
                    onClick={() =>
                      setShowDetailModal({ show: false, user: null })
                    }
                    className="absolute top-4 right-4 p-2 bg-gradient-to-r from-red-400 to-red-600 hover:shadow-lg rounded-full transition-all z-10"
                  >
                    <FaTimes className="text-white text-lg" />
                  </button>
                  <div className="flex items-center space-x-4 pr-12">
                    <img
                      src={getPhotoUrl(showDetailModal.user.photos[0])}
                      alt={showDetailModal.user.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-white truncate">
                        {showDetailModal.user.name}, {showDetailModal.user.age}
                      </h2>
                      <div className="flex items-center text-white/90 mt-1">
                        <FaMapMarkerAlt className="mr-1 text-sm" />
                        <span className="text-sm">
                          {showDetailModal.user.distance}km away
                        </span>
                      </div>
                      {showDetailModal.user.isOnline && (
                        <div className="flex items-center text-white/90 mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          <span className="text-sm">Online now</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                  {/* Bio Section */}
                  {showDetailModal.user.bio && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl"
                    >
                      <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
                        <FaHeart className="mr-2 text-pink-500" />
                        About Me
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {showDetailModal.user.bio}
                      </p>
                    </motion.div>
                  )}

                  {/* Badges/Achievements */}
                  {showDetailModal.user.badges.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-2xl"
                    >
                      <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                        <FaStar className="mr-2 text-yellow-500" />
                        Achievements
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {showDetailModal.user.badges
                          .slice(0, 4)
                          .map((badge, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-white/80 backdrop-blur-sm text-gray-700 px-3 py-2 rounded-xl text-sm font-medium shadow-sm"
                            >
                              {getBadgeIcon(badge)}
                              <span className="ml-2">{badge}</span>
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Car Details */}
                  {showDetailModal.user.carDetails && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl"
                    >
                      <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                        <FaCar className="mr-2 text-blue-500" />
                        My Ride
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                          <div className="text-md font-bold text-blue-800">
                            {showDetailModal.user.carDetails.make}{" "}
                            {showDetailModal.user.carDetails.model}
                          </div>
                          <div className="text-sm text-blue-600">
                            Year: {showDetailModal.user.carDetails.year}
                          </div>
                          {showDetailModal.user.carDetails.engine && (
                            <>
                              <div className="text-sm text-blue-600">
                                Engine:{" "}
                                {
                                  showDetailModal.user.carDetails.engine
                                    .displacement
                                }{" "}
                                •{" "}
                                {
                                  showDetailModal.user.carDetails.engine
                                    .horsepower
                                }{" "}
                                HP
                              </div>
                              <div className="text-sm text-blue-600 capitalize">
                                Type:{" "}
                                {showDetailModal.user.carDetails.engine.type}
                              </div>
                            </>
                          )}
                        </div>
                        {showDetailModal.user.carDetails.modifications && (
                          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                            <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <FaCog className="mr-1" />
                              Modifications
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {showDetailModal.user.carDetails.modifications
                                .slice(0, 3)
                                .map((mod, index) => (
                                  <span
                                    key={index}
                                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs"
                                  >
                                    {mod}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Interests */}
                  {showDetailModal.user.interests &&
                    showDetailModal.user.interests.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl"
                      >
                        <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                          <FaFire className="mr-2 text-green-500" />
                          Interests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {showDetailModal.user.interests
                            .slice(0, 6)
                            .map((interest, index) => (
                              <span
                                key={index}
                                className="bg-white/80 backdrop-blur-sm text-green-700 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
                              >
                                {interest}
                              </span>
                            ))}
                        </div>
                      </motion.div>
                    )}
                </div>

                {/* Action buttons - Fixed at bottom of panel */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowDetailModal({ show: false, user: null });
                        swipe("left");
                      }}
                      className="flex-1 bg-gradient-to-r from-red-400 to-red-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                    >
                      <FaTimes className="mr-2" />
                      Pass
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowDetailModal({ show: false, user: null });
                        swipe("right");
                      }}
                      className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                    >
                      <FaHeart className="mr-2" />
                      Like
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Sidebar - Actions & Stats - compressed when detail panel is open */}
          <motion.div
            className="h-full overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            animate={{
              width: showDetailModal.show ? 240 : 320,
              transition: { duration: 0.6, ease: "easeInOut" },
            }}
          >
            {/* Action Buttons */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3
                className={`font-semibold text-gray-800 mb-4 ${
                  showDetailModal.show ? "text-md" : "text-lg"
                }`}
              >
                Quick Actions
              </h3>
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => swipe("left")}
                  disabled={currentIndex < 0}
                  className={`bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    showDetailModal.show ? "w-12 h-12" : "w-16 h-16"
                  }`}
                >
                  <FaTimes
                    className={showDetailModal.show ? "text-md" : "text-xl"}
                  />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={async () => {
                    // ✨ REAL Super Like Logic - Connected to Backend!
                    if (
                      currentIndex >= 0 &&
                      users[currentIndex] &&
                      superLikesRemaining > 0
                    ) {
                      const currentUser = users[currentIndex];
                      console.log(
                        "🌟 Sending Super Like to:",
                        currentUser.name
                      );

                      try {
                        const success = await sendSuperLike(
                          parseInt(currentUser.id)
                        );
                        if (success) {
                          // Super like was successful, now trigger the swipe animation
                          swipe("right");
                          console.log("✅ Super Like sent successfully!");
                        } else {
                          console.log("❌ Super Like failed:", powerUpError);
                        }
                      } catch (error) {
                        console.error("❌ Error sending Super Like:", error);
                      }
                    } else if (superLikesRemaining === 0) {
                      alert(
                        "No Super Likes remaining! Visit the store to get more."
                      );
                    }
                  }}
                  disabled={
                    currentIndex < 0 ||
                    superLikesRemaining === 0 ||
                    powerUpLoading
                  }
                  className={`bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    showDetailModal.show ? "w-12 h-12" : "w-16 h-16"
                  } ${superLikesRemaining === 0 ? "opacity-50" : ""}`}
                >
                  <FaStar
                    className={showDetailModal.show ? "text-md" : "text-xl"}
                  />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => swipe("right")}
                  disabled={currentIndex < 0}
                  className={`bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    showDetailModal.show ? "w-12 h-12" : "w-16 h-16"
                  }`}
                >
                  <FaHeart
                    className={showDetailModal.show ? "text-md" : "text-xl"}
                  />
                </motion.button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3
                className={`font-semibold text-gray-800 mb-4 ${
                  showDetailModal.show ? "text-md" : "text-lg"
                }`}
              >
                Today's Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`bg-pink-100 rounded-full flex items-center justify-center ${
                        showDetailModal.show ? "w-8 h-8" : "w-10 h-10"
                      }`}
                    >
                      <FaHeart className="text-pink-500" />
                    </div>
                    <span
                      className={`text-gray-700 ${
                        showDetailModal.show ? "text-sm" : ""
                      }`}
                    >
                      Likes Given
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">0</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`bg-blue-100 rounded-full flex items-center justify-center ${
                        showDetailModal.show ? "w-8 h-8" : "w-10 h-10"
                      }`}
                    >
                      <FaStar className="text-blue-500" />
                    </div>
                    <span
                      className={`text-gray-700 ${
                        showDetailModal.show ? "text-sm" : ""
                      }`}
                    >
                      Super Likes
                    </span>
                  </div>
                  <span
                    className={`font-semibold ${
                      superLikesRemaining > 0
                        ? "text-blue-600"
                        : "text-gray-900"
                    }`}
                  >
                    {superLikesRemaining}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`bg-green-100 rounded-full flex items-center justify-center ${
                        showDetailModal.show ? "w-8 h-8" : "w-10 h-10"
                      }`}
                    >
                      <FaFire className="text-green-500" />
                    </div>
                    <span
                      className={`text-gray-700 ${
                        showDetailModal.show ? "text-sm" : ""
                      }`}
                    >
                      Matches
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">0</span>
                </div>

                {/* Add Rewinds stat */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`bg-orange-100 rounded-full flex items-center justify-center ${
                        showDetailModal.show ? "w-8 h-8" : "w-10 h-10"
                      }`}
                    >
                      <FaTimes className="text-orange-500" />
                    </div>
                    <span
                      className={`text-gray-700 ${
                        showDetailModal.show ? "text-sm" : ""
                      }`}
                    >
                      Rewinds
                    </span>
                  </div>
                  <span
                    className={`font-semibold ${
                      rewindsRemaining > 0 ? "text-orange-600" : "text-gray-900"
                    }`}
                  >
                    {rewindsRemaining}
                  </span>
                </div>
              </div>
            </div>

            {!showDetailModal.show && (
              <>
                {/* Boost Section */}
                <div
                  className={`rounded-2xl p-6 shadow-lg text-white ${
                    isBoostActive || isSpotlightActive
                      ? "bg-gradient-to-r from-green-500 to-green-600"
                      : "bg-gradient-to-r from-purple-500 to-pink-500"
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {isBoostActive || isSpotlightActive
                      ? "Boost Active!"
                      : "Get More Matches"}
                  </h3>
                  <p className="text-white/90 text-sm mb-4 leading-relaxed">
                    {isBoostActive || isSpotlightActive
                      ? "Your profile is currently boosted and visible to more people!"
                      : "Use a Boost to be the top profile in your area for 30 minutes!"}
                  </p>
                  <button
                    onClick={async () => {
                      // ✨ REAL Boost Logic - Connected to Backend!
                      if (!isBoostActive && !isSpotlightActive) {
                        try {
                          console.log("🚀 Activating Profile Boost...");
                          const success = await activateBoost("boost-3h");
                          if (success) {
                            console.log(
                              "✅ Profile Boost activated successfully!"
                            );
                          } else {
                            console.log(
                              "❌ Boost activation failed:",
                              powerUpError
                            );
                            alert(
                              "Failed to activate boost. Please check your inventory or visit the store."
                            );
                          }
                        } catch (error) {
                          console.error("❌ Error activating boost:", error);
                        }
                      }
                    }}
                    disabled={
                      isBoostActive || isSpotlightActive || powerUpLoading
                    }
                    className="w-full bg-white/20 backdrop-blur-sm text-white py-3 px-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaFire className="mr-2" />
                    {powerUpLoading
                      ? "Loading..."
                      : isBoostActive || isSpotlightActive
                      ? "Boost Active"
                      : "Activate Boost"}
                  </button>
                </div>

                {/* See Who Liked You Feature */}
                <div
                  className={`rounded-2xl p-6 shadow-lg border ${
                    isSeeWhoLikedActive
                      ? "bg-gradient-to-r from-green-400 to-green-500 text-white border-green-200"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <div className="text-center">
                    <FaGem
                      className={`text-4xl mx-auto mb-4 ${
                        isSeeWhoLikedActive ? "text-white" : "text-yellow-500"
                      }`}
                    />
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        isSeeWhoLikedActive ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {isSeeWhoLikedActive
                        ? "See Who Liked Active!"
                        : "See Who Likes You"}
                    </h3>
                    <p
                      className={`text-sm mb-4 leading-relaxed ${
                        isSeeWhoLikedActive ? "text-white/90" : "text-gray-600"
                      }`}
                    >
                      {isSeeWhoLikedActive
                        ? "You can now see who liked your profile!"
                        : "Reveal who likes you and get more matches!"}
                    </p>
                    <button
                      onClick={async () => {
                        // ✨ REAL See Who Liked Logic - Connected to Backend!
                        if (!isSeeWhoLikedActive) {
                          try {
                            console.log("👁️ Revealing who liked you...");
                            const result = await revealLikes();
                            if (result.success) {
                              console.log(
                                "✅ Likes revealed successfully!",
                                result.likedUsers
                              );
                              if (
                                result.likedUsers &&
                                result.likedUsers.length > 0
                              ) {
                                alert(
                                  `You have ${result.likedUsers.length} people who liked you!`
                                );
                              } else {
                                alert("No new likes found. Keep swiping!");
                              }
                            } else {
                              console.log(
                                "❌ Failed to reveal likes:",
                                powerUpError
                              );
                              alert(
                                "Failed to reveal likes. Please check your inventory or visit the store."
                              );
                            }
                          } catch (error) {
                            console.error("❌ Error revealing likes:", error);
                          }
                        }
                      }}
                      disabled={isSeeWhoLikedActive || powerUpLoading}
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSeeWhoLikedActive
                          ? "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                          : "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:shadow-lg"
                      }`}
                    >
                      <FaCrown className="mr-2" />
                      {powerUpLoading
                        ? "Loading..."
                        : isSeeWhoLikedActive
                        ? "Feature Active"
                        : "Reveal Now"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* No more users message */}
          {currentIndex < 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            >
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <FaHeart className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                No more people
              </h3>
              <p className="text-gray-600 mb-6">
                You've seen everyone in your area. Come back later for new
                profiles!
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition duration-300"
              >
                Refresh
              </button>
            </motion.div>
          )}
        </div>

        {/* Match Notification */}
        <AnimatePresence>
          {matchNotification?.show && matchNotification.user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                  className="text-6xl mb-4"
                >
                  💕
                </motion.div>

                <h2 className="text-3xl font-bold gradient-text mb-2">
                  IT'S A MATCH!
                </h2>

                <p className="text-gray-600 mb-6">
                  Tu și {matchNotification.user.name} v-ați plăcut reciproc!
                </p>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setMatchNotification(null)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-full font-semibold"
                  >
                    Continuă
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-full font-semibold">
                    Trimite mesaj
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
