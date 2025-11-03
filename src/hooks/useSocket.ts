"use client";

import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";
import { getSocketClient, disconnectSocket } from "@/lib/socket-client";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket
    const clientSocket = getSocketClient();
    socketRef.current = clientSocket;
    setSocket(clientSocket);

    // Set connection status
    setIsConnected(clientSocket.connected);

    // Listen for connection events
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    clientSocket.on("connect", handleConnect);
    clientSocket.on("disconnect", handleDisconnect);

    // Cleanup
    return () => {
      clientSocket.off("connect", handleConnect);
      clientSocket.off("disconnect", handleDisconnect);
    };
  }, []);

  return { socket, isConnected };
}

