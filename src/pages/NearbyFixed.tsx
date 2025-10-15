import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TinderCard from "react-tinder-card";
import api from "../services/api";
import {
  FaHeart,
  FaTimes,
  FaStar,
  FaCar,
  FaMapMarkerAlt,
  FaFire,
  FaGem,
  FaCrown,
  FaPlay,
} from "react-icons/fa";

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
  };
  isVip: boolean;
  badges: string[];
  lastSeen: string;
  isOnline: boolean;
  hasVideo?: boolean;
}

interface MatchNotification {
  user: User;
  show: boolean;
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

const Nearby = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchNotification, setMatchNotification] =
    useState<MatchNotification | null>(null);
  const childRefs = useRef<(unknown | null)[]>([]);

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
                    ? user.photos.map((photo: PhotoItem | string) =>
                        typeof photo === "string"
                          ? photo
                          : photo.url || "/default-avatar.jpg"
                      )
                    : [user.imageUrl || "/default-avatar.jpg"],
                carDetails: user.carModel
                  ? {
                      make: user.carMake || "Unknown",
                      model: user.carModel,
                      year: user.carYear || new Date().getFullYear(),
                      photo: user.carPhoto || "/default-car.jpg",
                    }
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

            setUsers(nearbyUsers);
            setLoading(false);
            childRefs.current = Array(nearbyUsers.length)
              .fill(0)
              .map((_, i) => childRefs.current[i] || null);
          },
          (error) => {
            console.error("Geolocation error:", error);
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
            lat: 44.4268, // Bucharest default
            lng: 26.1025,
            distance: 50,
          },
        });

        const nearbyUsers: User[] = response.data.map((user: BackendUser) => ({
          id: user.id.toString(),
          name: user.name || user.firstName || "Unknown",
          age: user.age || calculateAge(user.birthdate),
          distance: user.distance || 0,
          bio: user.bio || user.description || "",
          photos:
            user.photos && user.photos.length > 0
              ? user.photos.map((photo: PhotoItem | string) =>
                  typeof photo === "string"
                    ? photo
                    : photo.url || "/default-avatar.jpg"
                )
              : [user.imageUrl || "/default-avatar.jpg"],
          carDetails: user.carModel
            ? {
                make: user.carMake || "Unknown",
                model: user.carModel,
                year: user.carYear || new Date().getFullYear(),
                photo: user.carPhoto || "/default-car.jpg",
              }
            : undefined,
          isVip: user.isVip || false,
          badges: user.badges || [],
          lastSeen: user.lastActive
            ? formatLastSeen(user.lastActive)
            : "Recently active",
          isOnline: user.isOnline || false,
          hasVideo: user.hasVideo || false,
        }));

        setUsers(nearbyUsers);
        setLoading(false);
        childRefs.current = Array(nearbyUsers.length)
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

      if (diffInMinutes < 5) return "Active acum";
      if (diffInMinutes < 60) return `Activ în urmă cu ${diffInMinutes} min`;
      if (diffInMinutes < 1440)
        return `Activ în urmă cu ${Math.floor(diffInMinutes / 60)}h`;
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
        // Show match notification if it's a match
        setMatchNotification({ user, show: true });
        setTimeout(() => {
          setMatchNotification(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error sending swipe:", error);
      // Could show a toast notification here
    }
  };

  const outOfFrame = (name: string, index: number) => {
    console.log(`${name} left the screen!`, index);
  };

  const swipe = async (dir: string) => {
    if (currentIndex >= 0 && childRefs.current[currentIndex]) {
      const cardRef = childRefs.current[currentIndex] as {
        swipe: (direction: string) => void;
      };
      await cardRef.swipe(dir);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 pt-20">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Descoperă</h1>
        <p className="text-gray-600">Găsește persoane aproape de tine</p>
      </div>

      <div className="relative max-w-sm mx-auto" style={{ height: "600px" }}>
        {users.map((user, index) => (
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
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
            >
              {user.isVip && (
                <div className="absolute top-4 right-4 z-20">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-lg">
                    <FaCrown className="mr-1" />
                    VIP
                  </div>
                </div>
              )}

              {user.isOnline && (
                <div className="absolute top-4 left-4 z-20">
                  <div className="flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    Online
                  </div>
                </div>
              )}

              <div className="relative h-3/5 overflow-hidden">
                <img
                  src={user.photos[0]}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {user.photos.map((_, photoIndex) => (
                    <div
                      key={photoIndex}
                      className={`w-2 h-2 rounded-full ${
                        photoIndex === 0 ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                {user.hasVideo && (
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-black/70 text-white p-2 rounded-full">
                      <FaPlay className="text-sm" />
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>

              <div className="p-6 h-2/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {user.name}, {user.age}
                    </h2>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-1 text-sm" />
                      <span className="text-sm">{user.distance}km</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {user.bio}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {user.badges.slice(0, 2).map((badge, badgeIndex) => (
                      <div
                        key={badgeIndex}
                        className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                      >
                        {getBadgeIcon(badge)}
                        <span className="ml-1">{badge}</span>
                      </div>
                    ))}
                    {user.badges.length > 2 && (
                      <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        +{user.badges.length - 2}
                      </div>
                    )}
                  </div>

                  {user.carDetails && (
                    <div className="flex items-center bg-blue-50 p-2 rounded-lg">
                      <FaCar className="text-blue-500 mr-2" />
                      <span className="text-sm text-blue-700 font-medium">
                        {user.carDetails.make} {user.carDetails.model} (
                        {user.carDetails.year})
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  {user.lastSeen}
                </div>
              </div>
            </motion.div>
          </TinderCard>
        ))}

        {currentIndex < 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center p-8"
          >
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <FaHeart className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Nu mai sunt persoane
            </h3>
            <p className="text-gray-600 mb-6">
              Ai văzut toate persoanele din zona ta. Revino mai târziu pentru
              profiluri noi!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition duration-300"
            >
              Reîncarcă
            </button>
          </motion.div>
        )}
      </div>

      {currentIndex >= 0 && (
        <div className="flex justify-center space-x-6 mt-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => swipe("left")}
            className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition duration-300"
          >
            <FaTimes className="text-2xl text-gray-500" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => swipe("right")}
            className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition duration-300"
          >
            <FaHeart className="text-2xl text-white" />
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {matchNotification?.show && (
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
  );
};

export default Nearby;
