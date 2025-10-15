// src/components/ChatPage.tsx

import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHeart, FaSearch, FaUsers, FaComments } from "react-icons/fa";
import api from "../services/api";
import { getSocket } from "../services/socket";

interface Match {
  matchId: string;
  user: {
    id: string;
    name: string;
    age: number;
    carModel: string;
    imageUrl: string; // poate fi relativ ("/uploads/photos/abc.jpg") sau complet ("http://…")
  };
}

interface Message {
  id: string;
  from: string;
  text: string;
  matchId: string;
}

export default function ChatPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // unreadMessages: { [matchId]: lastMessageText }
  const [unreadMessages, setUnreadMessages] = useState<Record<string, string>>(
    {}
  );

  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId?: string }>();

  // Vom păstra socket într-un state pentru a-l folosi după ce știm matches
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [socket, setSocket] = useState<any>(null);

  // 1. Când componenta montează, luăm socket-ul și așteptăm evenimentul "connect"
  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    // Așteptăm să se conecteze înainte să încărcăm match-urile
    s.on("connect", () => {
      console.log("✅ Socket conectat cu id-ul:", s.id);

      // După ce s-a conectat, încărcăm lista de match-uri
      api
        .get<Match[]>("/matches")
        .then((res) => {
          setMatches(res.data);
        })
        .catch((err) => {
          console.error("Eroare la încărcarea match-urilor:", err);
          setMatches([]);
        })
        .finally(() => {
          setLoading(false);
        });
    });

    s.on("disconnect", (reason: string) => {
      console.log("⚠️ Socket deconectat:", reason);
    });

    return () => {
      s.off("connect");
      s.off("disconnect");
    };
  }, []);

  // 2. După ce matches sunt încărcate și socket e conectat, dăm joinRoom pentru fiecare matchId
  useEffect(() => {
    if (!socket || !socket.connected) return;
    if (matches.length === 0) return;

    matches.forEach((match) => {
      console.log("🔷 Emit joinRoom pentru:", match.matchId);
      socket.emit("joinRoom", match.matchId);
    });
  }, [socket, matches]);

  // 3. Ascultăm mesajele primite și actualizăm unreadMessages
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: Message) => {
      console.log("🔴 receiveMessage primit:", msg);
      // Dacă mesajul nu e în chat-ul curent, îl marcăm unread
      if (msg.matchId !== matchId) {
        setUnreadMessages((prev) => {
          const updated = { ...prev, [msg.matchId]: msg.text };
          console.log("📝 unreadMessages actualizat:", updated);
          return updated;
        });
      }
    };

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [socket, matchId]);

  // 4. Helper pentru a construi URL-ul absolut al pozei
  const getPhotoUrl = (photo: string) => {
    if (photo.startsWith("http")) {
      return photo;
    }
    return `${import.meta.env.VITE_API_URL}${photo}`;
  };

  // 5. Dacă suntem în loading, afișăm un spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">
            Se încarcă conversațiile...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ┌──────────────┬──────────────────────────────────────────────┐ */}
      {/* │   SIDEBAR    │                    CHAT AREA                │ */}
      {/* └──────────────┴──────────────────────────────────────────────┘ */}

      {/* ===== Coloana stângă: lista de match-uri ===== */}
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-pink-100 rounded-2xl shadow-sm">
              <FaComments className="text-pink-500 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Conversații</h2>
              <p className="text-gray-600 text-sm">
                {matches.length} match-uri active
              </p>
            </div>
          </div>

          {matches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FaHeart className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Niciun match încă
              </h3>
              <p className="text-gray-500 mb-4">
                Începe să explorezi și să dai like pentru a găsi match-uri!
              </p>
              <button
                onClick={() => navigate("/discover")}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <FaSearch className="inline mr-2" />
                Descoperă persoane
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {matches.map((match, index) =>
                match.user ? (
                  <motion.div
                    key={match.matchId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      relative
                      flex items-center space-x-4 p-4 rounded-2xl cursor-pointer transition-all duration-300
                      ${
                        match.matchId === matchId
                          ? "bg-pink-50 border-2 border-pink-200 text-gray-800 shadow-md"
                          : "bg-white hover:bg-gray-50 shadow-sm hover:shadow-md"
                      }
                    `}
                    onClick={() => {
                      // Când intrăm în chat, ștergem unread pentru acest match
                      navigate(`/chat/${match.matchId}`, {
                        state: { otherUserName: match.user.name },
                      });
                      setUnreadMessages((prev) => {
                        const newObj = { ...prev };
                        delete newObj[match.matchId];
                        console.log(
                          "🗑️ Am șters unread pentru",
                          match.matchId,
                          "→",
                          newObj
                        );
                        return newObj;
                      });
                    }}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <img
                        src={
                          match.user.imageUrl
                            ? getPhotoUrl(match.user.imageUrl)
                            : "https://ui-avatars.com/api/?name=" +
                              encodeURIComponent(match.user.name || "User")
                        }
                        alt={match.user.name || "User"}
                        className={`w-14 h-14 rounded-full object-cover border-3 transition-all
                          ${
                            match.matchId === matchId
                              ? "border-white shadow-lg"
                              : "border-pink-200 group-hover:border-pink-300"
                          }`}
                      />
                      {/* Dacă există mesaj unread pentru acest match */}
                      {unreadMessages[match.matchId] && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                        >
                          <span className="text-white text-xs font-bold">
                            !
                          </span>
                        </motion.span>
                      )}
                    </div>

                    {/* Nume și info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-lg font-semibold truncate
                        ${
                          match.matchId === matchId
                            ? "text-pink-700"
                            : "text-gray-800"
                        }
                      `}
                      >
                        {match.user.name}, {match.user.age}
                      </div>
                      <div
                        className={`text-sm truncate
                        ${
                          match.matchId === matchId
                            ? "text-pink-600"
                            : "text-gray-600"
                        }
                      `}
                      >
                        🚗 {match.user.carModel}
                      </div>
                      {/* Afișăm snippet dacă există mesaj unread */}
                      {unreadMessages[match.matchId] && (
                        <div
                          className={`mt-1 text-sm italic truncate
                          ${
                            match.matchId === matchId
                              ? "text-pink-500"
                              : "text-pink-600"
                          }
                        `}
                        >
                          "{unreadMessages[match.matchId]}"
                        </div>
                      )}
                    </div>

                    {/* Match indicator */}
                    {match.matchId === matchId && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <FaHeart className="text-pink-500 text-lg" />
                      </motion.div>
                    )}
                  </motion.div>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== Coloana dreaptă: chat-ul efectiv sau mesaj placeholder ===== */}
      <div className="flex-1 flex flex-col bg-white">
        {matchId ? (
          <Outlet />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center bg-gray-50"
          >
            <div className="text-center max-w-md mx-auto p-8">
              <div className="p-6 bg-pink-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-sm">
                <FaComments className="text-pink-500 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Selectează o conversație
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Alege un match din lista din stânga pentru a începe să vorbești
                și să vă cunoașteți mai bine!
              </p>
              {matches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 p-4 bg-white rounded-xl shadow-lg border border-pink-200"
                >
                  <div className="flex items-center justify-center space-x-2 text-pink-600">
                    <FaUsers className="text-lg" />
                    <span className="font-semibold">
                      {matches.length}{" "}
                      {matches.length === 1
                        ? "conversație disponibilă"
                        : "conversații disponibile"}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
