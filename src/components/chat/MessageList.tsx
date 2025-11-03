"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";

interface Message {
  id: string;
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
  createdAt: Date;
}

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  typingUsers?: string[];
  onMessageVisible?: (messageId: string) => void;
}

export function MessageList({
  messages,
  isTyping,
  typingUsers = [],
  onMessageVisible,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Setup intersection observer for read receipts
  useEffect(() => {
    if (!onMessageVisible) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.dataset.messageId) {
            onMessageVisible(entry.target.dataset.messageId);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all messages
    const messageElements = document.querySelectorAll("[data-message-id]");
    messageElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages, onMessageVisible]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => (
        <div key={message.id} data-message-id={message.id}>
          <ChatMessage {...message} />
        </div>
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}

