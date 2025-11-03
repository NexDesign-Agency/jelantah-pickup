"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (socket?.connected) {
    return socket;
  }

  const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  socket = io(serverUrl, {
    path: "/api/socket",
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log("🔄 Socket reconnection attempt:", attemptNumber);
  });

  socket.on("reconnect_error", (error) => {
    console.error("❌ Socket reconnection error:", error);
  });

  socket.on("reconnect_failed", () => {
    console.error("❌ Socket reconnection failed");
  });

  return socket;
}

// Cleanup function for testing
export function resetSocketClient(): void {
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
  }
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

