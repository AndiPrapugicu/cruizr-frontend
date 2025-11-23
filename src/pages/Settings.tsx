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
} from "react-icons/fa";
import { Globe, Crown, Sparkles } from "lucide-react";

// Tipurile pentru datele din server
interface UserData {
  id: number;
  name: string;
  email: string;
  carModel: string;
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
  const [loadingPrefs, setLoadingPrefs] = useState(true);

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
      } finally {
        setLoadingPrefs(false);
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
      setPrefsError("Funcția Worldwide este disponibilă doar pentru utilizatorii VIP!");
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
      <div className="flex items-center justify-center w-full h-full bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Setări</h1>
          <p className="text-gray-600 mt-1">Gestionează-ți contul și preferințele</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ─────────── 1. ACCOUNT INFO ─────────── */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
            <FaUser className="mr-3 text-pink-500" />
            Informații Cont
          </h2>

          {/* Change Email */}
          <form onSubmit={handleEmailChange} className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
              <FaEnvelope className="mr-2 text-gray-400" />
              Email curent: <span className="ml-2 text-pink-600 font-semibold">{userData?.email}</span>
            </label>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Email nou"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <FaSave />
                <span>Salvează</span>
              </button>
            </div>
          </form>

          {/* Change Password */}
          <form onSubmit={handlePasswordChange} className="mb-6">
            <label className="block mb-3 text-sm font-medium text-gray-700 flex items-center">
              <FaLock className="mr-2 text-gray-400" />
              Schimbă parola
            </label>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Parola curentă"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Parolă nouă"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Confirmă parola"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <FaLock />
                <span>Schimbă Parola</span>
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
              <span>Șterge Cont</span>
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Atenție: Această acțiune este permanentă și nu poate fi anulată.
            </p>
          </div>
        </motion.section>

        {/* ─────────── 2. PARTNER PREFERENCES ─────────── */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
            <FaHeart className="mr-3 text-pink-500" />
            Preferințe Partener
          </h2>
          <form onSubmit={handleSavePreferences} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
                <FaUser className="mr-2 text-gray-400" />
                Interval vârstă
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={18}
                  max={prefMaxAge}
                  value={prefMinAge}
                  onChange={(e) => setPrefMinAge(Number(e.target.value))}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Minim"
                />
                <input
                  type="number"
                  min={prefMinAge}
                  max={100}
                  value={prefMaxAge}
                  onChange={(e) => setPrefMaxAge(Number(e.target.value))}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Maxim"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {prefMinAge} - {prefMaxAge} ani
              </p>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-gray-400" />
                Distanță maximă: <span className="ml-2 text-pink-600 font-semibold flex items-center gap-1">
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
                        alert("Feature-ul Worldwide este disponibil doar pentru utilizatorii VIP!");
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
                        ? "Vezi utilizatori din toată lumea, fără limitări de distanță"
                        : "Upgrade la VIP pentru a vedea utilizatori din toată lumea"}
                    </p>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
                <FaCar className="mr-2 text-gray-400" />
                Brand auto preferat
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
              <span>Salvează Preferințe</span>
            </button>
          </form>
          {prefsError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{prefsError}</p>
            </div>
          )}
        </motion.section>

        {/* ─────────── 3. NOTIFICĂRI ─────────── */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
            <FaBell className="mr-3 text-pink-500" />
            Notificări
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
              <label className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySwipe}
                  onChange={(e) => setNotifySwipe(e.target.checked)}
                  className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500 mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Notificări swipe</p>
                  <p className="text-sm text-gray-500">Primește notificări când cineva dă swipe</p>
                </div>
              </label>
              <label className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyLikes}
                  onChange={(e) => setNotifyLikes(e.target.checked)}
                  className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500 mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Notificări like-uri</p>
                  <p className="text-sm text-gray-500">Primește notificări când cineva îți dă like</p>
                </div>
              </label>
              <label className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyMessages}
                  onChange={(e) => setNotifyMessages(e.target.checked)}
                  className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500 mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Notificări mesaje</p>
                  <p className="text-sm text-gray-500">Primește notificări pentru mesaje noi</p>
                </div>
              </label>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-2 mt-4"
              >
                <FaSave />
                <span>Salvează Notificări</span>
              </button>
            </form>
          )}
          {notifError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{notifError}</p>
            </div>
          )}
        </motion.section>

        {/* ─────────── 4. UTILIZATORI BLOCAȚI ─────────── */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
            <FaBan className="mr-3 text-pink-500" />
            Utilizatori blocați
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
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FaUserSlash className="text-4xl text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nu ai blocat niciun utilizator.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {blockedUsers.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center space-x-4">
                    {u.imageUrl ? (
                      <img
                        src={u.imageUrl}
                        alt={u.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaCar className="mr-1" />
                        {u.carModel}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(u.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition shadow-md hover:shadow-lg"
                  >
                    Deblochează
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
          className="bg-white p-6 shadow-lg"
        >
          <button
            onClick={handleLogout}
            className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold text-lg rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <FaSignOutAlt className="text-xl" />
            <span>Deconectează-te</span>
          </button>
        </motion.section>
      </div>
    </div>
  );
}
