// src/components/Chat.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaFlag,
  FaPaperPlane,
  FaHeart,
  FaCar,
  FaUserCircle,
  FaEllipsisV,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../services/socket";
import api from "../services/api";

interface Message {
  id: string;
  from: string;
  text: string;
  matchId: string;
}

interface UserProfile {
  avatarUrl: string;
  car: string;
}

export default function Chat({
  matchId,
  otherUserName,
}: {
  matchId: string;
  otherUserName: string;
}) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [otherProfile, setOtherProfile] = useState<UserProfile | null>(null);
  const [reporting, setReporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const baseUrl = "http://localhost:3000";

  const avatarSrc = otherProfile?.avatarUrl
    ? otherProfile.avatarUrl.startsWith("http")
      ? otherProfile.avatarUrl
      : `${baseUrl}${otherProfile.avatarUrl}`
    : null;

  // 1. Fetch istoric mesaje + socket
  useEffect(() => {
    const socket = getSocket();
    socket.emit("joinRoom", matchId);

    socket.on("receiveMessage", (msg: Message) => {
      if (msg.matchId === matchId) {
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
        );
      }
    });

    api.get(`/chat/history/${matchId}`).then((res) => {
      setMessages(res.data);
    });

    return () => {
      socket.off("receiveMessage");
      socket.emit("leaveRoom", matchId);
    };
  }, [matchId]);

  // 2. Scroll către cel mai recent mesaj
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Fetch profil celuilalt user (avatar + mașină)
  useEffect(() => {
    api
      .get<UserProfile>(`/users/${otherUserName}`)
      .then((res) => {
        setOtherProfile(res.data);
      })
      .catch((err) => {
        console.warn("Nu am putut încărca profilul celuilalt user:", err);
      });
  }, [otherUserName]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = {
      text: input.trim(),
      matchId,
    };
    getSocket().emit("sendMessage", msg);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  // 4. Funcție de raportare a match-ului / userului
  const handleReport = async () => {
    if (reporting) return;
    setReporting(true);
    try {
      await api.post(`/matches/${matchId}/report`);
      alert("Utilizatorul a fost raportat și match-ul blocat.");
      // Poți redirecționa sau închide chat-ul aici, dacă vrei
    } catch (err) {
      console.error("Eroare la raportare:", err);
      alert("A apărut o eroare. Te rugăm să încerci din nou.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-white text-gray-900">
      {/* ==== Header-ul cu avatar, nume, mașină și buton Raportează ==== */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between py-4 px-6 bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="flex items-center space-x-4">
          {/* Back Button */}
          <button
            onClick={() => navigate("/chat")}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          {/* Avatar */}
          <div className="relative">
            {otherProfile?.avatarUrl ? (
              <img
                src={avatarSrc || ""}
                alt={`Avatar ${otherUserName}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-pink-200 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-pink-200 shadow-sm">
                <FaUserCircle className="text-gray-400 text-xl" />
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>

          <div className="flex flex-col min-w-0">
            {/* Numele userului */}
            <h1 className="text-lg font-semibold text-gray-800 truncate flex items-center">
              {otherUserName}
              <FaHeart className="ml-2 text-pink-400 text-sm" />
            </h1>
            {/* Mașina */}
            {otherProfile?.car && (
              <div className="flex items-center text-gray-500 text-sm">
                <FaCar className="mr-1" />
                <span className="truncate">{otherProfile.car}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 relative"
          >
            <FaEllipsisV className="text-base" />

            {/* Dropdown Menu */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
              >
                <button
                  onClick={handleReport}
                  disabled={reporting}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <FaFlag className="text-sm" />
                  <span className="font-medium">
                    {reporting ? "Se raportează..." : "Raportează utilizatorul"}
                  </span>
                </button>
              </motion.div>
            )}
          </button>
        </div>
      </motion.div>

      {/* ==== Zona de mesaje ==== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-12"
          >
            <div className="p-3 bg-pink-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center shadow-sm">
              <FaHeart className="text-pink-500 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Începeți conversația!
            </h3>
            <p className="text-gray-500 italic">
              Spuneți "Salut!" pentru a porni o conversație frumoasă 💕
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, index) => {
            const isMe = msg.from === user.name;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className={`flex w-full ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`
                  relative
                  px-4 py-3
                  break-words
                  max-w-[80%] sm:max-w-[60%]
                  ${
                    isMe
                      ? "bg-pink-500 text-white rounded-2xl rounded-br-md shadow-sm"
                      : "bg-white text-gray-800 shadow-sm rounded-2xl rounded-bl-md border border-gray-200"
                  }
                `}
                >
                  {!isMe && (
                    <div className="font-semibold text-sm mb-1 text-pink-600">
                      {msg.from}
                    </div>
                  )}
                  <div className="leading-relaxed">{msg.text}</div>

                  {/* Message tail */}
                  {isMe ? (
                    <div className="absolute -right-1 bottom-0 w-0 h-0 border-l-[12px] border-l-pink-500 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                  ) : (
                    <div className="absolute -left-1 bottom-0 w-0 h-0 border-r-[12px] border-r-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ==== Zona de input ==== */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 bg-white border-t border-gray-200 shadow-lg"
      >
        <div className="flex items-end space-x-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-gray-800 placeholder-gray-500 transition-all duration-200"
              placeholder="Scrie un mesaj..."
            />
            {input.trim() && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <FaHeart className="text-pink-500 text-lg" />
              </motion.div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[56px]"
          >
            <FaPaperPlane className="text-lg" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
