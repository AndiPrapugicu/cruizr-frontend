import { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaCamera, FaUpload, FaTrash, FaCheck } from "react-icons/fa";
import api from "../services/api";

interface AddPhotosModalProps {
  onClose: () => void;
  onPhotosAdded: (photos: string[]) => void;
}

export default function AddPhotosModal({
  onClose,
  onPhotosAdded,
}: AddPhotosModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Limit to 6 photos max (total including existing)
    const remainingSlots = 6 - selectedFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);

    setSelectedFiles((prev) => [...prev, ...filesToAdd]);

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
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Te rog selectează cel puțin o fotografie.");
      return;
    }

    setLoading(true);
    try {
      // Get JWT token
      const token = localStorage.getItem("token");
      const uploadedUrls: string[] = [];

      // Upload each photo individually since backend accepts only one file per request
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("photo", file); // Backend expects 'photo' key, not 'photos'

        const response = await api.post("/users/upload-photo", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        // Extract photo URL from response
        if (response.data.url) {
          uploadedUrls.push(response.data.url);
        }
      }

      // After uploading all photos, update user profile with new photos array
      const userResponse = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const currentPhotos = userResponse.data.photos || [];
      const newPhotos = [...currentPhotos, ...uploadedUrls];
      const newImageUrl = userResponse.data.imageUrl || uploadedUrls[0];

      // Update user profile with all photos
      await api.patch(
        "/users/me",
        {
          photos: newPhotos,
          imageUrl: newImageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Successfully uploaded photos and updated profile:",
        uploadedUrls
      );
      onPhotosAdded(uploadedUrls);
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Eroare la încărcarea fotografiilor. Te rog încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FaCamera className="text-2xl text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-800">
            Adaugă fotografii
          </h1>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">
          Sfaturi pentru fotografii de calitate:
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Folosește lumină naturală pentru cele mai bune rezultate</li>
          <li>
            • Fotografiază din unghiuri diferite pentru a-ți arăta
            personalitatea
          </li>
          <li>• Include cel puțin o fotografie cu fața ta clară</li>
          <li>• Evită fotografiile întunecate sau blurate</li>
          <li>• Poți încărca până la 6 fotografii</li>
        </ul>
      </div>

      {/* Upload Area */}
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors">
          <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Selectează fotografiile tale</p>
          <p className="text-sm text-gray-500 mb-4">
            Poți selecta până la {6 - selectedFiles.length} fotografii
            {selectedFiles.length > 0 ? " în plus" : ""}
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
            id="photo-upload"
            disabled={selectedFiles.length >= 6}
          />
          <label
            htmlFor="photo-upload"
            className={`inline-block px-6 py-3 rounded-lg cursor-pointer transition ${
              selectedFiles.length >= 6
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-pink-500 text-white hover:bg-pink-600"
            }`}
          >
            {selectedFiles.length >= 6
              ? "Maximum 6 fotografii"
              : "Selectează fotografii"}
          </label>
        </div>

        {/* Photo Preview Grid */}
        {photoPreview.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-gray-800">
              Fotografii selectate ({photoPreview.length}/6)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photoPreview.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg shadow-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => removePhoto(index)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Principală
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Anulează
        </button>

        <button
          onClick={handleUpload}
          disabled={loading || selectedFiles.length === 0}
          className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Se încarcă...</span>
            </>
          ) : (
            <>
              <FaCheck />
              <span>Încarcă fotografiile ({selectedFiles.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
