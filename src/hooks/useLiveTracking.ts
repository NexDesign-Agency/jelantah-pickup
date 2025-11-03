"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "./useSocket";

interface CourierLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  timestamp: Date;
}

export function useLiveTracking(orderId: string, userId: string) {
  const { socket, isConnected } = useSocket();
  const [courierLocation, setCourierLocation] = useState<CourierLocation | null>(null);
  const [eta, setETA] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!socket || !isConnected || !orderId) {
      setIsTracking(false);
      return;
    }

    // Reset joined state if orderId changes
    if (hasJoinedRef.current) {
      socket.emit("leave-room", `tracking:${orderId}`);
      hasJoinedRef.current = false;
    }

    // Join tracking room
    socket.emit("tracking:join", { orderId, userId });
    hasJoinedRef.current = true;
    setIsTracking(true);

    // Listen for location updates
    const handleLocationUpdate = (data: {
      orderId: string;
      location: CourierLocation;
    }) => {
      if (data.orderId === orderId) {
        setCourierLocation({
          ...data.location,
          timestamp: new Date(data.location.timestamp),
        });
      }
    };

    // Listen for ETA updates
    const handleETAUpdate = (data: { orderId: string; eta: number | null }) => {
      if (data.orderId === orderId) {
        setETA(data.eta);
      }
    };

    socket.on("tracking:location-updated", handleLocationUpdate);
    socket.on("tracking:eta-calculated", handleETAUpdate);

    // Request ETA calculation
    socket.emit("tracking:calculate-eta", { orderId });

    // Cleanup
    return () => {
      if (socket) {
        socket.off("tracking:location-updated", handleLocationUpdate);
        socket.off("tracking:eta-calculated", handleETAUpdate);
      }
      if (hasJoinedRef.current && socket?.connected) {
        socket.emit("leave-room", `tracking:${orderId}`);
        hasJoinedRef.current = false;
      }
      setIsTracking(false);
    };
  }, [socket, isConnected, orderId, userId]);

  const calculateETA = (destinationLat: number, destinationLng: number) => {
    if (!courierLocation || !socket) return;

    // Simple ETA calculation based on distance and average speed
    const distance = calculateDistance(
      courierLocation.latitude,
      courierLocation.longitude,
      destinationLat,
      destinationLng
    );

    const averageSpeed = courierLocation.speed || 30; // km/h, default 30
    const etaMinutes = (distance / averageSpeed) * 60;

    setETA(Math.round(etaMinutes));
    socket.emit("tracking:calculate-eta", { orderId });
  };

  return {
    courierLocation,
    eta,
    isTracking,
    calculateETA,
  };
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

