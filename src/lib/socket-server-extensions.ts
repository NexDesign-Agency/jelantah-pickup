// Socket.io event handlers for tracking and chat
// Import this in socket-server.ts to add these handlers

import { Socket, Server as SocketIOServer } from "socket.io";

export function setupTrackingEvents(socket: Socket, io: SocketIOServer) {
  // Join tracking room
  socket.on("tracking:join", async (data: { orderId: string; userId: string }) => {
    const roomId = `tracking:${data.orderId}`;
    socket.join(roomId);
    console.log(`📍 Tracking: ${socket.id} joined room: ${roomId}`);
    
    // Get latest location if exists
    const { prisma } = await import("@/lib/prisma");
    const latestLocation = await prisma.courierLocation.findFirst({
      where: { orderId: data.orderId },
      orderBy: { timestamp: "desc" },
    });
    
    if (latestLocation) {
      socket.emit("tracking:location-updated", {
        orderId: data.orderId,
        location: {
          latitude: latestLocation.latitude,
          longitude: latestLocation.longitude,
          accuracy: latestLocation.accuracy,
          speed: latestLocation.speed,
          heading: latestLocation.heading,
          batteryLevel: latestLocation.batteryLevel,
          timestamp: latestLocation.timestamp,
        },
      });
    }
  });

  // Update courier location
  socket.on("tracking:update-location", async (data: {
    orderId: string;
    courierId: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    batteryLevel?: number;
  }) => {
    try {
      const { prisma } = await import("@/lib/prisma");
      
      // Save location to database
      await prisma.courierLocation.create({
        data: {
          orderId: data.orderId,
          courierId: data.courierId,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          speed: data.speed,
          heading: data.heading,
          batteryLevel: data.batteryLevel,
        },
      });

      // Broadcast to room
      const roomId = `tracking:${data.orderId}`;
      io.to(roomId).emit("tracking:location-updated", {
        orderId: data.orderId,
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          speed: data.speed,
          heading: data.heading,
          batteryLevel: data.batteryLevel,
          timestamp: new Date(),
        },
      });

      console.log(`📍 Location updated for order ${data.orderId}`);
    } catch (error) {
      console.error("Error updating location:", error);
      socket.emit("tracking:error", { message: "Failed to update location" });
    }
  });

  // Calculate ETA
  socket.on("tracking:calculate-eta", async (data: { orderId: string }) => {
    socket.emit("tracking:eta-calculated", {
      orderId: data.orderId,
      eta: null, // Would calculate based on distance
    });
  });
}

export function setupChatEvents(socket: Socket, io: SocketIOServer) {
  // Join chat room
  socket.on("chat:join", (data: { orderId: string; userId: string }) => {
    const roomId = `chat:${data.orderId}`;
    socket.join(roomId);
    (socket as any).data = (socket as any).data || {};
    (socket as any).data.userId = data.userId;
    console.log(`💬 Chat: ${socket.id} (user ${data.userId}) joined room: ${roomId}`);
    
    socket.emit("chat:joined", { orderId: data.orderId });
  });

  // Send message
  socket.on("chat:send-message", async (data: {
    orderId: string;
    senderId: string;
    message: string;
    messageType?: string;
    fileUrl?: string;
    fileName?: string;
  }) => {
    try {
      const { prisma } = await import("@/lib/prisma");
      
      // Save message to database
      const chatMessage = await prisma.chatMessage.create({
        data: {
          orderId: data.orderId,
          senderId: data.senderId,
          message: data.message,
          messageType: data.messageType || "text",
          fileUrl: data.fileUrl,
          fileName: data.fileName,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });

      // Broadcast to room
      const roomId = `chat:${data.orderId}`;
      io.to(roomId).emit("chat:new-message", {
        id: chatMessage.id,
        orderId: chatMessage.orderId,
        senderId: chatMessage.senderId,
        sender: chatMessage.sender,
        message: chatMessage.message,
        messageType: chatMessage.messageType,
        fileUrl: chatMessage.fileUrl,
        fileName: chatMessage.fileName,
        createdAt: chatMessage.createdAt,
      });

      console.log(`💬 Message sent in chat:${data.orderId}`);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("chat:error", { message: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("chat:typing", (data: { orderId: string; userId: string; isTyping: boolean }) => {
    const roomId = `chat:${data.orderId}`;
    socket.to(roomId).emit("chat:typing", {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  });

  // Mark messages as read
  socket.on("chat:mark-read", async (data: { orderId: string; userId: string; messageIds: string[] }) => {
    try {
      const { prisma } = await import("@/lib/prisma");
      
      await prisma.chatMessage.updateMany({
        where: {
          id: { in: data.messageIds },
          orderId: data.orderId,
          senderId: { not: data.userId },
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      // Broadcast read receipt
      const roomId = `chat:${data.orderId}`;
      io.to(roomId).emit("chat:messages-read", {
        orderId: data.orderId,
        userId: data.userId,
        messageIds: data.messageIds,
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });
}

