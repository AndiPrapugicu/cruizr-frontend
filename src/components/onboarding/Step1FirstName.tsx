import { motion } from "framer-motion";
import { FaUser, FaArrowRight } from "react-icons/fa";
import ProgressBar from "./ProgressBar";
import { useOnboarding } from "./useOnboarding";
import React, { useState } from "react";

const Step1FirstName: React.FC = () => {
  const { data, setData, currentStep, setCurrentStep, totalSteps } =
    useOnboarding();
  const [firstName, setFirstName] = useState(data.firstName);
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!firstName.trim()) {
      setError("Prenumele este obligatoriu");
      return;
    }

    if (firstName.length < 2) {
      setError("Prenumele trebuie să aibă cel puțin 2 caractere");
      return;
    }

    if (!/^[a-zA-ZăîâșțĂÎÂȘȚ\- ]+$/.test(firstName)) {
      setError("Doar litere sunt permise");
      return;
    }

    setData((prev) => ({ ...prev, firstName: firstName.trim() }));
    setCurrentStep(2);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNext();
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
      <div className="w-full max-w-md">
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
              <FaUser className="text-white text-2xl" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Bun venit!
            </h1>
            <p className="text-gray-600">Să începem cu prenumele tău</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Prenumele meu este
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="ex: Andrei"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition duration-200 bg-gray-50 text-lg"
                autoFocus
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!firstName.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              Continuă
              <FaArrowRight className="ml-2" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Step1FirstName;
