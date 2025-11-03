"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";

interface OrderDetailDialogProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignCourier?: () => void;
}

export function OrderDetailDialog({
  order,
  open,
  onOpenChange,
  onAssignCourier,
}: OrderDetailDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewLocation = () => {
    if (order.latitude && order.longitude) {
      const url = `https://www.google.com/maps?q=${order.latitude},${order.longitude}`;
      window.open(url, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>Order {order.orderNumber}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Order Number</p>
              <p className="font-semibold">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created Date</p>
              <p className="font-semibold">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            {order.estimatedLiters && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estimated Liters</p>
                <p className="font-semibold">{order.estimatedLiters} L</p>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-semibold">{order.customer?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="font-semibold">{order.customer?.phone}</p>
              </div>
            </div>
          </div>

          {/* Courier Info */}
          {order.courier ? (
            <div className="space-y-2">
              <h3 className="font-semibold">Courier Information</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-semibold">{order.courier.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="font-semibold">{order.courier.phone}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">No courier assigned yet</p>
              {onAssignCourier && (
                <Button
                  onClick={onAssignCourier}
                  size="sm"
                  className="mt-2"
                  variant="outline"
                >
                  Assign Courier
                </Button>
              )}
            </div>
          )}

          {/* Location Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">Pickup Location</h3>
            <div className="p-4 bg-muted/50 rounded-md space-y-2">
              <p className="font-semibold">{order.address}</p>
              <p className="text-sm text-muted-foreground">
                {order.district}, {order.city}
              </p>
              {order.latitude && order.longitude && (
                <Button
                  onClick={handleViewLocation}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  View on Map
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
