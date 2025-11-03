"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface SelectOrderDialogProps {
  orders: any[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (order: any) => void;
  isLoading?: boolean;
}

export function SelectOrderDialog({
  orders,
  isOpen,
  onClose,
  onSelect,
  isLoading = false,
}: SelectOrderDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Order to Generate Billing</DialogTitle>
          <DialogDescription>
            Choose a completed order that hasn't been billed yet.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No completed orders available for billing.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Actual Liters</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
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
                      {order.actualLiters ? `${order.actualLiters} L` : "-"}
                    </TableCell>
                    <TableCell>
                      {order.completedDate
                        ? format(new Date(order.completedDate), "PPP")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => onSelect(order)}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

