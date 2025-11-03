"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLiveTracking } from "@/hooks/useLiveTracking";
import { LiveMap } from "@/components/tracking/LiveMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function TrackingPage() {
  const params = useParams();
  const { data: session } = useSession();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { courierLocation, eta, isTracking } = useLiveTracking(
    orderId,
    session?.user?.id || ""
  );

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

  const customerLocation = {
    latitude: order.latitude,
    longitude: order.longitude,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Track Your Order</h1>
        <p className="text-muted-foreground mt-2">
          Order: {order.orderNumber}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Tracking</CardTitle>
          <CardDescription>
            {isTracking && courierLocation
              ? "Real-time courier location"
              : "Waiting for courier location updates..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LiveMap
            customerLocation={customerLocation}
            courierLocation={courierLocation}
            eta={eta}
          />
        </CardContent>
      </Card>

      {courierLocation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Courier Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {courierLocation.latitude.toFixed(6)}, {courierLocation.longitude.toFixed(6)}
              </p>
            </CardContent>
          </Card>
          {eta && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">ETA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {eta < 60 ? `${eta} min` : `${Math.floor(eta / 60)}h ${eta % 60}min`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

