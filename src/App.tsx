import "./App.css";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Sidebar from "./components/Sidebar";
import Nearby from "./pages/Nearby";
import ChatWrapper from "./pages/ChatWrapper";
import Likes from "./pages/Likes";
import ChatPage from "./pages/ChatPage";
import RevMatch from "./pages/RevMatch";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import OnboardingPage from "./pages/OnboardingPage";
import Badges from "./pages/Badges";
import EditProfile from "./pages/EditProfile";
import Polls from "./pages/Polls";
import EnterpriseStore from "./components/EnterpriseStore";
import { useAuth } from "./contexts/AuthContext";
import { PowerUpProvider } from "./contexts/PowerUpContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

function AppContent() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className={`w-screen h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-pink-50 via-red-50 to-orange-50'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  // Pages that don't need sidebar (auth pages)
  const authPages = ["/login", "/register"];
  const isAuthPage = authPages.includes(window.location.pathname);

  // Check if user needs to complete onboarding
  const needsOnboarding = user && !user.onboardingCompleted;

  return (
    <div className={`w-screen h-screen overflow-auto transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
      <BrowserRouter>
        <PowerUpProvider>
          <NotificationProvider>
            {user && !isAuthPage ? (
              needsOnboarding ? (
                // User is authenticated but hasn't completed onboarding
                <Routes>
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="*" element={<Navigate to="/onboarding" replace />} />
                </Routes>
              ) : (
                // Authenticated layout with sidebar (onboarding completed)
                <Sidebar>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/chat/:matchId" element={<ChatWrapper />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/nearby" element={<Nearby />} />
                    <Route path="/likes" element={<Likes />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/revmatch" element={<RevMatch />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/store" element={<EnterpriseStore />} />
                    <Route path="/badges" element={<Badges />} />
                    <Route path="/polls" element={<Polls />} />
                    <Route path="/profile/edit" element={<EditProfile />} />
                  </Routes>
                </Sidebar>
              )
            ) : (
              // Unauthenticated routes
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Redirect unauthenticated users trying to access onboarding */}
                <Route path="/onboarding" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            )}
          </NotificationProvider>
        </PowerUpProvider>
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
