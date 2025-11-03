"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/hooks/useChat";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Loader2 } from "lucide-react";

interface ChatBoxProps {
  orderId: string;
  userId: string;
  onNewMessage?: (message: any) => void;
}

export function ChatBox({ orderId, userId, onNewMessage }: ChatBoxProps) {
  const {
    messages,
    isTyping,
    typingUsers,
    unreadCount,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
  } = useChat({
    orderId,
    userId,
    onNewMessage,
  });

  // Mark visible messages as read
  const handleMessageVisible = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message && !message.isRead && message.senderId !== userId) {
      markAsRead([messageId]);
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Chat</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <MessageList
          messages={messages}
          isTyping={isTyping}
          typingUsers={typingUsers}
          onMessageVisible={handleMessageVisible}
        />
        <ChatInput
          onSendMessage={sendMessage}
          onTyping={sendTypingIndicator}
        />
      </CardContent>
    </Card>
  );
}

