import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaTimes,
  FaCar,
  FaUpload,
  FaTrash,
  FaPlus,
  FaCheck,
} from "react-icons/fa";
import api from "../services/api";

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

interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  photos: string[];
  isMain: boolean;
  engineSize?: string;
  horsepower?: number;
  torque?: number;
  transmission?: string;
  fuelType?: string;
  drivetrain?: string;
  doors?: number;
  seats?: number;
  mileage?: number;
  bodyType?: string;
  upholsteryType?: string;
  interiorColor?: string;
  hasSunroof?: boolean;
  mods?: string[];
}

interface AddCarModalProps {
  onClose: () => void;
  onCarAdded: (car: CarData) => void;
}

export default function AddCarModal({ onClose, onCarAdded }: AddCarModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [carData, setCarData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    engineSize: "",
    horsepower: "",
    torque: "",
    transmission: "",
    fuelType: "",
    drivetrain: "",
    doors: 4,
    seats: 5,
    mileage: "",
    bodyType: "",
    upholsteryType: "",
    interiorColor: "",
    hasSunroof: false,
    mods: [] as string[],
  });
  const [carPhotos, setCarPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [newMod, setNewMod] = useState("");

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setCarData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Limit to 5 photos max
    const remainingSlots = 5 - carPhotos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    setCarPhotos((prev) => [...prev, ...filesToAdd]);

    // Create preview URLs
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setCarPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const addModification = () => {
    if (newMod.trim() && !carData.mods.includes(newMod.trim())) {
      setCarData((prev) => ({
        ...prev,
        mods: [...prev.mods, newMod.trim()],
      }));
      setNewMod("");
    }
  };

  const removeMod = (mod: string) => {
    setCarData((prev) => ({
      ...prev,
      mods: prev.mods.filter((m) => m !== mod),
    }));
  };

  const toggleMod = (mod: string) => {
    const currentMods = carData.mods || [];
    let updatedMods: string[];

    if (currentMods.includes(mod)) {
      updatedMods = currentMods.filter((m) => m !== mod);
    } else {
      updatedMods = [...currentMods, mod];
    }

    setCarData((prev) => ({ ...prev, mods: updatedMods }));
  };

  const handleSubmit = async () => {
    if (!carData.make || !carData.model || !carData.year) {
      alert("Te rog completează măcar marca, modelul și anul mașinii.");
      return;
    }

    setLoading(true);
    try {
      // Get JWT token
      const token = localStorage.getItem("token");
      const photoUrls: string[] = [];

      // First, upload all photos individually to get URLs
      for (const photo of carPhotos) {
        const formData = new FormData();
        formData.append("photo", photo); // Backend expects 'photo' key

        const response = await api.post("/cars/upload-photo", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.url) {
          photoUrls.push(response.data.url);
        }
      }

      // Then create the car with all data including photo URLs
      const carPayload = {
        brand: carData.make,
        model: carData.model,
        year: carData.year,
        color: carData.color,
        engineSize: carData.engineSize,
        horsepower: carData.horsepower
          ? parseInt(carData.horsepower.toString())
          : undefined,
        torque: carData.torque
          ? parseInt(carData.torque.toString())
          : undefined,
        transmission: carData.transmission,
        fuelType: carData.fuelType,
        drivetrain: carData.drivetrain,
        doors: carData.doors,
        seats: carData.seats,
        mileage: carData.mileage
          ? parseInt(carData.mileage.toString())
          : undefined,
        bodyType: carData.bodyType,
        upholsteryType: carData.upholsteryType,
        interiorColor: carData.interiorColor,
        hasSunroof: carData.hasSunroof,
        mods: carData.mods,
        photos: photoUrls, // Include uploaded photo URLs
        isPrimary: false, // Let backend decide if it should be primary
      };

      console.log("Creating car with payload:", carPayload);

      const response = await api.post("/cars", carPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Transform response to match CarData interface
      const newCar: CarData = {
        id: response.data.id.toString(),
        make: response.data.brand || response.data.make,
        model: response.data.model,
        year: response.data.year,
        color: response.data.color || "",
        photos: response.data.photos || photoUrls,
        isMain: response.data.isPrimary || false,
        engineSize: response.data.engineSize,
        horsepower: response.data.horsepower,
        torque: response.data.torque,
        transmission: response.data.transmission,
        fuelType: response.data.fuelType,
        drivetrain: response.data.drivetrain,
        doors: response.data.doors,
        seats: response.data.seats,
        mileage: response.data.mileage,
        bodyType: response.data.bodyType,
        upholsteryType: response.data.upholsteryType,
        interiorColor: response.data.interiorColor,
        hasSunroof: response.data.hasSunroof,
        mods: response.data.mods || carData.mods,
      };

      console.log("Car created successfully:", newCar);
      onCarAdded(newCar);
      onClose(); // Close modal after successful creation
    } catch (error) {
      console.error("Error adding car:", error);
      alert("Eroare la adăugarea mașinii. Te rog încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Informații de bază
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca *
                </label>
                <input
                  type="text"
                  value={carData.make}
                  onChange={(e) => handleInputChange("make", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="ex: BMW, Audi, Mercedes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  value={carData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="ex: A4, 320i, C-Class"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anul fabricației *
                </label>
                <input
                  type="number"
                  value={carData.year}
                  onChange={(e) =>
                    handleInputChange("year", parseInt(e.target.value))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Culoare
                </label>
                <input
                  type="text"
                  value={carData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="ex: Negru, Alb, Roșu"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Specificații tehnice
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacitatea motorului
                </label>
                <input
                  type="text"
                  value={carData.engineSize}
                  onChange={(e) =>
                    handleInputChange("engineSize", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="ex: 2.0L, 3.0L"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Putere (CP)
                </label>
                <input
                  type="number"
                  value={carData.horsepower}
                  onChange={(e) =>
                    handleInputChange("horsepower", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="ex: 150, 300, 500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuplu (Nm)
                </label>
                <input
                  type="number"
                  value={carData.torque}
                  onChange={(e) => handleInputChange("torque", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="ex: 250, 400, 600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transmisie
                </label>
                <select
                  value={carData.transmission}
                  onChange={(e) =>
                    handleInputChange("transmission", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Selectează</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automat</option>
                  <option value="Semi-Automatic">Semi-automat</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tip combustibil
                </label>
                <select
                  value={carData.fuelType}
                  onChange={(e) =>
                    handleInputChange("fuelType", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Selectează</option>
                  <option value="Petrol">Benzină</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hibrid</option>
                  <option value="Electric">Electric</option>
                  <option value="LPG">GPL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracțiune
                </label>
                <select
                  value={carData.drivetrain}
                  onChange={(e) =>
                    handleInputChange("drivetrain", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Selectează</option>
                  <option value="FWD">Față (FWD)</option>
                  <option value="RWD">Spate (RWD)</option>
                  <option value="AWD">Integrală (AWD)</option>
                  <option value="4WD">4x4 (4WD)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numărul de uși
                </label>
                <select
                  value={carData.doors}
                  onChange={(e) =>
                    handleInputChange("doors", parseInt(e.target.value))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value={2}>2 uși</option>
                  <option value={3}>3 uși</option>
                  <option value={4}>4 uși</option>
                  <option value={5}>5 uși</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numărul de locuri
                </label>
                <select
                  value={carData.seats}
                  onChange={(e) =>
                    handleInputChange("seats", parseInt(e.target.value))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value={2}>2 locuri</option>
                  <option value={4}>4 locuri</option>
                  <option value={5}>5 locuri</option>
                  <option value={7}>7 locuri</option>
                  <option value={8}>8 locuri</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Modificări și personalizări
            </h2>

            <p className="text-gray-600 mb-6">
              Selectează modificările pe care le are mașina ta. Poți selecta
              oricare dintre opțiuni sau poți să nu selectezi nimic dacă mașina
              este stock.
            </p>

            {/* Selected count */}
            {carData.mods.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6"
              >
                <p className="text-sm font-medium text-purple-800">
                  {carData.mods.length} modificări selectate
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {carData.mods.slice(0, 5).map((mod, index) => (
                    <span
                      key={index}
                      className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full"
                    >
                      {mod}
                    </span>
                  ))}
                  {carData.mods.length > 5 && (
                    <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
                      +{carData.mods.length - 5} altele
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Modifications grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {commonMods.map((mod, index) => {
                const isSelected = carData.mods.includes(mod);

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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sunroof"
                checked={carData.hasSunroof}
                onChange={(e) =>
                  handleInputChange("hasSunroof", e.target.checked)
                }
                className="mr-3 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label
                htmlFor="sunroof"
                className="text-sm font-medium text-gray-700"
              >
                Are trapă de sticlă
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Adaugă fotografii
            </h2>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Selectează până la 5 fotografii cu mașina ta
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-pink-600 transition"
                >
                  Selectează fotografii
                </label>
              </div>

              {photoPreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photoPreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FaCar className="text-2xl text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-800">
            Adaugă mașină nouă
          </h1>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Pasul {currentStep} din 4</span>
          <span>{Math.round((currentStep / 4) * 100)}% completat</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderStep()}
      </motion.div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() =>
            currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()
          }
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          {currentStep > 1 ? "Înapoi" : "Anulează"}
        </button>

        {currentStep < 4 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={currentStep === 1 && (!carData.make || !carData.model)}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Următorul
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Se adaugă..." : "Adaugă mașina"}
          </button>
        )}
      </div>
    </div>
  );
}
