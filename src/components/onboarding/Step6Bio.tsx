import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useOnboarding } from "./useOnboarding";
import ProgressBar from "./ProgressBar";

const Step6Bio: React.FC = () => {
  const { data, setData, currentStep, setCurrentStep, totalSteps } =
    useOnboarding();
  const [bio, setBio] = useState(data.bio || "");
  const [error, setError] = useState("");

  const maxLength = 500;

  const handleNext = () => {
    if (bio.trim().length < 10) {
      setError("Biografia trebuie să aibă cel puțin 10 caractere");
      return;
    }

    setData((prev) => ({ ...prev, bio: bio.trim() }));
    setCurrentStep(7); // Go to Step7 (photos)
  };

  const handleBack = () => {
    setCurrentStep(5); // Go back to Step5 (cars)
  };

  const bioSuggestions = [
    "🚗 Pasionat de mașini și călătorii",
    "🏁 Iubitor de viteză și adrenalină",
    "🔧 Îmi place să lucrez la motoare",
    "🌟 Căutând pe cineva cu aceeași pasiune",
    "🛣️ Road trips sunt viața mea",
    "⚡ Electric vehicle enthusiast",
  ];

  const addSuggestion = (suggestion: string) => {
    if (bio.length + suggestion.length + 1 <= maxLength) {
      setBio((prev) => (prev ? prev + " " + suggestion : suggestion));
    }
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
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg"
            >
              <FaEdit className="text-white text-2xl" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Spune-ne despre tine
            </h1>
            <p className="text-gray-600">
              Scrie o scurtă descriere care să te reprezinte. Ce te face
              special?
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Biografia ta
              </label>
              <textarea
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= maxLength) {
                    setBio(e.target.value);
                    setError("");
                  }
                }}
                placeholder="Spune-ne ceva despre tine, pasiunile tale pentru mașini, ce îți place să faci în timpul liber..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition duration-200 bg-gray-50 resize-none"
                rows={6}
                style={{ minHeight: "150px" }}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {bio.length}/{maxLength} caractere
                </span>
                {bio.length < 10 && (
                  <span className="text-sm text-red-500">
                    Minim 10 caractere
                  </span>
                )}
              </div>
            </div>

            {/* Suggestion chips */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Sugestii (click pentru a adăuga):
              </p>
              <div className="flex flex-wrap gap-2">
                {bioSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addSuggestion(suggestion)}
                    disabled={bio.length + suggestion.length + 1 > maxLength}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="flex-1 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition duration-300 flex items-center justify-center"
              >
                <FaArrowLeft className="mr-2" />
                Înapoi
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={bio.trim().length < 10}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                Continuă
                <FaArrowRight className="ml-2" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Step6Bio;
