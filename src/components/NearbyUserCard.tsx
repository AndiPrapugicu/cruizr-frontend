// src/pages/Nearby.tsx (exemplu simplificat)

import React, { useEffect, useState } from "react";
import api from "../services/api";
import NearbyUserCard from "../components/NearbyUserCard";

interface NearbyUser {
  id: number;
  name: string;
  age: number;
  carModel: string;
  imageUrl: string;
  // …alte câmpuri
}

export default function Nearby() {
  const [users, setUsers] = useState<NearbyUser[]>([]);

  useEffect(() => {
    api
      .get<NearbyUser[]>("/users/nearby")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Eroare la încărcarea userilor din apropiere:", err);
      });
  }, []);

  const handleSwipe = (
    direction: "left" | "right" | "up",
    user: NearbyUser
  ) => {
    // logica de swipe (ex.: trimitem ca “like” sau “dislike”)
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-cyan-50 to-teal-100 pt-4 pb-24">
      <h2 className="text-2xl font-bold mb-2 text-teal-900">
        Persoane din apropiere
      </h2>
      <div className="w-full max-w-xs relative min-h-[430px]">
        {users.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-gray-400">
            Nu există profile în această rază.
          </div>
        ) : (
          users.map((user) => (
            <NearbyUserCard key={user.id} user={user} onSwipe={handleSwipe} />
          ))
        )}
      </div>
    </div>
  );
}
