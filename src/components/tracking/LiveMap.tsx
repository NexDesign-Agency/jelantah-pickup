"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface LiveMapProps {
  customerLocation: { latitude: number; longitude: number };
  courierLocation: { latitude: number; longitude: number; heading?: number } | null;
  eta?: number | null;
  className?: string;
}

// Component to update map view when courier moves
function MapUpdater({ courierLocation }: { courierLocation: { latitude: number; longitude: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (courierLocation && map) {
      map.setView([courierLocation.latitude, courierLocation.longitude], map.getZoom());
    }

    // Cleanup on unmount
    return () => {
      // Map cleanup handled by react-leaflet
    };
  }, [courierLocation, map]);

  return null;
}

export function LiveMap({
  customerLocation,
  courierLocation,
  eta,
  className = "h-[500px] w-full",
}: LiveMapProps) {
  const courierMarkerRef = useRef<L.Marker | null>(null);

  // Create custom courier icon with rotation
  const createCourierIcon = (heading?: number) => {
    return L.divIcon({
      className: "courier-marker",
      html: `<div style="transform: rotate(${heading || 0}deg);">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="2"/>
          <path d="M16 8 L20 16 L16 14 L12 16 Z" fill="white"/>
        </svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  useEffect(() => {
    if (courierMarkerRef.current && courierLocation) {
      courierMarkerRef.current.setLatLng([courierLocation.latitude, courierLocation.longitude]);
      if (courierLocation.heading !== undefined) {
        courierMarkerRef.current.setIcon(createCourierIcon(courierLocation.heading));
      }
    }

    // Cleanup on unmount
    return () => {
      // Marker cleanup handled by react-leaflet
    };
  }, [courierLocation]);

  if (typeof window === "undefined") {
    return <div className={className}>Loading map...</div>;
  }

  const centerLat = courierLocation?.latitude || customerLocation.latitude;
  const centerLng = courierLocation?.longitude || customerLocation.longitude;

  return (
    <div className={className}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Customer marker (fixed) */}
        <Marker
          position={[customerLocation.latitude, customerLocation.longitude]}
          icon={L.icon({
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })}
        />

        {/* Courier marker (moving) */}
        {courierLocation && (
          <Marker
            ref={courierMarkerRef}
            position={[courierLocation.latitude, courierLocation.longitude]}
            icon={createCourierIcon(courierLocation.heading)}
          />
        )}

        {/* Route line */}
        {courierLocation && (
          <Polyline
            positions={[
              [courierLocation.latitude, courierLocation.longitude],
              [customerLocation.latitude, customerLocation.longitude],
            ]}
            color="#3B82F6"
            weight={3}
            dashArray="10, 10"
          />
        )}

        <MapUpdater courierLocation={courierLocation} />
      </MapContainer>

      {/* ETA Display */}
      {eta !== null && eta !== undefined && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg border">
          <p className="text-sm font-medium text-muted-foreground">Estimated Arrival</p>
          <p className="text-2xl font-bold text-primary">
            {eta < 60 ? `${eta} min` : `${Math.floor(eta / 60)}h ${eta % 60}min`}
          </p>
        </div>
      )}
    </div>
  );
}

