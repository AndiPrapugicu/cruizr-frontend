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
  "White",
  "Black",
  "Gray",
  "Silver",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Brown",
  "Purple",
  "Pink",
  "Beige",
  "Burgundy",
];

const fuelTypes = [
  "Gasoline",
  "Diesel",
  "Hybrid",
  "Electric",
  "LPG",
  "Gasoline + LPG",
  "Hydrogen",
];

const transmissionTypes = [
  "Manual",
  "Automatic",
  "CVT",
  "DSG",
  "Tiptronic",
  "Multitronic",
];

const drivetrainTypes = [
  "FWD (Front-wheel drive)",
  "RWD (Rear-wheel drive)",
  "AWD (All-wheel drive)",
  "4WD",
];

const upholsteryTypes = [
  "Fabric",
  "Leather",
  "Eco-leather",
  "Alcantara",
  "Velour",
  "Combined",
];

const interiorColors = ["Black", "Gray", "Beige", "Brown", "Red", "White", "Cream"];

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
        "Please fill in all required fields (Brand, Model, Year)!"
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
            {(typeof currentValue === 'string' || typeof currentValue === 'number' || typeof currentValue === 'boolean') ? currentValue : placeholder}
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
        Car Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand */}
        <div className="md:col-span-2">
          {renderDropdown(
            "Brand",
            "brand",
            carBrands,
            "Select brand",
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
            "Manufacturing year",
            "year",
            years,
            "Select year",
            true
          )}
        </div>

        {/* Color */}
        <div>
          {renderDropdown("Color", "color", carColors, "Select color")}
        </div>

        {/* Engine Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Engine capacity (L)
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
            "Body type",
            "bodyType",
            bodyTypes,
            "Select type"
          )}
        </div>

        {/* Horsepower */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Power (HP)
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
            Torque (Nm)
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
            "Fuel",
            "fuelType",
            fuelTypes,
            "Select fuel type"
          )}
        </div>

        {/* Transmission */}
        <div>
          {renderDropdown(
            "Transmission",
            "transmission",
            transmissionTypes,
            "Select transmission"
          )}
        </div>

        {/* Drivetrain */}
        <div>
          {renderDropdown(
            "Drivetrain",
            "drivetrain",
            drivetrainTypes,
            "Select drivetrain"
          )}
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mileage
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
            "Upholstery",
            "upholsteryType",
            upholsteryTypes,
            "Select upholstery"
          )}
        </div>

        {/* Interior Color */}
        <div>
          {renderDropdown(
            "Interior color",
            "interiorColor",
            interiorColors,
            "Select color"
          )}
        </div>

        {/* Doors */}
        <div>
          {renderDropdown(
            "Number of doors",
            "doors",
            doorOptions,
            "Select number"
          )}
        </div>

        {/* Seats */}
        <div>
          {renderDropdown(
            "Number of seats",
            "seats",
            seatOptions,
            "Select number"
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
              Has sunroof/panoramic roof
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
          Continue
          <FaArrowRight className="ml-2" />
        </motion.button>
      </div>
    </div>
  );
};

export default CarDetailsForm;
