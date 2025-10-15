// src/pages/Edit.tsx
import React, { useEffect, useState, KeyboardEvent } from "react";
import api from "../services/api";
import { FaPlus, FaTimes, FaSave, FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface User {
  name: string;
  email: string;
  carModel?: string;
  carMods?: string[];
  imageUrl?: string;
  photos?: string[];
  age?: number; // vârsta calculată din birthdate
  birthdate?: string; // ISO date string, ex: "1990-05-20"
  city?: string;
  interests?: string[];
}

const MAX_PHOTOS = 12;

// Lista de 30 de interese pentru car enthusiasts
const allInterests = [
  "JDM",
  "MOPAR",
  "Muscle Cars",
  "Italian Cars",
  "Classic Cars",
  "Hot Rods & Rat Rods",
  "Lowriders",
  "Euro Tuning",
  "Supercars & Hypercars",
  "Luxury Cars",
  "Electric Vehicles",
  "Hybrid Cars",
  "EV Tuning & Modding",
  "Rally & Off-Road",
  "Drifting",
  "Drag Racing",
  "Track Racing",
  "Autocross",
  "Car Meets & Cruise Nights",
  "Car Restoration",
  "Auto Detailing & Valeting",
  "Suspension Tuning",
  "Car Audio & Multimedia",
  "Performance Upgrades",
  "Volkswagen Classics",
  "Diesel Trucks & 4×4",
  "Vintage German Cars",
  "Car Photography & Videography",
  "V8 Engines",
  "Car Wraps & Custom Paint",
];

// Lista de opțiuni pentru modificări (Car Mods)
const allMods = [
  "Paint change",
  "Wheels upgrade",
  "Suspension upgrade",
  "Aftermarket exhaust",
  "Engine tuning",
  "Turbo/Supercharger",
  "Interior customizations",
  "Body kit",
  "Window tinting",
  "Headlights/Taillights upgrade",
  "Sound system",
  "Wrap or decals",
  "Air ride suspension",
  "Brake upgrade",
  "Roll cage",
  "ECU remap",
  "Carbon fiber parts",
  "Steering wheel swap",
  "Seat upgrade",
  "Custom gauge cluster",
];

export default function Edits() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [birthdate, setBirthdate] = useState<string>(""); // yyyy-MM-dd
  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  // ** NOILE STĂRI pentru mașină + modificări **
  const [carModel, setCarModel] = useState<string>("");
  const [carMods, setCarMods] = useState<string[]>([]);
  const [customModInput, setCustomModInput] = useState("");

  const navigate = useNavigate();

  // === FETCH profil + populare stări existente ===
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        const u: User = res.data;
        setUser(u);

        setName(u.name);
        setCity(u.city || "");
        setInterests(u.interests || []);

        if (u.birthdate) {
          setBirthdate(u.birthdate.slice(0, 10));
        }

        // inițializează galeria de fotografii
        const initialPhotos =
          u.photos && u.photos.length > 0
            ? u.photos
            : u.imageUrl
            ? [u.imageUrl]
            : [];
        setPhotos(initialPhotos);
        setImageUrl(u.imageUrl);

        // ** populatează stări noi: carModel + carMods **
        setCarModel(u.carModel || "");
        setCarMods(u.carMods || []);
      } catch (e) {
        console.error("Eroare la fetch user:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // === Interese “la Enter” ===
  const handleInterestKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && interestInput.trim()) {
      e.preventDefault();
      const trimmed = interestInput.trim();
      if (!interests.includes(trimmed)) {
        setInterests([...interests, trimmed]);
      }
      setInterestInput("");
    }
  };

  const removeInterest = (idx: number) => {
    setInterests(interests.filter((_, i) => i !== idx));
  };

  // === Ștergere fotografie din galerie ===
  const removePhoto = (idx: number) => {
    const newPhotos = photos.filter((_, i) => i !== idx);
    setPhotos(newPhotos);
    if (photos[idx] === imageUrl) {
      const nextUrl = newPhotos.length > 0 ? newPhotos[0] : undefined;
      setImageUrl(nextUrl);
    }
  };

  // === Upload foto ===
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (photos.length + files.length > MAX_PHOTOS) {
      alert(`Poți avea maxim ${MAX_PHOTOS} poze.`);
      return;
    }
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("photo", file);
        const res = await api.post("/users/upload-photo", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrls.push(res.data.url);
      }
      const newPhotos = [...photos, ...uploadedUrls];
      setPhotos(newPhotos);
      if (!imageUrl && newPhotos.length > 0) {
        setImageUrl(newPhotos[0]);
      }
    } catch {
      alert("Eroare la upload.");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = ""; // resetează input-ul
    }
  };

  // === SUBMIT modificări profil ===
  const handleSubmit = async () => {
    if (!user) return;

    // construiră payload
    const payload: any = {
      name,
      city,
      interests,
      photos,
      imageUrl,
      carModel,
      carMods,
    };

    // dacă nu exista birthdate, trimite-l
    if (!user.birthdate && birthdate) {
      payload.birthdate = birthdate; // ex: "1990-05-20"
    }

    try {
      await api.patch("/users/me", payload);
      alert("Profil actualizat cu succes!");
      navigate("/profile");
    } catch (e) {
      console.error("Eroare la salvare:", e);
      alert("A apărut o eroare la salvarea profilului.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-700">
        Se încarcă editarea profilului...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      {/* Buton Înapoi */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
      >
        <FaChevronLeft className="mr-2" /> Înapoi
      </button>

      <h2 className="text-2xl font-bold mb-4">Editează Profil</h2>

      <div className="bg-white rounded-2xl shadow px-6 py-8 max-w-xl mx-auto">
        {/* Nume */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Nume</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* Data Nașterii */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Data nașterii
          </label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            disabled={Boolean(user?.birthdate)}
            className={`w-full border ${
              user?.birthdate
                ? "bg-gray-100 cursor-not-allowed"
                : "border-gray-300 focus:ring-pink-400"
            } rounded-md px-3 py-2 focus:outline-none`}
          />
          {user?.birthdate && (
            <p className="mt-1 text-sm text-gray-500">
              Data nașterii a fost setată și nu poate fi modificată.
            </p>
          )}
        </div>

        {/* Oraș */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Oraș</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* Model Mașină */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Car Model
          </label>
          <input
            type="text"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            placeholder="ex: BMW E46, VW Golf Mk4, etc."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* Modificări aduse mașinii */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Car Modifications
          </label>

          {/* Selectare rapidă din lista allMods */}
          <div className="flex flex-wrap gap-2 mb-2">
            {allMods.map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => {
                  if (!carMods.includes(mod)) setCarMods([...carMods, mod]);
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-pink-100 text-sm rounded-full border border-gray-300"
              >
                {mod}
              </button>
            ))}
          </div>

          {/* Custom mod input (la Enter) */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={customModInput}
              onChange={(e) => setCustomModInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customModInput.trim()) {
                  e.preventDefault();
                  const newMod = customModInput.trim();
                  if (!carMods.includes(newMod)) {
                    setCarMods([...carMods, newMod]);
                  }
                  setCustomModInput("");
                }
              }}
              placeholder="Add your own modification and press Enter"
              className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Afișăm modificările curente */}
          <div className="flex flex-wrap mt-2 gap-2">
            {carMods.map((mod, idx) => (
              <span
                key={idx}
                className="flex items-center bg-pink-100 text-pink-800 text-sm rounded-full px-3 py-1"
              >
                {mod}
                <button
                  onClick={() =>
                    setCarMods(carMods.filter((_, i) => i !== idx))
                  }
                  className="ml-2 text-pink-700 hover:text-pink-900"
                >
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Interese */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Interese
          </label>
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={handleInterestKey}
            placeholder="Scrie un interest și apasă Enter"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <div className="flex flex-wrap mt-2 gap-2">
            {interests.map((int, idx) => (
              <div
                key={idx}
                className="flex items-center bg-pink-100 text-pink-800 rounded-full px-3 py-1 text-sm"
              >
                <span>{int}</span>
                <FaTimes
                  className="ml-2 cursor-pointer"
                  onClick={() => removeInterest(idx)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Lista de interese predefinite */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">
            Alegeri rapide
          </label>
          <div className="flex flex-wrap gap-2">
            {allInterests.map((int, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!interests.includes(int)) {
                    setInterests([...interests, int]);
                  }
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  interests.includes(int)
                    ? "bg-pink-500 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                } transition`}
              >
                {int}
              </button>
            ))}
          </div>
        </div>

        {/* Galerie poze */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Poze Profil
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative">
                <img
                  src={
                    photo.startsWith("http")
                      ? photo
                      : `${import.meta.env.VITE_API_URL}${photo}`
                  }
                  alt={`photo-${idx}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  &times;
                </button>
                {/* Dacă e principală */}
                {photo === imageUrl && (
                  <span className="absolute bottom-0 left-0 bg-pink-500 text-white text-xs px-1 rounded-tr-lg">
                    Principală
                  </span>
                )}
                {photo !== imageUrl && (
                  <button
                    onClick={() => setImageUrl(photo)}
                    className="absolute bottom-0 left-0 bg-gray-700/70 text-white text-xs px-1 rounded-tr-lg hover:bg-gray-800"
                  >
                    Setare ca primară
                  </button>
                )}
              </div>
            ))}
          </div>
          <label className="flex items-center gap-1 cursor-pointer text-indigo-600 hover:text-indigo-800">
            <FaPlus />
            <span className="text-sm">
              {uploading ? "Se încarcă..." : "Încarcă poze"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading || photos.length >= MAX_PHOTOS}
              onChange={handlePhotoUpload}
            />
          </label>
        </div>

        {/* Buton Salvare */}
        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-pink-500 text-white py-2 rounded-md flex items-center justify-center hover:bg-pink-600 transition"
        >
          <FaSave className="mr-2" />
          Salvează Modificările
        </button>
      </div>
    </div>
  );
}
