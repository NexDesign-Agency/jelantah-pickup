"use client";

import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { CheckCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
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

export function ChatMessage({
  senderId,
  sender,
  message,
  messageType,
  fileUrl,
  fileName,
  isRead,
  createdAt,
}: ChatMessageProps) {
  const { data: session } = useSession();
  const isOwnMessage = senderId === session?.user?.id;

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-3",
          isOwnMessage
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {!isOwnMessage && (
          <p className="text-xs font-semibold mb-1 opacity-80">{sender.name}</p>
        )}
        
        {messageType === "text" && (
          <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
        )}
        
        {messageType === "image" && fileUrl && (
          <div>
            <img
              src={fileUrl}
              alt={fileName || "Image"}
              className="max-w-full rounded-md mb-2"
            />
            {message && <p className="text-sm">{message}</p>}
          </div>
        )}

        {messageType === "file" && fileUrl && (
          <div>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              📎 {fileName || "File"}
            </a>
            {message && <p className="text-sm mt-1">{message}</p>}
          </div>
        )}

        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs opacity-70">
            {format(new Date(createdAt), "HH:mm")}
          </span>
          {isOwnMessage && (
            <span>
              {isRead ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

