import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";

// Initialize Eruda for mobile debugging
// Add ?debug=true to URL to enable on production
const shouldEnableEruda = import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug') === 'true';

if (shouldEnableEruda) {
  import('eruda').then((eruda) => eruda.default.init());
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
