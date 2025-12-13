import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import {
  FaArrowLeft,
  FaSave,
  FaUser,
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
  const { theme } = useTheme();
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
      alert("Error saving profile. Please try again.");
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
      <div className={`flex items-center justify-center w-full h-full ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-full overflow-y-auto ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/profile")}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
            >
              <FaArrowLeft />
            </button>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Edit profile
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center space-x-2 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            <FaSave />
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`p-6 shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
          >
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              <FaUser className="mr-2 text-blue-500" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white placeholder:text-gray-400' : 'border-gray-300 bg-white text-gray-900'}`}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  City
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white placeholder:text-gray-400' : 'border-gray-300 bg-white text-gray-900'}`}
                  placeholder="Your city"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  About me
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={4}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white placeholder:text-gray-400' : 'border-gray-300 bg-white text-gray-900'}`}
                  placeholder="Tell them something about yourself..."
                />
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {profile.bio.length}/500 characters
                </p>
              </div>
            </div>
          </motion.div>

          {/* Interests */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`p-6 shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
          >
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              <FaHeart className="mr-2 text-blue-500" />
              Interests
            </h2>

            {/* Selected Interests */}
            {profile.interests.length > 0 && (
              <div className="mb-4">
                <h3 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your interests ({profile.interests.length}/10)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${theme === 'dark' ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                    >
                      <span>{interest}</span>
                      <button
                        onClick={() => removeInterest(interest)}
                        className={`hover:text-blue-700 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`}
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
                    className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white placeholder:text-gray-400' : 'border-gray-300 bg-white text-gray-900'}`}
                    placeholder="Add a custom interest..."
                    maxLength={20}
                  />
                  <button
                    onClick={addCustomInterest}
                    disabled={!newInterest.trim()}
                    className={`text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            )}

            {/* Common Interests */}
            {profile.interests.length < 10 && (
              <div>
                <h3 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Popular interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {commonInterests
                    .filter((interest) => !profile.interests.includes(interest))
                    .map((interest, index) => (
                      <button
                        key={index}
                        onClick={() => addInterest(interest)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-slate-700 text-gray-300 hover:bg-blue-900/40 hover:text-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'}`}
                      >
                        + {interest}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {profile.interests.length >= 10 && (
              <p className={`text-sm p-3 rounded-lg ${theme === 'dark' ? 'text-orange-400 bg-orange-900/30' : 'text-orange-600 bg-orange-50'}`}>
                You've reached the maximum limit of 10 interests. Remove one to
                add another.
              </p>
            )}
          </motion.div>

          {/* Photos Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`p-6 shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
          >
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              <FaCamera className="mr-2 text-blue-500" />
              Photos
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {profile.photos.slice(0, 6).map((photo, index) => (
                <div
                  key={index}
                  className={`relative aspect-square rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}
                >
                  <img
                    src={getPhotoUrl(photo)}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                    <span className="text-white text-sm font-medium">Photo {index + 1}</span>
                  </div>
                </div>
              ))}

              {profile.photos.length < 6 && Array.from({ length: 6 - profile.photos.length }).map((_, index) => (
                <button
                  key={`empty-${index}`}
                  onClick={() => navigate('/profile')}
                  className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all duration-300 cursor-pointer ${theme === 'dark' ? 'bg-slate-700 border-slate-600 hover:border-blue-500 hover:bg-slate-600' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                >
                  <div className="text-center">
                    <FaPlus className={`text-2xl mb-2 mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Add photo</p>
                  </div>
                </button>
              ))}
            </div>

            <div className={`mt-4 p-4 rounded-xl border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'}`}>
              <p className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaCamera className="mr-2 text-blue-500" />
                To edit photos, use the{" "}
                <span className={`font-semibold mx-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>"Add Photos"</span>
                button on the profile page.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
