"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { GPSTracker } from "@/components/courier/GPSTracker";
import { LiveMap } from "@/components/tracking/LiveMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Navigation } from "lucide-react";

export default function NavigatePage() {
  const params = useParams();
  const { data: session } = useSession();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gpsEnabled, setGpsEnabled] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (isLoading || !order) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  const destinationLocation = {
    latitude: order.latitude,
    longitude: order.longitude,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Navigate to Customer</h1>
          <p className="text-muted-foreground mt-2">
            Order: {order.orderNumber}
          </p>
        </div>
        <Button
          variant={gpsEnabled ? "default" : "outline"}
          onClick={() => setGpsEnabled(!gpsEnabled)}
        >
          <Navigation className="w-4 h-4 mr-2" />
          {gpsEnabled ? "Stop Tracking" : "Start Tracking"}
        </Button>
      </div>

      {/* GPS Tracker - Background component */}
      {orderId && session?.user?.id && (
        <GPSTracker orderId={orderId} enabled={gpsEnabled} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Navigation</CardTitle>
          <CardDescription>
            {gpsEnabled
              ? "Your location is being tracked. Customer can see your real-time location."
              : "GPS tracking is disabled. Enable to share your location with customer."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LiveMap
            customerLocation={destinationLocation}
            courierLocation={null} // Will be updated via socket
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destination</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{order.address}</p>
          <p className="text-sm text-muted-foreground">
            {order.district}, {order.city}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Coordinates: {order.latitude}, {order.longitude}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

