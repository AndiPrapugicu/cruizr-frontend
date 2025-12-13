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
import { useTheme } from "../contexts/ThemeContext";

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
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [otherProfile, setOtherProfile] = useState<UserProfile | null>(null);
  const [reporting, setReporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Get the username that matches what backend sends (from JWT payload)
  const currentUserName = user.name || user.email || "";

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
      alert("The user has been reported and the match has been blocked.");
      // Poți redirecționa sau închide chat-ul aici, dacă vrei
    } catch (err) {
      console.error("Error reporting:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div 
      className={`flex flex-col w-full h-full ${theme === 'dark' ? 'bg-slate-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}
    >
      {/* ==== Header-ul cu avatar, nume, mașină și buton Raportează ==== */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex-shrink-0 flex items-center justify-between py-3 px-3 sm:px-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border-b shadow-sm`}
      >
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          {/* Back Button */}
          <button
            onClick={() => navigate("/chat")}
            className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0`}
          >
            <FaArrowLeft className="text-base sm:text-lg" />
          </button>

          {/* Avatar */}
          <div className="relative shrink-0">
            {otherProfile?.avatarUrl ? (
              <img
                src={avatarSrc || ""}
                alt={`Avatar ${otherUserName}`}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 ${theme === 'dark' ? 'border-blue-400' : 'border-pink-200'} shadow-sm`}
              />
            ) : (
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${theme === 'dark' ? 'bg-slate-700 border-blue-400' : 'bg-gray-100 border-pink-200'} flex items-center justify-center border-2 shadow-sm`}>
                <FaUserCircle className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} text-lg sm:text-xl`} />
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            {/* Numele userului */}
            <h1 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} truncate flex items-center`}>
              {otherUserName}
              <FaHeart className={`ml-1.5 sm:ml-2 ${theme === 'dark' ? 'text-blue-400' : 'text-pink-400'} text-xs sm:text-sm shrink-0`} />
            </h1>
            {/* Mașina */}
            {otherProfile?.car && (
              <div className={`flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs sm:text-sm`}>
                <FaCar className="mr-1 shrink-0" />
                <span className="truncate">{otherProfile.car}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full transition-colors duration-200 relative`}
          >
            <FaEllipsisV className="text-base" />

            {/* Dropdown Menu */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className={`absolute right-0 top-full mt-2 w-48 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-xl shadow-xl border z-50`}
              >
                <button
                  onClick={handleReport}
                  disabled={reporting}
                  className={`w-full px-4 py-3 text-left text-red-500 ${theme === 'dark' ? 'hover:bg-red-900/30' : 'hover:bg-red-50'} rounded-xl transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50`}
                >
                  <FaFlag className="text-sm" />
                  <span className="font-medium">
                    {reporting ? "Reporting..." : "Report user"}
                  </span>
                </button>
              </motion.div>
            )}
          </button>
        </div>
      </motion.div>

      {/* ==== Zona de mesaje ==== */}
      <div 
        className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-b from-gray-50 to-white'}`} 
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-12"
          >
            <div className={`p-3 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'} rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center shadow-sm`}>
              <FaHeart className={`${theme === 'dark' ? 'text-blue-400' : 'text-pink-500'} text-xl`} />
            </div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} mb-2`}>
              Start the conversation!
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} italic`}>
              Say "Hi!" to start a nice conversation 💕
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, index) => {
            const isMe = msg.from === currentUserName;
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
                      ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-pink-500'} text-white rounded-2xl rounded-br-md shadow-md`
                      : `${theme === 'dark' ? 'bg-slate-700 text-gray-100 border-slate-600' : 'bg-white text-gray-800 border-gray-200'} shadow-sm rounded-2xl rounded-bl-md border`
                  }
                `}
                >
                  {!isMe && (
                    <div className={`font-semibold text-sm mb-1 ${theme === 'dark' ? 'text-blue-400' : 'text-pink-600'}`}>
                      {msg.from}
                    </div>
                  )}
                  <div className="leading-relaxed">{msg.text}</div>

                  {/* Message tail */}
                  {isMe ? (
                    <div className={`absolute -right-1 bottom-0 w-0 h-0 border-l-[12px] ${theme === 'dark' ? 'border-l-blue-600' : 'border-l-pink-500'} border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent`}></div>
                  ) : (
                    <div className={`absolute -left-1 bottom-0 w-0 h-0 border-r-[12px] ${theme === 'dark' ? 'border-r-slate-700' : 'border-r-white'} border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent`}></div>
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
        className={`flex-shrink-0 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-t shadow-lg p-3 sm:p-4`}
      >
        <div className="flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto">
          <div className="flex-1 min-w-0 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full p-3 sm:p-4 pr-10 sm:pr-12 border-2 ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20' : 'border-gray-200 text-gray-800 placeholder-gray-500 focus:border-pink-500 focus:ring-pink-500/20'} rounded-2xl focus:outline-none focus:ring-2 transition-all duration-200 text-base`}
              placeholder="Write a message..."
            />
            {input.trim() && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              >
                <FaHeart className={`${theme === 'dark' ? 'text-blue-400' : 'text-pink-500'} text-lg`} />
              </motion.div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className={`flex-shrink-0 p-3 sm:p-4 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-500 hover:bg-pink-600'} text-white rounded-2xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14`}
          >
            <FaPaperPlane className="text-base sm:text-lg" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
