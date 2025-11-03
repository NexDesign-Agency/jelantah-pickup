"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Users, Package } from "lucide-react";
import { Loader2 } from "lucide-react";

interface CustomerDetailDialogProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export function CustomerDetailDialog({
  customerId,
  open,
  onOpenChange,
  onEdit,
}: CustomerDetailDialogProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && customerId) {
      fetchCustomer();
    }
  }, [open, customerId]);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLocation = () => {
    if (customer?.latitude && customer?.longitude) {
      const url = `https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`;
      window.open(url, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            {customer?.name} ({customer?.phone})
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : customer ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-semibold">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="font-semibold">{customer.phone}</p>
              </div>
              {customer.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-semibold">{customer.email}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge
                  className={
                    customer.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {customer.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <h3 className="font-semibold">Address</h3>
              <div className="p-4 bg-muted/50 rounded-md space-y-2">
                <p className="font-semibold">{customer.address}</p>
                <p className="text-sm text-muted-foreground">
                  {customer.district}, {customer.city}
                </p>
                {customer.latitude && customer.longitude && (
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

            {/* Bank Info */}
            {customer.bankName && (
              <div className="space-y-2">
                <h3 className="font-semibold">Bank Information</h3>
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                    <p className="font-semibold">{customer.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                    <p className="font-semibold">{customer.bankAccount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Holder</p>
                    <p className="font-semibold">{customer.bankHolder}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm font-medium text-muted-foreground">Total Liters</p>
                <p className="text-2xl font-bold">{customer.totalLiters || 0} L</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm font-medium text-muted-foreground">Downline Count</p>
                <p className="text-2xl font-bold">{customer.downlineCount || 0}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm font-medium text-muted-foreground">Last Order</p>
                <p className="text-sm font-semibold">
                  {customer.lastOrderDate
                    ? new Date(customer.lastOrderDate).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
            </div>

            {/* Referral Info */}
            {customer.referredBy && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Referred By
                </h3>
                <div className="p-4 bg-muted/50 rounded-md">
                  <p className="font-semibold">{customer.referredBy.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.referredBy.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Orders */}
            {customer.ordersAsCustomer && customer.ordersAsCustomer.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Recent Orders ({customer.ordersAsCustomer.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customer.ordersAsCustomer.slice(0, 5).map((order: any) => (
                    <div
                      key={order.id}
                      className="p-3 bg-muted/50 rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()} - {order.status}
                        </p>
                      </div>
                      {order.actualLiters && (
                        <Badge variant="outline">{order.actualLiters} L</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {onEdit && (
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={onEdit} variant="outline">
                  Edit Customer
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Customer not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
