import { useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import {
  FaCameraRetro,
  FaArrowRight,
  FaArrowLeft,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
// import { useOnboarding } from "./OnboardingContext";
import { useOnboarding } from "./useOnboarding";
import ProgressBar from "./ProgressBar";

const Step5Photos: React.FC = () => {
  const { data, setData, currentStep, setCurrentStep, totalSteps } =
    useOnboarding();
  const [photos, setPhotos] = useState<File[]>(data.photos);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    // Create preview URLs for existing photos
    const newPreviews = photos.map((photo) => URL.createObjectURL(photo));
    setPreviews(newPreviews);

    // Cleanup function
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  const handleFileSelect = (files: FileList) => {
    const maxPhotos = 6;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles: File[] = [];
    let errorMessage = "";

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!allowedTypes.includes(file.type)) {
        errorMessage = "Doar imagini JPG, PNG sau WebP sunt permise";
        continue;
      }

      if (file.size > maxSize) {
        errorMessage = "Imaginile trebuie să fie mai mici de 10MB";
        continue;
      }

      if (photos.length + validFiles.length >= maxPhotos) {
        errorMessage = `Poți adăuga maxim ${maxPhotos} poze`;
        break;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setPhotos((prev) => [...prev, ...validFiles]);
      setError("");
    }

    if (errorMessage) {
      setError(errorMessage);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (photos.length === 0) {
      setError("Adaugă cel puțin o poză");
      return;
    }

    setData((prev) => ({ ...prev, photos }));
    setCurrentStep(8); // Go to Step8 (complete)
  };

  const handleBack = () => {
    setCurrentStep(6); // Go back to Step6 (bio)
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
              <FaCameraRetro className="text-white text-2xl" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Adaugă fotografii
            </h1>
            <p className="text-gray-600">
              Adaugă cel puțin o poză cu tine. Pozele de calitate îți vor crește
              șansele!
            </p>
            <p className="text-sm text-purple-600 mt-2">
              {photos.length}/6 poze adăugate
            </p>
          </div>

          <div className="space-y-6">
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragging
                  ? "border-purple-400 bg-purple-50"
                  : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  e.target.files && handleFileSelect(e.target.files)
                }
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer block">
                <FaPlus className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Trage pozele aici sau click pentru a selecta
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG sau WebP (max 10MB per poză)
                </p>
              </label>
            </div>

            {/* Photo Preview Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl shadow-md"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                        Principală
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

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
                disabled={photos.length === 0}
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

export default Step5Photos;
