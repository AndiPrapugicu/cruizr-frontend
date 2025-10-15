import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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
  const [blockedError, setBlockedError] = useState("");

  // ===== 6. DARK MODE & LIMBĂ =====
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "ro"
  );

  // ==== FETCH NOTIF & BLOCAȚI ON-MOUNT ====
  useEffect(() => {
    (async () => {
      // Notificări
      try {
        const resNotif = await api.get<{
          swipe: boolean;
          likes: boolean;
          messages: boolean;
        }>("/users/me/notifications");
        setNotifySwipe(resNotif.data.swipe);
        setNotifyLikes(resNotif.data.likes);
        setNotifyMessages(resNotif.data.messages);
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
        setBlockedError("Could not load blocked list.");
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
    } catch (err: any) {
      setAccountError(err.response?.data?.message || "Error updating email.");
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
    } catch (err: any) {
      setAccountError(
        err.response?.data?.message || "Error changing password."
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
    } catch (err) {
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
    try {
      await api.patch("/users/me/preferences", {
        minAge: prefMinAge,
        maxAge: prefMaxAge,
        distance: prefDistance,
        preferredCarBrand: prefCarBrand,
      });
      alert("Preferences saved successfully.");
    } catch (err: any) {
      setPrefsError(err.response?.data?.message || "Error saving preferences.");
    }
  };

  // 5) Salvare notificări
  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifError("");
    try {
      await api.patch("/users/me/notifications", {
        swipe: notifySwipe,
        likes: notifyLikes,
        messages: notifyMessages,
      });
      alert("Notification settings saved.");
    } catch (err: any) {
      setNotifError(
        err.response?.data?.message || "Error saving notifications."
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
  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem("darkMode", newVal.toString());
    document.documentElement.classList.toggle("dark", newVal);
  };

  // 8) Schimbă limbă
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    // eventual rerender/refresh text
  };

  // ===== RENDER PRINCIPAL =====
  if (loadingUser) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="w-full h-full p-8 bg-white overflow-y-auto">
      <div className="max-w-4xl space-y-8">
        {/* ─────────── 1. ACCOUNT INFO ─────────── */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Account Information
          </h2>

          {/* Change Email */}
          <form onSubmit={handleEmailChange} className="mb-6">
            <label className="block mb-1 text-gray-900 dark:text-gray-100">
              Current email: {userData?.email}
            </label>
            <input
              type="email"
              placeholder="New email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-700 rounded placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
            >
              Save Email
            </button>
          </form>

          {/* Change Password */}
          <form onSubmit={handlePasswordChange} className="mb-6">
            <label className="block mb-1 text-gray-900 dark:text-gray-100">
              Change password:
            </label>
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-700 rounded placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-700 rounded placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-700 rounded placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
            >
              Change Password
            </button>
          </form>

          {accountError && <p className="text-red-500">{accountError}</p>}

          {/* Delete Account */}
          <button
            onClick={handleDeleteAccount}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
          >
            Delete Account
          </button>
        </section>

        {/* ─────────── 2. PARTNER PREFERENCES ─────────── */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Partner Preferences
          </h2>
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-900 dark:text-gray-100">
                Interval vârstă:
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min={18}
                  max={prefMaxAge}
                  value={prefMinAge}
                  onChange={(e) => setPrefMinAge(Number(e.target.value))}
                  className="w-1/2 p-2 border border-gray-300 dark:border-gray-700 rounded placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                  placeholder="Minim"
                />
                <input
                  type="number"
                  min={prefMinAge}
                  max={100}
                  value={prefMaxAge}
                  onChange={(e) => setPrefMaxAge(Number(e.target.value))}
                  className="w-1/2 p-2 border border-gray-300 dark:border-gray-700 rounded placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                  placeholder="Maxim"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-gray-900 dark:text-gray-100">
                Distanță maximă (km):
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={prefDistance}
                onChange={(e) => setPrefDistance(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-900 dark:text-gray-100">
                Brand auto preferat:
              </label>
              <input
                type="text"
                placeholder="Ex: BMW, Toyota"
                value={prefCarBrand}
                onChange={(e) => setPrefCarBrand(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
            >
              Salvează Preferințe
            </button>
          </form>
          {prefsError && <p className="text-red-500">{prefsError}</p>}
        </section>

        {/* ─────────── 3. NOTIFICĂRI ─────────── */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Notificări
          </h2>
          {loadingNotif ? (
            <p className="text-gray-900 dark:text-gray-100">Loading...</p>
          ) : (
            <form onSubmit={handleSaveNotifications} className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifySwipe}
                  onChange={(e) => setNotifySwipe(e.target.checked)}
                  className="mr-2"
                />
                <label className="text-gray-900 dark:text-gray-100">
                  Notificări swipe
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifyLikes}
                  onChange={(e) => setNotifyLikes(e.target.checked)}
                  className="mr-2"
                />
                <label className="text-gray-900 dark:text-gray-100">
                  Notificări like-uri
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifyMessages}
                  onChange={(e) => setNotifyMessages(e.target.checked)}
                  className="mr-2"
                />
                <label className="text-gray-900 dark:text-gray-100">
                  Notificări mesaje
                </label>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
              >
                Salvează Notificări
              </button>
            </form>
          )}
          {notifError && <p className="text-red-500">{notifError}</p>}
        </section>

        {/* ─────────── 4. UTILIZATORI BLOCAȚI ─────────── */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Utilizatori blocați
          </h2>
          {loadingBlocked ? (
            <p className="text-gray-900 dark:text-gray-100">Loading...</p>
          ) : blockedUsers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Nu ai blocat niciun utilizator.
            </p>
          ) : (
            <ul className="space-y-3">
              {blockedUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {u.imageUrl ? (
                      <img
                        src={u.imageUrl}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        ?
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {u.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mașină: {u.carModel}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(u.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition text-sm"
                  >
                    Deblochează
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mb-4"
        >
          Deconectează-te
        </button>
      </div>
    </div>
  );
}
