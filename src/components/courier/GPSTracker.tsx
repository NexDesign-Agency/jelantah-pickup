"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSession } from "next-auth/react";

interface GPSTrackerProps {
  orderId: string;
  enabled?: boolean;
  updateInterval?: number; // milliseconds, default 5000 (5 seconds)
}

export function GPSTracker({
  orderId,
  enabled = true,
  updateInterval = 5000,
}: GPSTrackerProps) {
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();
  const { latitude, longitude, accuracy, speed, heading, error } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 5000,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  useEffect(() => {
    if (!enabled || !socket || !isConnected || !orderId || !session?.user?.id) {
      return;
    }

    // Join tracking room
    socket.emit("tracking:join", {
      orderId,
      userId: session.user.id,
    });

    // Cleanup on unmount or when dependencies change
    return () => {
      if (socket && socket.connected) {
        socket.emit("leave-room", `tracking:${orderId}`);
      }
    };
  }, [enabled, socket, isConnected, orderId, session?.user?.id]);

  useEffect(() => {
    if (!enabled || !socket || !isConnected || !orderId || !session?.user?.id) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (error) {
      console.error("GPS Error:", error);
      return;
    }

    if (latitude === null || longitude === null) {
      return; // Still loading
    }

    // Send location immediately on first valid location
    if (!lastSentRef.current) {
      sendLocation();
      lastSentRef.current = { lat: latitude, lng: longitude, time: Date.now() };
    }

    // Set up interval for periodic updates
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const lastSent = lastSentRef.current;

      // Only send if position changed significantly (>10 meters) or if 5 seconds passed
      if (
        !lastSent ||
        now - lastSent.time >= updateInterval ||
        calculateDistance(latitude, longitude, lastSent.lat, lastSent.lng) > 0.01
      ) {
        sendLocation();
        lastSentRef.current = { lat: latitude, lng: longitude, time: now };
      }
    }, updateInterval);

    // Cleanup interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, socket, isConnected, orderId, session?.user?.id, latitude, longitude, accuracy, speed, heading, updateInterval, error]);

  const sendLocation = () => {
    if (!socket || !isConnected || !orderId || !session?.user?.id || latitude === null || longitude === null) {
      return;
    }

    // Get battery level if available
    const batteryLevel = (navigator as any).getBattery
      ? null // Will be handled by promise
      : null;

    socket.emit("tracking:update-location", {
      orderId,
      courierId: session.user.id,
      latitude,
      longitude,
      accuracy: accuracy || undefined,
      speed: speed || undefined,
      heading: heading || undefined,
      batteryLevel: batteryLevel || undefined,
    });
  };

  // Silent component - no UI
  return null;
}

// Helper to calculate distance in kilometers
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

