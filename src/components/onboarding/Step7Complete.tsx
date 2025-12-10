import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaHeart, FaArrowLeft, FaSpinner, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import { useOnboarding } from "./useOnboarding";
import ProgressBar from "./ProgressBar";
import api from "../../services/api";
import TermsModal from "./TermsModal";

const Step7Complete: React.FC = () => {
  const { data, setData, currentStep, setCurrentStep, totalSteps } =
    useOnboarding();
  const [agreed, setAgreed] = useState(data.agreed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  // Store coordinates once obtained to avoid asking twice
  const locationCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);

  const handleComplete = async () => {
    // First, show location permission dialog if not yet decided
    if (locationGranted === null) {
      setShowLocationPermission(true);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("🎯 Starting onboarding completion...");

      // Get all onboarding data
      const onboardingData = data;
      console.log("📋 Onboarding data:", onboardingData);

      // Create FormData instead of JSON
      const formData = new FormData();

      // Add basic fields (with null checks)
      formData.append("firstName", onboardingData.firstName);
      if (onboardingData.birthday) {
        formData.append("birthday", onboardingData.birthday.toISOString());
      }
      if (onboardingData.gender) {
        formData.append("gender", onboardingData.gender);
      }
      formData.append("bio", onboardingData.bio || "");
      formData.append("agreed", String(onboardingData.agreed));

      // Add interests as JSON array
      formData.append("interests", JSON.stringify(onboardingData.interests));

      // Use stored location coordinates if available (already obtained when user clicked "Allow")
      if (locationGranted && locationCoordsRef.current) {
        formData.append("latitude", String(locationCoordsRef.current.latitude));
        formData.append("longitude", String(locationCoordsRef.current.longitude));
        console.log(`✅ Using stored location: ${locationCoordsRef.current.latitude}, ${locationCoordsRef.current.longitude}`);
      } else {
        console.log("📍 No location available, will use default location on backend");
      }

      // Add photo files directly
      onboardingData.photos.forEach((photo: File) => {
        formData.append(`photos`, photo, photo.name);
      });
      console.log(`📸 Added ${onboardingData.photos.length} photo files to FormData`);

      // Add cars with photos
      onboardingData.cars.forEach((car, carIndex) => {
        // Add car data (without photos first)
        const carData = {
          brand: car.brand,
          model: car.model,
          year: car.year,
          color: car.color,
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
          mods: car.mods,
        };
        formData.append(`cars[${carIndex}]`, JSON.stringify(carData));

        // Add car photo files
        car.photos.forEach((photo) => {
          if (photo instanceof File) {
            // It's a File object - add to FormData
            formData.append(`carPhotos_${carIndex}`, photo, photo.name);
          }
          // If it's a string (URL), backend will handle it separately
        });
      });

      console.log("📦 FormData prepared with direct file uploads");

      // Check if user is authenticated
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to complete onboarding. Please log in.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      // Submit to authenticated onboarding endpoint
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      // Add timeout for fetch (60 seconds for cold start on Render)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      try {
        const response = await fetch(
          `${apiUrl}/users/onboarding`,
          {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData, // Send FormData directly (no Content-Type header needed)
            signal: controller.signal,
          }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Server response:", response.status, errorText);
          throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ Onboarding completed:", result);

        // Fetch updated user data to get onboardingCompleted flag
        try {
          const userResponse = await api.get("/users/me");
          console.log("✅ User data after onboarding:", userResponse.data);
          
          // Store updated user data with onboardingCompleted flag
          const completeUserData = {
            ...userResponse.data,
            onboardingCompleted: true // Ensure this is set
          };
          localStorage.setItem("user", JSON.stringify(completeUserData));
          console.log("✅ Stored user data:", completeUserData);
        } catch (userError) {
          console.error("❌ Error fetching user data:", userError);
          throw new Error("Could not update profile data. Please try again.");
        }
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error("Server-ul întârzie să răspundă. Te rog încearcă din nou.");
        }
        throw fetchError;
      }

      // Clear onboarding data by resetting to defaults
      setData({
        firstName: "",
        birthday: null,
        gender: null,
        interests: [],
        cars: [],
        photos: [],
        agreed: false,
        bio: "",
      });

      // Show success and redirect - force page reload to update AuthContext
      setIsComplete(true);
      setTimeout(() => {
        window.location.href = "/dashboard"; // Force full page reload to refresh AuthContext
      }, 2000);
    } catch (error: unknown) {
      console.error("❌ Error completing onboarding:", error);
      if (error instanceof Error && (error.message.includes("Failed to fetch") || error.message.includes("ERR_CONNECTION_REFUSED"))) {
        setError("Cannot connect to server. Please check your internet connection and try again.");
      } else {
        setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(7); // Go back to Step7 (photos)
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20"
        >
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, rotate: 0 }}
              animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
              transition={{
                scale: { delay: 0.3 },
                rotate: {
                  delay: 0.5,
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 2,
                },
              }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg"
            >
              <FaHeart className="text-white text-3xl" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              Almost done! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-gray-600 mb-2"
            >
              Welcome to the Cruizr community, {data.firstName}!
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500"
            >
              Let's start finding someone special with the same passions
            </motion.p>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Your profile summary:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-600">{data.firstName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Age:</span>
                <span className="ml-2 text-gray-600">
                  {data.birthday
                    ? new Date().getFullYear() - data.birthday.getFullYear()
                    : "N/A"}{" "}
                  years old
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Gender:</span>
                <span className="ml-2 text-gray-600">
                  {data.gender === "male"
                    ? "Male"
                    : data.gender === "female"
                    ? "Female"
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Interests:</span>
                <span className="ml-2 text-gray-600">
                  {data.interests.length} selected
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Cars:</span>
                <span className="ml-2 text-gray-600">
                  {data.cars.length} added
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Photos:</span>
                <span className="ml-2 text-gray-600">
                  {data.photos.length} added
                </span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Terms and Conditions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-start space-x-3"
            >
              <motion.button
                onClick={() => setAgreed(!agreed)}
                whileTap={{ scale: 0.9 }}
                className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                  agreed
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 border-transparent"
                    : "border-gray-300 bg-white"
                }`}
              >
                {agreed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <FaCheck className="text-white text-[10px]" />
                  </motion.div>
                )}
              </motion.button>
              <label className="text-sm text-gray-700 leading-relaxed cursor-pointer" onClick={() => setAgreed(!agreed)}>
                I agree to the{" "}
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowTermsModal(true);
                  }}
                  className="text-purple-600 hover:underline cursor-pointer"
                >
                  Terms and Conditions
                </span>{" "}
                and{" "}
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPrivacyModal(true);
                  }}
                  className="text-purple-600 hover:underline cursor-pointer"
                >
                  Privacy Policy
                </span>{" "}
                of Cruizr. I confirm I am at least 18 years old.
              </label>
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-6 bg-green-50 rounded-xl border border-green-200"
              >
                <FaCheck className="text-green-500 text-3xl mx-auto mb-2" />
                <p className="text-green-700 font-semibold">
                  Account created successfully! Redirecting to dashboard...
                </p>
              </motion.div>
            )}

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                disabled={loading}
                className="flex-1 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition duration-300 disabled:opacity-50 flex items-center justify-center"
              >
                <FaArrowLeft className="mr-2" />
                Back
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                disabled={!agreed || loading}
                className="flex-2 py-4 px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Finalizing...
                  </>
                ) : (
                  <>
                    <FaHeart className="mr-2" />
                    Start the adventure!
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Terms & Conditions Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type="terms"
      />

      {/* Privacy Policy Modal */}
      <TermsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        type="privacy"
      />

      {/* Location Permission Modal */}
      {showLocationPermission && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setLocationGranted(false);
            setShowLocationPermission(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
          >
            <button
              onClick={() => {
                setLocationGranted(false);
                setShowLocationPermission(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Allow Location Access
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                For a better experience, Cruizr would like to know your approximate location.
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-purple-900 mb-2 text-sm">
                Why do we need your location?
              </h4>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>We show you users near you</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>We calculate the exact distance to potential matches</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>We improve recommendations based on proximity</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-blue-800">
                <strong>🔒 Privacy:</strong> Your exact location will never be shared with other users. 
                They will only see the approximate distance from you (e.g., "5 km away").
              </p>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-yellow-800">
                <strong>ℹ️ Note:</strong> If you decline, we'll use an approximate location to show you users. 
                You can update your location anytime from Settings.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setLocationGranted(false);
                  setShowLocationPermission(false);
                  // Continue with onboarding even without location
                  setTimeout(() => handleComplete(), 100);
                }}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
              >
                Not Now
              </button>
              <button
                onClick={async () => {
                  // Request browser geolocation permission NOW and store coordinates
                  if (navigator.geolocation) {
                    try {
                      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                          timeout: 10000,
                          maximumAge: 0,
                          enableHighAccuracy: false,
                        });
                      });
                      // Store the coordinates so we don't need to ask again
                      locationCoordsRef.current = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                      };
                      console.log(`✅ Location obtained and stored: ${position.coords.latitude}, ${position.coords.longitude}`);
                    } catch (err) {
                      console.warn("⚠️ Could not get location:", err);
                      // Continue anyway, backend will use default
                    }
                  }
                  setLocationGranted(true);
                  setShowLocationPermission(false);
                  // Continue with onboarding
                  setTimeout(() => handleComplete(), 100);
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition"
              >
                Allow
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can change this setting anytime from the app settings
            </p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Step7Complete;
