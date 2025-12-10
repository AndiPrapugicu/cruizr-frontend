// socket.ts

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  if (!socket) {
    socket = io(apiUrl, {
      auth: { token },
      transports: ["websocket", "polling"], // Allow fallback to polling
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ Socket connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected us, try to reconnect
        socket?.connect();
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("✅ Socket reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_error", (err) => {
      console.warn("⚠️ Socket reconnection error:", err.message);
    });
  }

  // Ensure socket is connected
  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

// Force reconnect the socket (useful when token changes or manual refresh needed)
export function reconnectSocket(): Socket {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return getSocket();
}

// Disconnect and cleanup socket
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
