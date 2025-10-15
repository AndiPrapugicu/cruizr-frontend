import React, { useEffect, useState } from "react";
import api from "../services/api";
import { FaTimes } from "react-icons/fa";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  carModel?: string;
  carMods?: string[];
  imageUrl?: string;
  photos?: string[];
  age?: number;
  interests?: string[];
  isVip?: boolean;
  vipTitle?: string;
  vipExpiresAt?: Date | string;
}

interface ProfilePreviewProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePreview({
  userId,
  isOpen,
  onClose,
}: ProfilePreviewProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    api
      .get<ProfileData>(`/users/${userId}/profile`)
      .then((res) => {
        console.log("Profil primit:", res.data);
        setProfile(res.data);
      })
      .catch((err) => {
        console.error("Eroare la încărcarea profilului:", err);
        setProfile(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const baseUrl = "http://localhost:3000";

  const getPhotos = () => {
    if (profile?.photos && profile.photos.length > 0) return profile.photos;
    if (profile?.imageUrl) return [profile.imageUrl];
    return [];
  };

  const photos = getPhotos();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Buton închidere */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white bg-teal-600 rounded-full p-2 hover:bg-teal-700 transition"
          aria-label="Închide"
        >
          <FaTimes size={24} />
        </button>

        {loading ? (
          <div className="flex items-center justify-center flex-grow">
            <div className="w-14 h-14 border-4 border-teal-600 border-opacity-25 rounded-full animate-spin" />
          </div>
        ) : profile ? (
          <>
            {/* Carousel de poze, 70% înălțime */}
            <div className="relative w-full h-[70vh] bg-gray-100">
              {photos.length > 0 ? (
                <div className="h-full w-full overflow-x-auto flex snap-x snap-mandatory scroll-smooth scrollbar-thin scrollbar-thumb-teal-600">
                  {photos.map((photoUrl, idx) => {
                    const fullUrl = photoUrl.startsWith("http")
                      ? photoUrl
                      : `${baseUrl}${photoUrl}`;
                    return (
                      <img
                        key={idx}
                        src={fullUrl}
                        alt={`Poză ${idx + 1}`}
                        className="snap-center flex-shrink-0 w-full h-full object-cover rounded-b-3xl"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">
                  Nu există poze.
                </div>
              )}
            </div>

            {/* Info Profil */}
            <div className="p-6 space-y-5 overflow-y-auto flex-grow bg-white rounded-b-3xl">
              <h2 className="text-3xl font-extrabold text-teal-900 border-b border-teal-100 pb-2 mb-4">
                {profile.name}
                {profile.age ? `, ${profile.age}` : ""}
              </h2>
              
              {/* VIP Badge */}
              {profile.isVip && (
                <div className="flex items-center justify-center bg-yellow-400 text-yellow-800 px-4 py-2 rounded-full mb-4 shadow-lg">
                  <span className="text-lg mr-2">👑</span>
                  <span className="font-bold text-sm">{profile.vipTitle || 'VIP'}</span>
                </div>
              )}
              
              <div className="space-y-3 text-teal-700 text-lg">
                <p>
                  <span className="font-semibold">Mașină:</span>{" "}
                  {profile.carModel}
                </p>
                <p>
                  <span className="font-semibold">Modificări:</span>{" "}
                  {profile.carMods && profile.carMods.length > 0 ? (
                    profile.carMods.join(", ")
                  ) : (
                    <em>Nu sunt modificări înregistrate</em>
                  )}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-teal-900 mb-2">Interese:</h3>
                {profile.interests &&
                Array.isArray(profile.interests) &&
                profile.interests.length > 0 ? (
                  <ul className="flex flex-wrap gap-3">
                    {profile.interests.map((interest, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-1 bg-teal-100 text-teal-900 rounded-full text-base font-medium"
                      >
                        {interest}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    <em>Nu există interese înregistrate</em>
                  </p>
                )}
              </div>

              {/* {profile.bio && (
                <div>
                  <h3 className="font-semibold text-teal-900 mb-2">
                    Despre mine:
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )} */}
            </div>
          </>
        ) : (
          <div className="p-6 text-red-500">Nu am putut încărca profilul.</div>
        )}
      </div>
    </div>
  );
}
