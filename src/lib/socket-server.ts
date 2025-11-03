import { Server as HTTPServer } from "http";
import { Server as HTTPSServer } from "https";
import { Server as SocketIOServer, Socket } from "socket.io";
import { setupTrackingEvents, setupChatEvents } from "./socket-server-extensions";

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HTTPServer | HTTPSServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/api/socket",
  });

  io.on("connection", (socket: Socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Handle join room
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`📥 Socket ${socket.id} joined room: ${roomId}`);
      
      socket.emit("room-joined", { roomId, socketId: socket.id });
    });

    // Handle leave room
    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`📤 Socket ${socket.id} left room: ${roomId}`);
      
      socket.emit("room-left", { roomId });
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Test event
    socket.on("test-event", (data) => {
      console.log(`🧪 Test event received:`, data);
      socket.emit("test-event-response", { message: "Server received your test event!", originalData: data });
    });

    // Setup tracking and chat events
    // io is guaranteed to be non-null here since we just initialized it above
    setupTrackingEvents(socket, io!);
    setupChatEvents(socket, io!);
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

