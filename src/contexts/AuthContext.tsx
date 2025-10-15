import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

interface User {
  userId: number;
  email: string;
  name: string;
  imageUrl?: string;
  isVip?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const decoded = jwtDecode<JwtPayload>(token);

          // Check if token is expired
          if (decoded.exp * 1000 > Date.now()) {
            setUser({
              userId: decoded.sub,
              email: decoded.email,
              name: decoded.name,
            });
            setIsAuthenticated(true);

            // Set token for API requests
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            // Fetch additional user data
            try {
              const userRes = await api.get("/users/me");

              setUser((prev) => (prev ? { ...prev, ...userRes.data } : null));
            } catch (err) {
              console.error("❌ AuthProvider: Failed to fetch user data:", err);
              // If token is invalid, clear it
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            // Token expired
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } else {
        }
      } catch (error) {
        console.error("❌ AuthProvider: Auth initialization error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.access_token;

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const decoded = jwtDecode<JwtPayload>(token);
      const userData = {
        userId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      // Fetch additional user data
      try {
        const userRes = await api.get("/users/me");
        setUser((prev) => (prev ? { ...prev, ...userRes.data } : null));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
