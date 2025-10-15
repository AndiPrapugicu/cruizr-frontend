import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaCar,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { useOnboarding } from "./useOnboarding";
import ProgressBar from "./ProgressBar";
import CarDetailsForm from "./CarDetailsForm";
import CarModifications from "./CarModifications";
import CarPhotos from "./CarPhotos";

export interface CarData {
  brand: string;
  model: string;
  year: number;
  color?: string;
  engineSize?: string;
  bodyType?: string;
  horsepower?: number;
  torque?: number;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  mileage?: number;
  upholsteryType?: string;
  interiorColor?: string;
  doors?: number;
  seats?: number;
  hasSunroof?: boolean;
  mods: string[];
  isPrimary: boolean;
  photos: string[];
  garageTourVideo?: string;
}

const CarOnboardingStep: React.FC = () => {
  const { data, setData, currentStep, setCurrentStep, totalSteps } =
    useOnboarding();
  const [savedCars, setSavedCars] = useState<CarData[]>(data.cars || []);
  const [currentCarStep, setCurrentCarStep] = useState<
    "details" | "mods" | "photos"
  >("details");
  const [showAddCarForm, setShowAddCarForm] = useState(savedCars.length === 0);

  // Current car form state
  const [currentCar, setCurrentCar] = useState<Partial<CarData>>({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    mods: [],
    photos: [],
    isPrimary: savedCars.length === 0,
  });

  const resetCurrentCar = () => {
    setCurrentCar({
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      mods: [],
      photos: [],
      isPrimary: savedCars.length === 0,
    });
    setCurrentCarStep("details");
  };

  const handleSaveCar = () => {
    if (!currentCar.brand || !currentCar.model || !currentCar.year) {
      alert("Te rog să completezi toate câmpurile obligatorii!");
      return;
    }

    const newCar = {
      ...currentCar,
      isPrimary: savedCars.length === 0, // Prima mașină e întotdeauna principală
    } as CarData;

    const updatedCars = [...savedCars, newCar];
    setSavedCars(updatedCars);

    // Update onboarding data
    setData((prev) => ({
      ...prev,
      cars: updatedCars,
    }));

    setShowAddCarForm(false);
    resetCurrentCar();
  };

  const handleDeleteCar = (index: number) => {
    if (window.confirm("Ești sigur că vrei să ștergi această mașină?")) {
      const updatedCars = savedCars.filter((_, i) => i !== index);
      // If we deleted the primary car, make the first remaining car primary
      if (updatedCars.length > 0 && savedCars[index].isPrimary) {
        updatedCars[0].isPrimary = true;
      }
      setSavedCars(updatedCars);
      setData((prev) => ({
        ...prev,
        cars: updatedCars,
      }));
    }
  };

  const handleBack = () => {
    setCurrentStep(4); // Go back to Step4 (interests)
  };

  const handleNext = () => {
    if (savedCars.length === 0) {
      alert("Te rog să adaugi cel puțin o mașină!");
      return;
    }
    setCurrentStep(6); // Go to Step6 (bio)
  };

  const renderCarForm = () => {
    switch (currentCarStep) {
      case "details":
        return (
          <CarDetailsForm
            car={currentCar}
            setCar={setCurrentCar}
            onNext={() => setCurrentCarStep("mods")}
          />
        );
      case "mods":
        return (
          <CarModifications
            car={currentCar}
            setCar={setCurrentCar}
            onBack={() => setCurrentCarStep("details")}
            onNext={() => setCurrentCarStep("photos")}
          />
        );
      case "photos":
        return (
          <CarPhotos
            car={currentCar}
            setCar={setCurrentCar}
            onBack={() => setCurrentCarStep("mods")}
            onSave={handleSaveCar}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-start justify-center p-4 py-8"
    >
      <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto">
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
              animate={{ scale: 1, rotate: 360 }}
              transition={{
                scale: { delay: 0.3 },
                rotate: { delay: 0.5, duration: 0.8 },
              }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 shadow-lg"
            >
              <FaCar className="text-white text-3xl" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              Mașinile tale
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-gray-600"
            >
              Spune-ne despre mașinile tale pentru a te conecta cu alți
              pasionați!
            </motion.p>
          </div>

          {/* Saved Cars List */}
          {savedCars.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Mașinile tale ({savedCars.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedCars.map((car, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {car.brand} {car.model}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {car.year} • {car.color || "Necunoscută"}
                        </p>
                        {car.isPrimary && (
                          <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full mt-1">
                            Principală
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCar(index)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {car.mods.length} modificări • {car.photos.length} poze
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Add Car Form or Button */}
          {showAddCarForm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {renderCarForm()}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center mb-8"
            >
              <button
                onClick={() => setShowAddCarForm(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-300"
              >
                <FaPlus className="mr-2" />
                Adaugă o mașină
              </button>
            </motion.div>
          )}

          {/* Navigation */}
          {!showAddCarForm && (
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
                disabled={savedCars.length === 0}
                className="flex-2 py-4 px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                Continuă
                <FaArrowRight className="ml-2" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CarOnboardingStep;
