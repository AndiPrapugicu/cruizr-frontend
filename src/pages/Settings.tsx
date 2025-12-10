import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaTrash,
  FaHeart,
  FaBell,
  FaBan,
  FaSignOutAlt,
  FaSave,
  FaMapMarkerAlt,
  FaCar,
  FaUserSlash,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { Globe, Crown } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

// Tipurile pentru datele din server
interface UserData {
  id: number;
  name: string;
  email: string;
  carModel: string;
  isVip?: boolean;
  // ... alte câmpuri relevante
}

interface BlockedUser {
  id: number;
  name: string;
  carModel: string;
  imageUrl?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // ===== 1. STATE PENTRU DATELE UTILIZATORULUI CURR. =====
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ASCULTĂM ÎN REGIM ON-MOUNT PENTRU A LUA DATELE DE LA "/users/me"
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<UserData>("/users/me");
        setUserData(res.data);
      } catch (err) {
        console.error("Eroare la încărcarea datelor user:", err);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  // ===== 2. STATE PENTRU SCHIMBAREA PAROLEI/EMAIL-ULUI =====
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountError, setAccountError] = useState("");

  // ==== 3. STATE PENTRU PREFERINȚE PARTENER =====
  const [prefMinAge, setPrefMinAge] = useState(18);
  const [prefMaxAge, setPrefMaxAge] = useState(100);
  const [prefDistance, setPrefDistance] = useState(20);
  const [prefCarBrand, setPrefCarBrand] = useState("");
  const [prefWorldwide, setPrefWorldwide] = useState(false);

  // EXISTĂ (SAU NU) UN ENDPOINT "/users/me/preferences"
  // Dacă nu, vom folosi PATCH /users/me pentru a salva preferințe în același DTO.
  const [prefsError, setPrefsError] = useState("");

  // ===== 4. STATE PENTRU NOTIFICĂRI =====
  const [notifySwipe, setNotifySwipe] = useState(false);
  const [notifyLikes, setNotifyLikes] = useState(false);
  const [notifyMessages, setNotifyMessages] = useState(false);
  const [notifError, setNotifError] = useState("");

  // PRESUPUNEM UN ENDPOINT GET/PUT "/users/me/notifications"
  const [loadingNotif, setLoadingNotif] = useState(true);

  // ===== 5. STATE PENTRU UTILIZATORII BLOCAȚI =====
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(true);
  // const [blockedError, setBlockedError] = useState("");

  // ===== 6. DARK MODE & LIMBĂ =====
  // const [darkMode, setDarkMode] = useState(
  //   () => localStorage.getItem("darkMode") === "true"
  // );
  // const [language, setLanguage] = useState(
  //   () => localStorage.getItem("language") || "ro"
  // );

  // ==== FETCH PREFERENCES, NOTIF & BLOCAȚI ON-MOUNT ====
  useEffect(() => {
    (async () => {
      // Preferințe
      try {
        const resPrefs = await api.get<{
          minAge: number;
          maxAge: number;
          distance: number;
          preferredCarBrand: string;
          worldwide: boolean;
        }>("/users/me/preferences");
        setPrefMinAge(resPrefs.data.minAge || 18);
        setPrefMaxAge(resPrefs.data.maxAge || 100);
        setPrefDistance(resPrefs.data.distance || 20);
        setPrefCarBrand(resPrefs.data.preferredCarBrand || "");
        setPrefWorldwide(resPrefs.data.worldwide || false);
      } catch (err) {
        console.warn("Nu am putut încărca preferințe:", err);
      }

      // Notificări
      try {
        const resNotif = await api.get<{
          emailNotifications: boolean;
          pushNotifications: boolean;
        }>("/users/me/notifications");
        setNotifySwipe(resNotif.data.emailNotifications);
        setNotifyLikes(resNotif.data.pushNotifications);
        setNotifyMessages(resNotif.data.emailNotifications);
      } catch (err) {
        console.warn("Nu am putut încărca notif:", err);
      } finally {
        setLoadingNotif(false);
      }

      // Blocați
      try {
        const resBlocked = await api.get<BlockedUser[]>("/users/me/blocked");
        setBlockedUsers(resBlocked.data);
      } catch (err) {
        console.warn("Eroare la încărcarea blocked users:", err);
        // setBlockedError("Could not load blocked list.");
      } finally {
        setLoadingBlocked(false);
      }
    })();
  }, []);

  // ===== FUNCȚII PENTRU SALVARE =====
  // 1) Schimbare email
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError("");
    if (!newEmail) {
      setAccountError("New email required.");
      return;
    }
    try {
      await api.patch("/users/me", { email: newEmail });
      setUserData((u) => (u ? { ...u, email: newEmail } : u));
      setNewEmail("");
      alert("Email updated successfully.");
    } catch (err) {
      setAccountError(
        (err as ApiError).response?.data?.message || "Error updating email."
      );
    }
  };

  // 2) Change password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setAccountError("Fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setAccountError("Passwords don't match.");
      return;
    }
    try {
      await api.post("/users/me/password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Password changed successfully.");
    } catch (err) {
      setAccountError(
        (err as ApiError).response?.data?.message || "Error changing password."
      );
    }
  };

  // 3) Delete account
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? All data will be lost."
      )
    )
      return;
    try {
      await api.delete(`/users/${userData?.id}`);

      // Clear token, localStorage etc.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/"); // or any other public page
    } catch {
      alert("Error deleting account. Try again.");
    }
  };

  // === LOGOUT ===
  const handleLogout = async () => {
    try {
      // (chiar dacă nu ai endpoint de logout, continuăm)
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // dacă salvezi și user separat
      navigate("/login");
      window.location.reload(); // << ADĂUGĂ ASTA CA SĂ FORCEZI RESETUL aplicației
    } catch (err) {
      console.warn("Eroare la logout:", err);
    }
  };

  // 4) Salvare preferințe partener
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsError("");
    
    // Check if user is VIP when trying to enable worldwide
    if (prefWorldwide && !userData?.isVip) {
      setPrefsError("The Worldwide feature is only available for VIP users!");
      return;
    }
    
    try {
      await api.patch("/users/me/preferences", {
        minAge: prefMinAge,
        maxAge: prefMaxAge,
        distance: prefDistance,
        preferredCarBrand: prefCarBrand,
        worldwide: prefWorldwide,
      });
      alert("Preferences saved successfully.");
    } catch (err) {
      setPrefsError(
        (err as ApiError).response?.data?.message || "Error saving preferences."
      );
    }
  };

  // 5) Salvare notificări
  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifError("");
    try {
      await api.patch("/users/me/notifications", {
        emailNotifications: notifySwipe,
        pushNotifications: notifyLikes,
      });
      alert("Notification settings saved.");
    } catch (err) {
      setNotifError(
        (err as ApiError).response?.data?.message || "Error saving notifications."
      );
    }
  };

  // 6) Deblocare user
  const handleUnblock = async (blockedId: number) => {
    try {
      await api.delete(`/users/${blockedId}/block`);
      setBlockedUsers((prev) => prev.filter((u) => u.id !== blockedId));
    } catch {
      alert("Error unblocking.");
    }
  };

  // 7) Toggle dark mode
  // const toggleDarkMode = () => {
  //   const newVal = !darkMode;
  //   setDarkMode(newVal);
  //   localStorage.setItem("darkMode", newVal.toString());
  //   document.documentElement.classList.toggle("dark", newVal);
  // };

  // 8) Schimbă limbă
  // const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const newLang = e.target.value;
  //   setLanguage(newLang);
  //   localStorage.setItem("language", newLang);
  //   // eventual rerender/refresh text
  // };

  // ===== RENDER PRINCIPAL =====
  if (loadingUser) {
    return (
      <div className={`flex items-center justify-center w-full h-full ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} overflow-y-auto transition-colors duration-300`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
          <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage your account and preferences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-24 md:pb-6 space-y-4 sm:space-y-6">
        {/* ─────────── 1. ACCOUNT INFO ─────────── */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} p-4 sm:p-6 shadow-lg rounded-lg`}
        >
          <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
            <FaUser className="mr-2 sm:mr-3 text-pink-500 text-lg sm:text-xl" />
            Account Information
          </h2>

          {/* Change Email */}
          <form onSubmit={handleEmailChange} className="mb-4 sm:mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center flex-wrap">
              <FaEnvelope className="mr-2 text-gray-400" />
              Current email: <span className="ml-2 text-pink-600 font-semibold break-all">{userData?.email}</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="New email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
              />
              <button
                type="submit"
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base whitespace-nowrap"
              >
                <FaSave />
                <span>Save</span>
              </button>
            </div>
          </form>

          {/* Change Password */}
          <form onSubmit={handlePasswordChange} className="mb-4 sm:mb-6">
            <label className="block mb-3 text-sm font-medium text-gray-700 flex items-center">
              <FaLock className="mr-2 text-gray-400" />
              Change password
            </label>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <FaLock />
                <span>Change Password</span>
              </button>
            </div>
          </form>

          {accountError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{accountError}</p>
            </div>
          )}

          {/* Delete Account */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-2"
            >
              <FaTrash />
              <span>Delete Account</span>
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Warning: This action is permanent and cannot be undone.
            </p>
          </div>
        </motion.section>

        {/* ─────────── 2. PARTNER PREFERENCES ─────────── */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} p-6 shadow-lg rounded-lg`}
        >
          <h2 className={`text-2xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
            <FaHeart className="mr-3 text-pink-500" />
            Partner Preferences
          </h2>
          <form onSubmit={handleSavePreferences} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
                <FaUser className="mr-2 text-gray-400" />
                Age range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={18}
                  max={prefMaxAge}
                  value={prefMinAge}
                  onChange={(e) => setPrefMinAge(Number(e.target.value))}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min={prefMinAge}
                  max={100}
                  value={prefMaxAge}
                  onChange={(e) => setPrefMaxAge(Number(e.target.value))}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Max"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {prefMinAge} - {prefMaxAge} years old
              </p>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-gray-400" />
                Maximum distance: <span className="ml-2 text-pink-600 font-semibold flex items-center gap-1">
                  {prefWorldwide ? (
                    <>
                      <Globe className="w-4 h-4" />
                      Worldwide
                    </>
                  ) : `${prefDistance} km`}
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={200}
                value={prefDistance}
                onChange={(e) => setPrefDistance(Number(e.target.value))}
                disabled={prefWorldwide}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              {/* VIP Worldwide Toggle */}
              <div className="mt-4 p-4 border-2 border-dashed rounded-lg" style={{ borderColor: userData?.isVip ? '#F59E0B' : '#D1D5DB' }}>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefWorldwide}
                    onChange={(e) => {
                      if (!userData?.isVip && e.target.checked) {
                        alert("The Worldwide feature is only available for VIP users!");
                        return;
                      }
                      setPrefWorldwide(e.target.checked);
                    }}
                    className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500 mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      Worldwide Search
                      {userData?.isVip ? (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          VIP
                        </span>
                      ) : (
                        <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-bold rounded">VIP Only</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {userData?.isVip 
                        ? "See users from all over the world, without distance limitations"
                        : "Upgrade to VIP to see users from all over the world"}
                    </p>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
                <FaCar className="mr-2 text-gray-400" />
                Preferred car brand
              </label>
              <input
                type="text"
                placeholder="Ex: BMW, Toyota"
                value={prefCarBrand}
                onChange={(e) => setPrefCarBrand(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-2"
            >
              <FaSave />
              <span>Save Preferences</span>
            </button>
          </form>
          {prefsError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{prefsError}</p>
            </div>
          )}
        </motion.section>

        {/* ─────────── 3. NOTIFICATIONS ─────────── */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} p-6 shadow-lg rounded-lg`}
        >
          <h2 className={`text-2xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
            <FaBell className="mr-3 text-pink-500" />
            Notifications
          </h2>
          {loadingNotif ? (
            <div className="flex justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <form onSubmit={handleSaveNotifications} className="space-y-4">
              <label className={`flex items-center p-4 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={notifySwipe}
                  onChange={(e) => setNotifySwipe(e.target.checked)}
                  className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500 mr-3"
                />
                <div className="flex-1">
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Swipe notifications</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Receive notifications when someone swipes</p>
                </div>
              </label>
              <label className={`flex items-center p-4 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={notifyLikes}
                  onChange={(e) => setNotifyLikes(e.target.checked)}
                  className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500 mr-3"
                />
                <div className="flex-1">
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Like notifications</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Receive notifications when someone likes you</p>
                </div>
              </label>
              <label className={`flex items-center p-4 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={notifyMessages}
                  onChange={(e) => setNotifyMessages(e.target.checked)}
                  className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500 mr-3"
                />
                <div className="flex-1">
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Message notifications</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Receive notifications for new messages</p>
                </div>
              </label>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-2 mt-4"
              >
                <FaSave />
                <span>Save Notifications</span>
              </button>
            </form>
          )}
          {notifError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{notifError}</p>
            </div>
          )}
        </motion.section>

        {/* ─────────── APPEARANCE / THEME ─────────── */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} p-6 shadow-lg rounded-lg`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
            {theme === 'dark' ? (
              <FaMoon className="mr-3 text-purple-400" />
            ) : (
              <FaSun className="mr-3 text-yellow-500" />
            )}
            Appearance
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Dark Mode
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 overflow-hidden ${
                theme === 'dark' 
                  ? 'bg-purple-600' 
                  : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: theme === 'dark' ? 26 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 left-0 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <FaMoon className="text-purple-600 text-[10px]" />
                ) : (
                  <FaSun className="text-yellow-500 text-[10px]" />
                )}
              </motion.div>
            </button>
          </div>
        </motion.section>

        {/* ─────────── 4. BLOCKED USERS ─────────── */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} p-6 shadow-lg`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
            <FaBan className="mr-3 text-pink-500" />
            Blocked Users
          </h2>
          {loadingBlocked ? (
            <div className="flex justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"
              />
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className={`text-center py-8 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg`}>
              <FaUserSlash className="text-4xl text-gray-400 mx-auto mb-3" />
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>You haven't blocked any users.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {blockedUsers.map((u) => (
                <li
                  key={u.id}
                  className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition`}
                >
                  <div className="flex items-center space-x-4">
                    {u.imageUrl ? (
                      <img
                        src={u.imageUrl}
                        alt={u.name}
                        className={`w-12 h-12 rounded-full object-cover border-2 ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{u.name}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} flex items-center`}>
                        <FaCar className="mr-1" />
                        {u.carModel}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(u.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition shadow-md hover:shadow-lg"
                  >
                    Unblock
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* ─────────── 5. LOGOUT ─────────── */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} p-6 shadow-lg rounded-lg`}
        >
          <button
            onClick={handleLogout}
            className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold text-lg rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <FaSignOutAlt className="text-xl" />
            <span>Log Out</span>
          </button>
        </motion.section>
      </div>
    </div>
  );
}
