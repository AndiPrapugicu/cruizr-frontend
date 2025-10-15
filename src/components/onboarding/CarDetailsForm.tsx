import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaChevronDown } from "react-icons/fa";
import { CarData } from "./CarOnboardingStep";

interface CarDetailsFormProps {
  car: Partial<CarData>;
  setCar: React.Dispatch<React.SetStateAction<Partial<CarData>>>;
  onNext: () => void;
}

const carBrands = [
  "Audi",
  "BMW",
  "Mercedes-Benz",
  "Volkswagen",
  "Opel",
  "Ford",
  "Renault",
  "Peugeot",
  "Citroën",
  "Fiat",
  "Toyota",
  "Honda",
  "Nissan",
  "Mazda",
  "Mini Cooper",
  "Hyundai",
  "Kia",
  "Škoda",
  "Seat",
  "Dacia",
  "Volvo",
  "Saab",
  "Porsche",
  "Lamborghini",
  "Ferrari",
  "McLaren",
  "Bugatti",
  "Bentley",
  "Rolls-Royce",
  "Aston Martin",
  "Maserati",
  "Alfa Romeo",
  "Lexus",
  "Infiniti",
  "Acura",
  "Cadillac",
  "Lincoln",
  "Jeep",
  "Dodge",
  "Chevrolet",
  "GMC",
  "Buick",
  "Chrysler",
  "Ram",
  "Tesla",
  "Lucid",
  "Rivian",
  "Polestar",
  "Genesis",
  "Land Rover",
  "Range Rover",
  "Jaguar",
];

const bodyTypes = [
  "Sedan",
  "Hatchback",
  "Coupe",
  "Wagon",
  "SUV",
  "Crossover",
  "Convertible",
  "Pickup",
  "Van",
  "Roadster",
  "Targa",
];

const carColors = [
  "Alb",
  "Negru",
  "Gri",
  "Argintiu",
  "Roșu",
  "Albastru",
  "Verde",
  "Galben",
  "Portocaliu",
  "Maro",
  "Violet",
  "Roz",
  "Bej",
  "Burgundy",
];

const fuelTypes = [
  "Benzină",
  "Diesel",
  "Hibrid",
  "Electric",
  "GPL",
  "Benzină + GPL",
  "Hidrogen",
];

const transmissionTypes = [
  "Manuală",
  "Automată",
  "CVT",
  "DSG",
  "Tiptronic",
  "Multitronic",
];

const drivetrainTypes = [
  "FWD (Tracțiune față)",
  "RWD (Tracțiune spate)",
  "AWD (Tracțiune integrală)",
  "4WD",
];

const upholsteryTypes = [
  "Textil",
  "Piele",
  "Piele ecologică",
  "Alcantara",
  "Velur",
  "Combinat",
];

const interiorColors = ["Negru", "Gri", "Bej", "Maro", "Roșu", "Alb", "Crem"];

const doorOptions = [2, 3, 4, 5];
const seatOptions = [2, 4, 5, 7, 8, 9];

const CarDetailsForm: React.FC<CarDetailsFormProps> = ({
  car,
  setCar,
  onNext,
}) => {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const handleInputChange = (
    field: keyof CarData,
    value: string | number | boolean | undefined
  ) => {
    setCar((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!car.brand || !car.model || !car.year) {
      alert(
        "Te rog să completezi toate câmpurile obligatorii (Marcă, Model, An)!"
      );
      return;
    }
    onNext();
  };

  const renderDropdown = (
    label: string,
    field: keyof CarData,
    options: (string | number)[],
    placeholder: string,
    required = false
  ) => {
    const isOpen = showDropdown === field;
    const currentValue = car[field];

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowDropdown(isOpen ? null : field)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-left focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 flex items-center justify-between"
        >
          <span className={currentValue ? "text-gray-800" : "text-gray-500"}>
            {currentValue || placeholder}
          </span>
          <FaChevronDown
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  handleInputChange(field, option);
                  setShowDropdown(null);
                }}
                className="w-full px-4 py-3 text-left hover:bg-purple-50 transition duration-150 first:rounded-t-xl last:rounded-b-xl"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">
        Detalii mașină
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand */}
        <div className="md:col-span-2">
          {renderDropdown(
            "Marca",
            "brand",
            carBrands,
            "Selectează marca",
            true
          )}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={car.model || ""}
            onChange={(e) => handleInputChange("model", e.target.value)}
            placeholder="ex: Golf, E46, Polo"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
          />
        </div>

        {/* Year */}
        <div>
          {renderDropdown(
            "An fabricație",
            "year",
            years,
            "Selectează anul",
            true
          )}
        </div>

        {/* Color */}
        <div>
          {renderDropdown("Culoare", "color", carColors, "Selectează culoarea")}
        </div>

        {/* Engine Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacitate motor (L)
          </label>
          <input
            type="text"
            value={car.engineSize || ""}
            onChange={(e) => handleInputChange("engineSize", e.target.value)}
            placeholder="ex: 2.0, 1.6, 3.0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
          />
        </div>

        {/* Body Type */}
        <div>
          {renderDropdown(
            "Tip caroserie",
            "bodyType",
            bodyTypes,
            "Selectează tipul"
          )}
        </div>

        {/* Horsepower */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Putere (CP)
          </label>
          <input
            type="number"
            value={car.horsepower || ""}
            onChange={(e) =>
              handleInputChange(
                "horsepower",
                parseInt(e.target.value) || undefined
              )
            }
            placeholder="ex: 150, 200, 300"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
          />
        </div>

        {/* Torque */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cuplu (Nm)
          </label>
          <input
            type="number"
            value={car.torque || ""}
            onChange={(e) =>
              handleInputChange("torque", parseInt(e.target.value) || undefined)
            }
            placeholder="ex: 250, 300, 500"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
          />
        </div>

        {/* Fuel Type */}
        <div>
          {renderDropdown(
            "Combustibil",
            "fuelType",
            fuelTypes,
            "Selectează combustibilul"
          )}
        </div>

        {/* Transmission */}
        <div>
          {renderDropdown(
            "Transmisie",
            "transmission",
            transmissionTypes,
            "Selectează transmisia"
          )}
        </div>

        {/* Drivetrain */}
        <div>
          {renderDropdown(
            "Tracțiune",
            "drivetrain",
            drivetrainTypes,
            "Selectează tracțiunea"
          )}
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kilometraj
          </label>
          <input
            type="number"
            value={car.mileage || ""}
            onChange={(e) =>
              handleInputChange(
                "mileage",
                parseInt(e.target.value) || undefined
              )
            }
            placeholder="ex: 100000, 50000"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
          />
        </div>

        {/* Upholstery Type */}
        <div>
          {renderDropdown(
            "Tapițerie",
            "upholsteryType",
            upholsteryTypes,
            "Selectează tapițeria"
          )}
        </div>

        {/* Interior Color */}
        <div>
          {renderDropdown(
            "Culoare interior",
            "interiorColor",
            interiorColors,
            "Selectează culoarea"
          )}
        </div>

        {/* Doors */}
        <div>
          {renderDropdown(
            "Număr uși",
            "doors",
            doorOptions,
            "Selectează numărul"
          )}
        </div>

        {/* Seats */}
        <div>
          {renderDropdown(
            "Număr locuri",
            "seats",
            seatOptions,
            "Selectează numărul"
          )}
        </div>

        {/* Sunroof */}
        <div className="md:col-span-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={car.hasSunroof || false}
              onChange={(e) =>
                handleInputChange("hasSunroof", e.target.checked)
              }
              className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Are trapă/plafon panoramic
            </span>
          </label>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex items-center"
        >
          Continuă
          <FaArrowRight className="ml-2" />
        </motion.button>
      </div>
    </div>
  );
};

export default CarDetailsForm;
