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
      alert("Please select at least one photo.");
      return;
    }

    setLoading(true);
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add all selected files
      selectedFiles.forEach((file) => {
        formData.append('photos', file, file.name);
      });

      console.log(`📸 Uploading ${selectedFiles.length} photo files via FormData`);

      // Upload photos to backend
      const response = await api.post("/users/upload-photos", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("✅ Photos uploaded successfully:", response.data);
      
      // Return the new photos array to parent
      onPhotosAdded(response.data.photos);
      onClose();
    } catch (error) {
      console.error("❌ Error uploading photos:", error);
      alert("Error uploading photos. Please try again.");
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
            Add photos
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
          Tips for quality photos:
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use natural light for the best results</li>
          <li>
            • Photograph from different angles to show your
            personality
          </li>
          <li>• Include at least one photo with your face clearly visible</li>
          <li>• Avoid dark or blurry photos</li>
          <li>• You can upload up to 6 photos</li>
        </ul>
      </div>

      {/* Upload Area */}
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors">
          <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Select your photos</p>
          <p className="text-sm text-gray-500 mb-4">
            You can select up to {6 - selectedFiles.length} photos
            {selectedFiles.length > 0 ? " more" : ""}
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
              ? "Maximum 6 photos"
              : "Select photos"}
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
              Selected photos ({photoPreview.length}/6)
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
                      Primary
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
          Cancel
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
              <span>Loading...</span>
            </>
          ) : (
            <>
              <FaCheck />
              <span>Upload photos ({selectedFiles.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
