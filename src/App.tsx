import "./App.css";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  const { user } = useAuth();

  // Pages that don't need sidebar (auth pages)
  const authPages = ["/login", "/register", "/onboarding"];
  const isAuthPage = authPages.includes(window.location.pathname);

  return (
    <div className="w-screen h-screen overflow-auto bg-white">
      <BrowserRouter>
        <PowerUpProvider>
          <NotificationProvider>
            {user && !isAuthPage ? (
              // Authenticated layout with sidebar
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
            ) : (
              // Unauthenticated routes
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
              </Routes>
            )}
          </NotificationProvider>
        </PowerUpProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
