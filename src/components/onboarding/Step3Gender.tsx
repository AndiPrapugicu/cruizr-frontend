import { motion } from "framer-motion";
import { FaVenus, FaMars, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import ProgressBar from "./ProgressBar";
import { useOnboarding } from "./useOnboarding";
import React, { useState } from "react";

const Step3Gender: React.FC = () => {
  const { data, setData, currentStep, setCurrentStep, totalSteps } =
    useOnboarding();
  const [gender, setGender] = useState<"male" | "female" | null>(data.gender);
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!gender) {
      setError("Te rugăm să selectezi genul");
      return;
    }

    setData((prev) => ({ ...prev, gender }));
    setCurrentStep(4);
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  const genderOptions = [
    {
      value: "male" as const,
      label: "Bărbat",
      icon: FaMars,
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      value: "female" as const,
      label: "Femeie",
      icon: FaVenus,
      gradient: "from-pink-500 to-pink-600",
      hoverGradient: "from-pink-600 to-pink-700",
    },
  ];

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
              <FaVenus className="text-white text-xl mr-1" />
              <FaMars className="text-white text-xl" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">Eu sunt</h1>
            <p className="text-gray-600">Selectează genul tău</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              {genderOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = gender === option.value;

                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setGender(option.value);
                      setError("");
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-3 ${
                      isSelected
                        ? `bg-gradient-to-r ${option.gradient} text-white border-transparent shadow-lg`
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <IconComponent
                      className={`text-2xl ${
                        isSelected ? "text-white" : "text-gray-500"
                      }`}
                    />
                    <span className="text-xl font-semibold">
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
                disabled={!gender}
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

export default Step3Gender;
