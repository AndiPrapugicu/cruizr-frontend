import React from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa";
import { CarData } from "./CarOnboardingStep";

interface CarModificationsProps {
  car: Partial<CarData>;
  setCar: React.Dispatch<React.SetStateAction<Partial<CarData>>>;
  onBack: () => void;
  onNext: () => void;
}

const commonMods = [
  "Evacuare sport",
  "Filtru aer sport",
  "Suspensie sport",
  "Jante aftermarket",
  "Anvelope sport",
  "Chip tuning",
  "Intercooler",
  "Turbo upgrade",
  "Engine swap",
  "Frâne sport",
  "Ambreiaj sport",
  "Volant sport",
  "Scaune sport",
  "Harnasuri",
  "Roll cage",
  "Spoiler",
  "Difuzor",
  "Splitter",
  "Kit caroserie",
  "Faruri LED/Xenon",
  "Stopuri LED",
  "Becuri interior LED",
  "Folie geamuri",
  "Audio aftermarket",
  "Subwoofer",
  "Amplificator",
  "Navigatie aftermarket",
  "Dashcam",
  "Tapițerie custom",
  "Volan aftermarket",
  "Schimbător scurt",
  "Pedală accelerație sport",
  "Covorase personalizate",
  "Ornamente carbon",
  "Stickere/Decals",
  "Wrapping",
  "Lowering springs",
  "Coilovers",
  "Air suspension",
  "Bară antirostogolire",
  "Strut brace",
  "Catback exhaust",
  "Headers",
  "Catalitic sport",
  "Cold air intake",
  "Blow-off valve",
  "Wastegate external",
  "Oil catch tank",
  "Radiator aftermarket",
  "Ventilator electric",
  "ECU remap",
  "E85 conversion",
  "Nitrous",
  "Methanol injection",
];

const CarModifications: React.FC<CarModificationsProps> = ({
  car,
  setCar,
  onBack,
  onNext,
}) => {
  const selectedMods = car.mods || [];

  const toggleMod = (mod: string) => {
    const currentMods = car.mods || [];
    let updatedMods: string[];

    if (currentMods.includes(mod)) {
      updatedMods = currentMods.filter((m) => m !== mod);
    } else {
      updatedMods = [...currentMods, mod];
    }

    setCar((prev) => ({ ...prev, mods: updatedMods }));
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">
        Modificări mașină
      </h3>

      <p className="text-gray-600 mb-8">
        Selectează modificările pe care le are mașina ta. Poți selecta oricare
        dintre opțiuni sau poți să nu selectezi nimic dacă mașina este stock.
      </p>

      {/* Selected count */}
      {selectedMods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6"
        >
          <p className="text-sm font-medium text-purple-800">
            {selectedMods.length} modificări selectate
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedMods.slice(0, 5).map((mod, index) => (
              <span
                key={index}
                className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full"
              >
                {mod}
              </span>
            ))}
            {selectedMods.length > 5 && (
              <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
                +{selectedMods.length - 5} altele
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Modifications grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 max-h-96 overflow-y-auto">
        {commonMods.map((mod, index) => {
          const isSelected = selectedMods.includes(mod);

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleMod(mod)}
              className={`p-3 rounded-xl border-2 transition duration-200 text-left relative ${
                isSelected
                  ? "border-purple-500 bg-purple-50 text-purple-800"
                  : "border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-25"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{mod}</span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                  >
                    <FaCheck className="text-white text-xs" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition duration-300 flex items-center justify-center"
        >
          <FaArrowLeft className="mr-2" />
          Înapoi
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="flex-2 py-3 px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center"
        >
          Continuă
          <FaArrowRight className="ml-2" />
        </motion.button>
      </div>
    </div>
  );
};

export default CarModifications;
