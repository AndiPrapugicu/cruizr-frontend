// src/components/Likes.tsx
import { useEffect, useState } from "react";
import api from "../services/api";
import { FaHeart, FaStar, FaCrown, FaCar } from "react-icons/fa";

interface User {
  id: number;
  name: string;
  carModel?: string;
  imageUrl?: string;
  age?: number;
  type?: "like" | "super-like";
}

export default function Likes() {
  const [likes, setLikes] = useState<User[]>([]);
  const [superLikes, setSuperLikes] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"likes" | "super-likes">("likes");

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        // Fetch regular likes
        const likesRes = await api.get("/matches/received-likes");
        const likesData = likesRes.data.map((user: User) => ({
          ...user,
          type: "like",
        }));
        setLikes(likesData);

        // Fetch super likes
        const superLikesRes = await api.get("/matches/received-super-likes");
        const superLikesData = superLikesRes.data.map((user: User) => ({
          ...user,
          type: "super-like",
        }));
        setSuperLikes(superLikesData);
      } catch (error) {
        console.error("Error fetching likes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLikes();
  }, []);

  const handleLikeBack = async (userId: number, isFromSuperLikes = false) => {
    try {
      const res = await api.post("/matches/swipe", {
        userId,
        direction: "right",
      });

      if (res.data?.match) {
        alert("Ați făcut Match! 🎉");
      }

      // Remove user from appropriate list
      if (isFromSuperLikes) {
        setSuperLikes(superLikes.filter((u) => u.id !== userId));
      } else {
        setLikes(likes.filter((u) => u.id !== userId));
      }
    } catch (error) {
      alert("Eroare la trimiterea like-ului înapoi.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-b from-purple-50 to-pink-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700 font-medium">Se încarcă...</p>
        </div>
      </div>
    );
  }

  const currentUsers = activeTab === "likes" ? likes : superLikes;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          💖 Cine ți-a dat like
        </h1>
        <p className="text-gray-600">
          Descoperă persoanele care te-au apreciat
        </p>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-white rounded-full p-1 shadow-lg max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("likes")}
          className={`flex-1 py-3 px-6 rounded-full font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeTab === "likes"
              ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-md"
              : "text-gray-600 hover:text-pink-500"
          }`}
        >
          <FaHeart className="w-4 h-4" />
          <span>Likes</span>
          {likes.length > 0 && (
            <span
              className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === "likes"
                  ? "bg-white text-pink-500"
                  : "bg-pink-100 text-pink-600"
              }`}
            >
              {likes.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("super-likes")}
          className={`flex-1 py-3 px-6 rounded-full font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeTab === "super-likes"
              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md"
              : "text-gray-600 hover:text-yellow-500"
          }`}
        >
          <FaStar className="w-4 h-4" />
          <span>Super Likes</span>
          {superLikes.length > 0 && (
            <span
              className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === "super-likes"
                  ? "bg-white text-yellow-500"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {superLikes.length}
            </span>
          )}
        </button>
      </div>
      {/* Content */}
      {currentUsers.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">
            {activeTab === "likes" ? (
              <FaHeart className="inline text-pink-500" />
            ) : (
              <FaStar className="inline text-yellow-500" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {activeTab === "likes"
              ? "Nu ai like-uri noi"
              : "Nu ai super like-uri noi"}
          </h3>
          <p className="text-gray-500">
            {activeTab === "likes"
              ? "Când cineva îți va da like, vei vedea aici"
              : "Super like-urile speciale vor apărea aici"}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {currentUsers.map((user) => (
            <div
              key={user.id}
              className={`relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ${
                user.type === "super-like"
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200"
                  : "bg-white border border-gray-100"
              }`}
            >
              {/* Super Like Badge */}
              {user.type === "super-like" && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <FaCrown className="w-3 h-3" />
                    <span>SUPER LIKE</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-5">
                {/* User Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative">
                    <img
                      src={
                        user.imageUrl ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(user.name)
                      }
                      alt={user.name}
                      className={`w-16 h-16 rounded-full object-cover border-3 ${
                        user.type === "super-like"
                          ? "border-yellow-400 shadow-lg"
                          : "border-pink-300"
                      }`}
                    />
                    {user.type === "super-like" && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <FaStar className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {user.name}
                      {user.age && (
                        <span className="text-gray-600 font-normal ml-2">
                          {user.age} ani
                        </span>
                      )}
                    </h3>
                    {user.carModel && (
                      <p className="text-gray-600 text-sm flex items-center">
                        <FaCar className="inline mr-1" />
                        {user.carModel}
                      </p>
                    )}
                    {user.type === "super-like" && (
                      <p className="text-orange-600 text-xs font-medium mt-1">
                        Ți-a trimis un Super Like special!
                        <FaStar className="inline ml-1 text-yellow-500" />
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                    user.type === "super-like"
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                      : "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
                  }`}
                  onClick={() =>
                    handleLikeBack(user.id, user.type === "super-like")
                  }
                  title={
                    user.type === "super-like"
                      ? "Răspunde la Super Like"
                      : "Dă like înapoi"
                  }
                >
                  {user.type === "super-like" ? (
                    <FaStar className="w-5 h-5" />
                  ) : (
                    <FaHeart className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
