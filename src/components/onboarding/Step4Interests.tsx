import { motion } from "framer-motion";
import {
  FaHeart,
  FaArrowRight,
  FaArrowLeft,
  FaCar,
  FaRoad,
  FaFlag,
  FaWrench,
} from "react-icons/fa";
import { useOnboarding } from "./useOnboarding";
import React, { useState } from "react";
import ProgressBar from "./ProgressBar";

const Step4Interests: React.FC = () => {
  const { data, setData, currentStep, setCurrentStep, totalSteps } =
    useOnboarding();
  const [interests, setInterests] = useState<string[]>(data.interests);
  const [error, setError] = useState("");

  const interestOptions = [
    { label: "Tuning", icon: FaWrench, color: "purple" },
    { label: "Classic Cars", icon: FaCar, color: "blue" },
    { label: "Off-road", icon: FaRoad, color: "green" },
    { label: "Motorsport", icon: FaFlag, color: "red" },
    { label: "Electric", icon: FaCar, color: "teal" },
    { label: "SUV", icon: FaCar, color: "orange" },
    { label: "Convertible", icon: FaCar, color: "pink" },
    { label: "JDM", icon: FaCar, color: "indigo" },
    { label: "German Cars", icon: FaCar, color: "gray" },
    { label: "Detailing", icon: FaWrench, color: "cyan" },
    { label: "Audio", icon: FaWrench, color: "yellow" },
    { label: "Track Days", icon: FaFlag, color: "emerald" },
  ];

  const toggleInterest = (interest: string) => {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      } else {
        return [...prev, interest];
      }
    });
    setError("");
  };

  const handleNext = () => {
    if (interests.length < 3) {
      setError("Selectează cel puțin 3 interese");
      return;
    }

    setData((prev) => ({ ...prev, interests }));
    setCurrentStep(5);
  };

  const handleBack = () => {
    setCurrentStep(3);
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
              <FaHeart className="text-white text-2xl" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Ce te pasionează?
            </h1>
            <p className="text-gray-600">
              Selectează cel puțin 3 interese pentru a-ți găsi persoane
              compatibile
            </p>
            <p className="text-sm text-purple-600 mt-2">
              {interests.length}/12 selectate (minim 3)
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestOptions.map((option) => {
                const isSelected = interests.includes(option.label);
                const IconComponent = option.icon;

                return (
                  <motion.button
                    key={option.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInterest(option.label)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 ${
                      isSelected
                        ? `bg-${option.color}-500 text-white border-${option.color}-500 shadow-lg`
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <IconComponent
                      className={`text-xl ${
                        isSelected ? "text-white" : `text-${option.color}-500`
                      }`}
                    />
                    <span className="text-sm font-medium text-center">
                      {option.label}
                    </span>
                  </motion.button>
                );
              })}
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
                disabled={interests.length < 3}
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

export default Step4Interests;
