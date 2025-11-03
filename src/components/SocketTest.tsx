"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle, Send } from "lucide-react";

export function SocketTest() {
  const { socket, isConnected } = useSocket();
  const [testMessage, setTestMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [roomId, setRoomId] = useState("");
  const [joinedRooms, setJoinedRooms] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for test event response
    const handleTestResponse = (data: any) => {
      setReceivedMessages((prev) => [
        ...prev,
        `✅ Response: ${JSON.stringify(data)}`,
      ]);
    };

    // Listen for room events
    const handleRoomJoined = (data: any) => {
      setReceivedMessages((prev) => [
        ...prev,
        `✅ Joined room: ${data.roomId}`,
      ]);
      setJoinedRooms((prev) => [...prev, data.roomId]);
    };

    const handleRoomLeft = (data: any) => {
      setReceivedMessages((prev) => [
        ...prev,
        `📤 Left room: ${data.roomId}`,
      ]);
      setJoinedRooms((prev) => prev.filter((r) => r !== data.roomId));
    };

    socket.on("test-event-response", handleTestResponse);
    socket.on("room-joined", handleRoomJoined);
    socket.on("room-left", handleRoomLeft);

    return () => {
      socket.off("test-event-response", handleTestResponse);
      socket.off("room-joined", handleRoomJoined);
      socket.off("room-left", handleRoomLeft);
    };
  }, [socket]);

  const handleSendTestEvent = () => {
    if (!socket || !testMessage.trim()) return;

    socket.emit("test-event", {
      message: testMessage,
      timestamp: new Date().toISOString(),
    });

    setReceivedMessages((prev) => [
      ...prev,
      `📤 Sent: ${testMessage}`,
    ]);
    setTestMessage("");
  };

  const handleJoinRoom = () => {
    if (!socket || !roomId.trim()) return;

    socket.emit("join-room", roomId.trim());
  };

  const handleLeaveRoom = (rId: string) => {
    if (!socket) return;

    socket.emit("leave-room", rId);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Socket.io Test Component
          {isConnected ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Disconnected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Test Socket.io connection and events. Socket ID: {socket?.id || "N/A"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm font-medium">Connection Status:</p>
          <p className={`text-lg font-bold ${isConnected ? "text-green-600" : "text-red-600"}`}>
            {isConnected ? "✅ Connected" : "❌ Disconnected"}
          </p>
        </div>

        {/* Test Event */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Test Event:</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter test message..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendTestEvent();
              }}
              disabled={!isConnected}
            />
            <Button
              onClick={handleSendTestEvent}
              disabled={!isConnected || !testMessage.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>

        {/* Room Management */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Room Management:</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter room ID..."
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={!isConnected}
            />
            <Button
              onClick={handleJoinRoom}
              disabled={!isConnected || !roomId.trim()}
            >
              Join Room
            </Button>
          </div>
          {joinedRooms.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {joinedRooms.map((rId) => (
                <Badge key={rId} variant="outline" className="flex items-center gap-1">
                  {rId}
                  <button
                    onClick={() => handleLeaveRoom(rId)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Received Messages */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Received Messages:</p>
          <div className="p-4 bg-muted rounded-md max-h-64 overflow-y-auto space-y-1">
            {receivedMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No messages received yet...
              </p>
            ) : (
              receivedMessages.map((msg, idx) => (
                <p key={idx} className="text-sm font-mono">
                  {msg}
                </p>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

