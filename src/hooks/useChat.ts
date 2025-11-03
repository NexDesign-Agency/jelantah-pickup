"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "./useSocket";

interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    phone: string;
  };
  message: string;
  messageType: string;
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

interface UseChatOptions {
  orderId: string;
  userId: string;
  onNewMessage?: (message: ChatMessage) => void;
}

export function useChat({ orderId, userId, onNewMessage }: UseChatOptions) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const hasJoinedRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Join chat room
  useEffect(() => {
    if (!socket || !isConnected || !orderId || !userId) {
      return;
    }

    // Reset joined state if orderId changes
    if (hasJoinedRef.current) {
      socket.emit("leave-room", `chat:${orderId}`);
      hasJoinedRef.current = false;
    }

    socket.emit("chat:join", { orderId, userId });
    hasJoinedRef.current = true;

    // Fetch existing messages
    fetchMessages();

    return () => {
      if (socket && hasJoinedRef.current && socket.connected) {
        socket.emit("leave-room", `chat:${orderId}`);
        hasJoinedRef.current = false;
      }
    };
  }, [socket, isConnected, orderId, userId]);

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${orderId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        // Count unread
        const unread = data.filter(
          (msg: ChatMessage) => !msg.isRead && msg.senderId !== userId
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      
      // Update unread count if message is not from current user
      if (message.senderId !== userId) {
        setUnreadCount((prev) => prev + 1);
      }

      // Call callback if provided
      if (onNewMessage) {
        onNewMessage(message);
      }
    };

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };

    const handleMessagesRead = (data: {
      orderId: string;
      userId: string;
      messageIds: string[];
    }) => {
      if (data.orderId === orderId) {
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          )
        );
      }
    };

    socket.on("chat:new-message", handleNewMessage);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:messages-read", handleMessagesRead);

    return () => {
      socket.off("chat:new-message", handleNewMessage);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:messages-read", handleMessagesRead);
    };
  }, [socket, orderId, userId, onNewMessage]);

  // Send message
  const sendMessage = useCallback(
    (message: string, messageType: string = "text", fileUrl?: string, fileName?: string) => {
      if (!socket || !isConnected || !message.trim()) return;

      socket.emit("chat:send-message", {
        orderId,
        senderId: userId,
        message: message.trim(),
        messageType,
        fileUrl,
        fileName,
      });

      // Stop typing indicator
      sendTypingIndicator(false);
    },
    [socket, isConnected, orderId, userId]
  );

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!socket || !isConnected) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      socket.emit("chat:typing", {
        orderId,
        userId,
        isTyping,
      });

      // Auto-stop typing after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit("chat:typing", {
            orderId,
            userId,
            isTyping: false,
          });
        }, 3000);
      }
    },
    [socket, isConnected, orderId, userId]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    (messageIds: string[]) => {
      if (!socket || !isConnected || messageIds.length === 0) return;

      socket.emit("chat:mark-read", {
        orderId,
        userId,
        messageIds,
      });

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - messageIds.length));
    },
    [socket, isConnected, orderId, userId]
  );

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    isTyping: typingUsers.size > 0,
    typingUsers: Array.from(typingUsers),
    unreadCount,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    refreshMessages: fetchMessages,
  };
}

