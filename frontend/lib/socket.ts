import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(backendUrl?: string): Socket {
  if (socket?.connected) return socket;

  const url =
    backendUrl ||
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    "";

  socket = io(url, {
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionAttempts: Infinity,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket.IO connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket.IO disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("🔌 Socket.IO error:", error.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
