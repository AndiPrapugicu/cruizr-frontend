// src/components/ChatPage.tsx

import { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHeart, FaSearch, FaUsers, FaComments, FaSync } from "react-icons/fa";
import api from "../services/api";
import { getSocket, reconnectSocket } from "../services/socket";
import { useTheme } from "../contexts/ThemeContext";

interface Match {
  matchId: string;
  user: {
    id: string;
    name: string;
    age: number;
    carModel: string;
    imageUrl: string; // can be relative ("/uploads/photos/abc.jpg") or absolute ("http://…")
  };
}

interface Message {
  id: string;
  from: string;
  text: string;
  matchId: string;
}

export default function ChatPage() {
  const { theme } = useTheme();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // unreadMessages: { [matchId]: lastMessageText }
  const [unreadMessages, setUnreadMessages] = useState<Record<string, string>>(
    {}
  );

  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId?: string }>();

  // Socket state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [socket, setSocket] = useState<any>(null);

  // Function to load matches
  const loadMatches = useCallback(async () => {
    try {
      const res = await api.get<Match[]>("/matches");
      setMatches(res.data);
    } catch (err) {
      console.error("Error loading matches:", err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to handle manual reconnect
  const handleReconnect = useCallback(() => {
    setConnectionStatus('connecting');
    setLoading(true);
    const newSocket = reconnectSocket();
    setSocket(newSocket);
  }, []);

  // 1. Initialize socket and handle connection events
  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const handleConnect = () => {
      console.log("✅ Socket connected:", s.id);
      setConnectionStatus('connected');
      loadMatches();
    };

    const handleDisconnect = (reason: string) => {
      console.log("⚠️ Socket disconnected:", reason);
      setConnectionStatus('disconnected');
    };

    const handleReconnectAttempt = () => {
      console.log("🔄 Attempting to reconnect...");
      setConnectionStatus('connecting');
    };

    const handleReconnectSuccess = () => {
      console.log("✅ Socket reconnected successfully");
      setConnectionStatus('connected');
      loadMatches(); // Reload matches after reconnection
    };

    // If already connected, load matches immediately
    if (s.connected) {
      handleConnect();
    }

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("reconnect_attempt", handleReconnectAttempt);
    s.on("reconnect", handleReconnectSuccess);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("reconnect_attempt", handleReconnectAttempt);
      s.off("reconnect", handleReconnectSuccess);
    };
  }, [loadMatches]);

  // 2. Join rooms for each match when socket is connected
  useEffect(() => {
    if (!socket || !socket.connected) return;
    if (matches.length === 0) return;

    matches.forEach((match) => {
      console.log("🔷 Joining room:", match.matchId);
      socket.emit("joinRoom", match.matchId);
    });
  }, [socket, matches]);

  // 3. Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: Message) => {
      console.log("🔴 Message received:", msg);
      // Mark as unread if not in current chat
      if (msg.matchId !== matchId) {
        setUnreadMessages((prev) => {
          const updated = { ...prev, [msg.matchId]: msg.text };
          console.log("📝 Unread messages updated:", updated);
          return updated;
        });
      }
    };

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [socket, matchId]);

  // 4. Helper to build absolute photo URL
  const getPhotoUrl = (photo: string) => {
    if (!photo) return "";
    if (photo.startsWith("http")) {
      return photo;
    }
    return `${import.meta.env.VITE_API_URL}${photo}`;
  };

  // 5. Show loading spinner
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
            Loading conversations...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Connection status indicator */}
      {connectionStatus === 'disconnected' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center z-50 flex items-center justify-center gap-2"
        >
          <span>Connection lost.</span>
          <button
            onClick={handleReconnect}
            className="bg-white text-yellow-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-yellow-50 flex items-center gap-1"
          >
            <FaSync className="text-xs" />
            Reconnect
          </button>
        </motion.div>
      )}

      {connectionStatus === 'connecting' && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 bg-blue-500 text-white px-4 py-2 text-center z-50"
        >
          <span className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
            Connecting...
          </span>
        </motion.div>
      )}

      {/* ┌──────────────┬──────────────────────────────────────────────┐ */}
      {/* │   SIDEBAR    │                    CHAT AREA                │ */}
      {/* └──────────────┴──────────────────────────────────────────────┘ */}

      {/* ===== Coloana stângă: lista de match-uri ===== */}
      <div className={`w-full md:w-1/3 border-r overflow-y-auto shadow-sm pb-24 md:pb-0 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} ${
        matchId ? 'hidden md:block' : 'block'
      }`}>
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-pink-100 rounded-2xl shadow-sm">
              <FaComments className="text-pink-500 text-lg sm:text-xl" />
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Conversations</h2>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {matches.length} active matches
              </p>
            </div>
          </div>

          {matches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 sm:py-12 px-4"
            >
              <div className={`p-3 sm:p-4 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'} rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center`}>
                <FaHeart className="text-gray-400 text-xl sm:text-2xl" />
              </div>
              <h3 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                No matches yet
              </h3>
              <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                Start exploring and liking to find matches!
              </p>
              <button
                onClick={() => navigate("/nearby")}
                className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                <FaSearch className="inline mr-2" />
                Discover people
              </button>
            </motion.div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
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
                          : theme === 'dark' ? "bg-slate-700 hover:bg-slate-600 shadow-sm hover:shadow-md" : "bg-white hover:bg-gray-50 shadow-sm hover:shadow-md"
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

      {/* ===== Right column: chat or placeholder ===== */}
      <div className={`flex-1 flex flex-col ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} ${
        !matchId ? 'hidden md:flex' : 'flex'
      }`}>
        {matchId ? (
          <Outlet />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex-1 flex flex-col items-center justify-center px-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}
          >
            <div className="text-center max-w-md mx-auto p-4 sm:p-8">
              <div className="p-4 sm:p-6 bg-pink-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-sm">
                <FaComments className="text-pink-500 text-xl sm:text-2xl" />
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} mb-2 sm:mb-3`}>
                Selectează o conversație
              </h3>
              <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                Alege un match din lista din stânga pentru a începe să vorbești
                și să vă cunoașteți mai bine!
              </p>
              {matches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`mt-6 p-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-200'} rounded-xl shadow-lg border`}
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
