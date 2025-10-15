import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaCamera,
  FaSpinner,
} from "react-icons/fa";
import { CarData } from "./CarOnboardingStep";
import api from "../../services/api";

interface CarPhotosProps {
  car: Partial<CarData>;
  setCar: React.Dispatch<React.SetStateAction<Partial<CarData>>>;
  onBack: () => void;
  onSave: () => void;
}

const CarPhotos: React.FC<CarPhotosProps> = ({
  car,
  setCar,
  onBack,
  onSave,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photos = car.photos || [];

  const uploadPhoto = async (file: File): Promise<string> => {
    console.log("🖼️ [CarPhotos] Starting photo upload:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // During onboarding, we'll store photos locally and upload them later
    // after user registration is complete
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log(
          "📸 [CarPhotos] Photo converted to base64, length:",
          result.length
        );
        resolve(result);
      };
      reader.readAsDataURL(file);
    });

    /* Original upload code - will be used after registration
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await api.post("/cars/upload-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ [CarPhotos] Photo uploaded successfully:", response.data);
      return response.data.url;
    } catch (error) {
      console.error("❌ [CarPhotos] Photo upload failed:", error);
      throw new Error("Failed to upload photo");
    }
    */
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    console.log("📸 [CarPhotos] Files selected:", files.length);

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < Math.min(files.length, 10 - photos.length); i++) {
        const file = files[i];

        console.log("📸 [CarPhotos] Processing file:", file.name);

        // Validate file type
        if (!file.type.startsWith("image/")) {
          console.warn("⚠️ [CarPhotos] Invalid file type:", file.type);
          alert(`Fișierul "${file.name}" nu este o imagine validă.`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.warn("⚠️ [CarPhotos] File too large:", file.size);
          alert(
            `Imaginea "${file.name}" este prea mare. Dimensiunea maximă este 10MB.`
          );
          continue;
        }

        try {
          const url = await uploadPhoto(file);
          uploadedUrls.push(url);
          console.log("✅ [CarPhotos] File processed successfully:", file.name);
        } catch (fileError) {
          console.error(
            "❌ [CarPhotos] Failed to process file:",
            file.name,
            fileError
          );
          alert(
            `Nu am putut procesa imaginea "${file.name}". Te rog încearcă din nou.`
          );
        }
      }

      if (uploadedUrls.length > 0) {
        setCar((prev) => ({
          ...prev,
          photos: [...(prev.photos || []), ...uploadedUrls],
        }));
        console.log("✅ [CarPhotos] Added photos to car:", uploadedUrls.length);
      }
    } catch (error) {
      console.error("❌ [CarPhotos] General error in file selection:", error);
      alert("Eroare la procesarea imaginilor. Te rog încearcă din nou.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setCar((prev) => ({ ...prev, photos: updatedPhotos }));
  };

  const handleSaveAndContinue = () => {
    if (photos.length === 0) {
      const confirmed = window.confirm(
        "Nu ai adăugat nicio poză pentru această mașină. Ești sigur că vrei să continui?"
      );
      if (!confirmed) return;
    }
    onSave();
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">Poze mașină</h3>

      <p className="text-gray-600 mb-4">
        Adaugă poze cu mașina ta! Pozele bune fac profilul tău mai atractiv.
        Poți adăuga până la 10 poze.
      </p>

      {/* Info message about onboarding */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Pozele sunt stocate temporar în timpul înregistrării și vor fi
              încărcate după finalizarea contului.
            </p>
          </div>
        </div>
      </div>

      {/* Photo upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition duration-300 mb-6 ${
          dragOver
            ? "border-purple-500 bg-purple-50"
            : photos.length >= 10
            ? "border-gray-300 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 hover:border-purple-400 hover:bg-purple-25"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={photos.length >= 10 || uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <FaSpinner className="text-4xl text-purple-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Se procesează pozele...
            </p>
            <p className="text-sm text-gray-500">
              Pozele vor fi încărcate după înregistrare
            </p>
          </div>
        ) : photos.length >= 10 ? (
          <div className="flex flex-col items-center">
            <FaCamera className="text-4xl text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-500">
              Ai atins limita de 10 poze
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FaPlus className="text-4xl text-purple-500 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Adaugă poze cu mașina
            </p>
            <p className="text-sm text-gray-500">
              Trage și plasează pozele aici sau click pentru a selecta
            </p>
            <p className="text-xs text-gray-400 mt-2">
              PNG, JPG, JPEG până la 10MB
            </p>
          </div>
        )}
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Pozele tale ({photos.length}/10)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <img
                  src={photo}
                  alt={`Car photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-xl border border-gray-200"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 hover:bg-red-600"
                >
                  <FaTrash size={12} />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    Principală
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Garage tour section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">
          🎥 Garage Tour (Opțional)
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Înregistrează un video scurt cu mașina ta! Aceasta este o
          funcționalitate care va fi disponibilă în viitor.
        </p>
        <button
          disabled
          className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
        >
          În curând disponibil
        </button>
      </div>

      {/* Navigation */}
      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          disabled={uploading}
          className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition duration-300 flex items-center justify-center disabled:opacity-50"
        >
          <FaArrowLeft className="mr-2" />
          Înapoi
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveAndContinue}
          disabled={uploading}
          className="flex-2 py-3 px-8 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center disabled:opacity-50"
        >
          {uploading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Se încarcă...
            </>
          ) : (
            <>
              <FaCamera className="mr-2" />
              Salvează mașina
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default CarPhotos;
