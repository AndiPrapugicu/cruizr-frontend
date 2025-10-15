import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Match {
  matchId: string;
  user: {
    id: string;
    name: string;
    age: number;
    carModel: string;
    imageUrl: string;
  };
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Presupunem că backendul returnează lista de match-uri reciproce
        // [{ matchId, user: { id, name, age, carModel, imageUrl } }]
        const res = await api.get("/matches");
        setMatches(res.data);
      } catch (err) {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-600 border-opacity-25 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Match-urile tale</h2>
      {matches.length === 0 ? (
        <p className="text-gray-600">Nu ai încă match-uri.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          {matches.map((match) =>
            match.user ? (
              <div
                key={match.matchId}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition"
                onClick={() =>
                  navigate(`/chat/${match.matchId}`, {
                    state: { otherUserName: match.user.name },
                  })
                }
              >
                <img
                  src={
                    match.user?.imageUrl ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(match.user?.name || "User")
                  }
                  alt={match.user?.name || "User"}
                  className="w-full h-60 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">
                    {match.user.name}, {match.user.age}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Mașină: {match.user.carModel}
                  </p>
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
