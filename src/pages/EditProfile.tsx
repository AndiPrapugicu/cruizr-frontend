import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  FaArrowLeft,
  FaSave,
  FaUser,
  FaMapMarkerAlt,
  FaHeart,
  FaCamera,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

// Helper function to build photo URLs
const getPhotoUrl = (photo: string): string => {
  if (!photo) return "";
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  return photo.startsWith("/") ? `${baseUrl}${photo}` : `${baseUrl}/${photo}`;
};

interface EditableProfile {
  name: string;
  bio: string;
  city: string;
  interests: string[];
  photos: string[];
}

const commonInterests = [
  "Tuning",
  "Racing",
  "Drag Racing",
  "Track Days",
  "Car Shows",
  "Classic Cars",
  "Muscle Cars",
  "European Cars",
  "Japanese Cars",
  "German Cars",
  "Italian Cars",
  "Supercars",
  "Hypercars",
  "Motorcycles",
  "Formula 1",
  "Rally",
  "Drifting",
  "Car Detailing",
  "Car Photography",
  "Car Mechanics",
  "Engine Tuning",
  "Car Audio",
  "Car Wrapping",
  "Car Restoration",
  "Off-Road",
  "4x4",
  "Electric Cars",
  "Vintage Cars",
  "JDM Culture",
  "Car Clubs",
  "Auto Parts",
  "Performance Mods",
  "Street Racing",
  "Car Culture",
  "Automotive Tech",
  "Car Design",
];

export default function EditProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EditableProfile>({
    name: "",
    bio: "",
    city: "",
    interests: [],
    photos: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/me");
        const userData = response.data;

        setProfile({
          name: userData.name || "",
          bio: userData.bio || "",
          city: userData.city || "",
          interests: userData.interests || [],
          photos: userData.photos || [],
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/users/me", {
        name: profile.name,
        bio: profile.bio,
        city: profile.city,
        interests: profile.interests,
      });

      // Navigate back to profile
      navigate("/profile");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Eroare la salvarea profilului. Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  const addInterest = (interest: string) => {
    if (
      !profile.interests.includes(interest) &&
      profile.interests.length < 10
    ) {
      setProfile((prev) => ({
        ...prev,
        interests: [...prev.interests, interest],
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const addCustomInterest = () => {
    if (
      newInterest.trim() &&
      !profile.interests.includes(newInterest.trim()) &&
      profile.interests.length < 10
    ) {
      addInterest(newInterest.trim());
      setNewInterest("");
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
    <div className="w-full h-full bg-gray-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/profile")}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Editează profilul
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <FaSave />
            <span>{saving ? "Se salvează..." : "Salvează"}</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaUser className="mr-2 text-pink-500" />
              Informații de bază
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Numele tău"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oraș
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Orașul tău"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Despre mine
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  placeholder="Spune-le ceva despre tine..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {profile.bio.length}/500 caractere
                </p>
              </div>
            </div>
          </motion.div>

          {/* Interests */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaHeart className="mr-2 text-pink-500" />
              Interese
            </h2>

            {/* Selected Interests */}
            {profile.interests.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Interesele tale ({profile.interests.length}/10)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2"
                    >
                      <span>{interest}</span>
                      <button
                        onClick={() => removeInterest(interest)}
                        className="text-pink-500 hover:text-pink-700"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Interest */}
            {profile.interests.length < 10 && (
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCustomInterest()}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                    placeholder="Adaugă un interes personalizat..."
                    maxLength={20}
                  />
                  <button
                    onClick={addCustomInterest}
                    disabled={!newInterest.trim()}
                    className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            )}

            {/* Common Interests */}
            {profile.interests.length < 10 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Interese populare
                </h3>
                <div className="flex flex-wrap gap-2">
                  {commonInterests
                    .filter((interest) => !profile.interests.includes(interest))
                    .map((interest, index) => (
                      <button
                        key={index}
                        onClick={() => addInterest(interest)}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-pink-100 hover:text-pink-700 transition-colors"
                      >
                        + {interest}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {profile.interests.length >= 10 && (
              <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                Ai atins limita maximă de 10 interese. Șterge unul pentru a
                adăuga altul.
              </p>
            )}
          </motion.div>

          {/* Photos Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaCamera className="mr-2 text-pink-500" />
              Fotografii
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {profile.photos.slice(0, 6).map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
                >
                  <img
                    src={getPhotoUrl(photo)}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {profile.photos.length < 6 && (
                <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <FaPlus className="text-gray-400 text-xl mb-2 mx-auto" />
                    <p className="text-xs text-gray-500">Adaugă foto</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-3">
              Pentru a edita fotografiile, folosește butonul "Adaugă Fotografii"
              din pagina de profil.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
