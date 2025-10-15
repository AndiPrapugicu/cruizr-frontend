// socket.ts

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  const token = localStorage.getItem("token");

  if (!socket) {
    socket = io("http://localhost:3000", {
      auth: { token },
      transports: ["websocket"],
    });

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect_error", (err) => {
      console.warn("Eroare la conectarea cu WebSocket:", err.message);
    });
  }

  return socket;
}
