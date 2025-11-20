import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaHeart, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "./useOnboarding";
import ProgressBar from "./ProgressBar";

const Step7Complete: React.FC = () => {
  const { data, setData, currentStep, setCurrentStep, totalSteps } =
    useOnboarding();
  const [agreed, setAgreed] = useState(data.agreed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
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

        // Note: Car photos are currently stored as strings (URLs/paths)
        // TODO: Implement car photo file uploads in a future update
      });

      console.log("📦 FormData prepared with direct file uploads");

      // Submit to the new combined endpoint
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      // Add timeout for fetch (60 seconds for cold start on Render)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      try {
        const response = await fetch(
          `${apiUrl}/users/onboarding-register`,
          {
            method: "POST",
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
        console.log("✅ Registration and onboarding completed:", result);

        // Store the token for future requests
        if (result.access_token) {
          localStorage.setItem("token", result.access_token);
          localStorage.setItem("user", JSON.stringify(result.user));
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

      // Show success and redirect
      setIsComplete(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: unknown) {
      console.error("❌ Error completing onboarding:", error);
      if (error instanceof Error && (error.message.includes("Failed to fetch") || error.message.includes("ERR_CONNECTION_REFUSED"))) {
        setError("Nu ne putem conecta la server. Te rog verifică conexiunea ta la internet și încearcă din nou.");
      } else {
        setError(error instanceof Error ? error.message : "A apărut o eroare. Te rog încearcă din nou.");
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
              Aproape gata! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-gray-600 mb-2"
            >
              Bun venit în comunitatea CarMatch, {data.firstName}!
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500"
            >
              Să începem să-ți găsim pe cineva special cu aceleași pasiuni
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
              Rezumatul profilului tău:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nume:</span>
                <span className="ml-2 text-gray-600">{data.firstName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Vârsta:</span>
                <span className="ml-2 text-gray-600">
                  {data.birthday
                    ? new Date().getFullYear() - data.birthday.getFullYear()
                    : "N/A"}{" "}
                  ani
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Gen:</span>
                <span className="ml-2 text-gray-600">
                  {data.gender === "male"
                    ? "Bărbat"
                    : data.gender === "female"
                    ? "Femeie"
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Interese:</span>
                <span className="ml-2 text-gray-600">
                  {data.interests.length} selectate
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Mașini:</span>
                <span className="ml-2 text-gray-600">
                  {data.cars.length} adăugate
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Poze:</span>
                <span className="ml-2 text-gray-600">
                  {data.photos.length} adăugate
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
              <button
                onClick={() => setAgreed(!agreed)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                  agreed
                    ? "bg-purple-500 border-purple-500"
                    : "border-gray-300 hover:border-purple-400"
                }`}
              >
                {agreed && <FaCheck className="text-white text-xs" />}
              </button>
              <label className="text-sm text-gray-700 leading-relaxed">
                Sunt de acord cu{" "}
                <a
                  href="/terms"
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  Termenii și Condițiile
                </a>{" "}
                și{" "}
                <a
                  href="/privacy"
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  Politica de Confidențialitate
                </a>{" "}
                CarMatch. Confirm că am cel puțin 18 ani.
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
                  Cont creat cu succes! Te redirectez către dashboard...
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
                Înapoi
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
                    Se finalizează...
                  </>
                ) : (
                  <>
                    <FaHeart className="mr-2" />
                    Începe aventura!
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Step7Complete;
