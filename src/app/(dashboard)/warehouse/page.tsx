"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { VerifyOrderDialog } from "@/components/warehouse/verify-order-dialog";
import { OrderStatus } from "@prisma/client";
import { format } from "date-fns";

type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  estimatedLiters: number | null;
  actualLiters: number | null;
  createdAt: Date;
  customer: {
    name: string;
    phone: string;
  };
  courier: {
    name: string;
    phone: string;
  } | null;
};

export default function WarehouseDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch orders that are ASSIGNED or IN_PROGRESS (pending verification)
      const response = await fetch("/api/orders?status=ASSIGNED,IN_PROGRESS");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch orders");
      }

      // API returns { orders: [...], pagination: {...} }
      const orders = data.orders || data;
      
      // Filter to only show ASSIGNED and IN_PROGRESS orders
      const pendingOrders = orders.filter(
        (order: Order) =>
          order.status === OrderStatus.ASSIGNED ||
          order.status === OrderStatus.IN_PROGRESS
      );
      setOrders(pendingOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleVerify = (order: Order) => {
    setSelectedOrder(order);
    setIsVerifyDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "yellow";
      case OrderStatus.CONFIRMED:
        return "blue";
      case OrderStatus.ASSIGNED:
        return "purple";
      case OrderStatus.IN_PROGRESS:
        return "orange";
      case OrderStatus.COMPLETED:
        return "green";
      case OrderStatus.CANCELLED:
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Verification</h1>
        <p className="text-muted-foreground mt-2">
          Orders awaiting warehouse verification
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading orders...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Courier</TableHead>
                <TableHead>Estimated Liters</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No orders pending verification.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      {order.customer.name} <br />
                      <span className="text-sm text-muted-foreground">
                        ({order.customer.phone})
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.courier ? (
                        <>
                          {order.courier.name} <br />
                          <span className="text-sm text-muted-foreground">
                            ({order.courier.phone})
                          </span>
                        </>
                      ) : (
                        "Unassigned"
                      )}
                    </TableCell>
                    <TableCell>
                      {order.estimatedLiters ? `${order.estimatedLiters} L` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getStatusBadgeVariant(order.status) as
                            | "default"
                            | "secondary"
                            | "destructive"
                            | "outline"
                        }
                      >
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "PPP")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(order)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Verify
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedOrder && (
        <VerifyOrderDialog
          order={selectedOrder}
          isOpen={isVerifyDialogOpen}
          onClose={() => {
            setIsVerifyDialogOpen(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            fetchOrders();
            setIsVerifyDialogOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
