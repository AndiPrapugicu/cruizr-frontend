// src/pages/RevMatch.tsx
import { useEffect, useState } from "react";
import api from "../services/api";
import { FaStar, FaCar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface MatchedUser {
  user: {
    id: number;
    name: string;
    carModel: string;
    imageUrl?: string;
    age?: number;
    city?: string;
    interests?: string[];
    carMods?: string[];
  };
  compatibility: number;
}

export default function RevMatch() {
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get<MatchedUser[]>("/users/compatible");
        setMatches(res.data);
      } catch (e) {
        console.error("Eroare fetch compatibilități:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-pink-500 border-opacity-25 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-pink-500 text-white py-4 shadow">
        <h1 className="text-center text-2xl font-bold">RevMatch</h1>
      </header>

      {matches.length === 0 ? (
        <div className="flex items-center justify-center h-96 text-gray-500">
          Nu există utilizatori disponibili pentru compatibilitate.
        </div>
      ) : (
        <div className="max-w-3xl mx-auto mt-6 px-4">
          {matches.map(({ user, compatibility }) => (
            <div
              key={user.id}
              className="flex items-center bg-white rounded-lg shadow mb-4 p-4 hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/users/${user.id}`)}
            >
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full border-2 border-pink-500 overflow-hidden mr-4">
                <img
                  src={
                    user.imageUrl
                      ? `${import.meta.env.VITE_API_URL}${user.imageUrl}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name
                        )}&background=FFE4E6&color=000000`
                  }
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {user.name}
                  </h2>
                  {user.carModel && (
                    <span className="flex items-center text-gray-500 text-sm">
                      <FaCar className="mr-1" />
                      {user.carModel}
                    </span>
                  )}
                </div>
                {user.city && (
                  <p className="text-gray-500 text-sm">{user.city}</p>
                )}
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-medium">Compatibilitate: </span>
                  {compatibility}%
                </p>

                {/* Sub lista scurtă interese */}
                {user.interests && user.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.interests.slice(0, 3).map((int, idx) => (
                      <span
                        key={idx}
                        className="bg-pink-100 text-pink-800 text-xs rounded-full px-2 py-0.5"
                      >
                        {int}
                      </span>
                    ))}
                    {user.interests.length > 3 && (
                      <span className="text-gray-400 text-xs">
                        +{user.interests.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <FaStar className="text-yellow-400 text-2xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-8 text-center text-sm text-gray-500">
        © 2025 Car Dating App
      </footer>
    </div>
  );
}
