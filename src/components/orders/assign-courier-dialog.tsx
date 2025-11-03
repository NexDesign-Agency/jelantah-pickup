"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AssignCourierDialogProps {
  orderId: string;
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignCourierDialog({
  orderId,
  orderNumber,
  open,
  onOpenChange,
  onSuccess,
}: AssignCourierDialogProps) {
  const [couriers, setCouriers] = useState<any[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchCouriers();
    }
  }, [open]);

  const fetchCouriers = async () => {
    setFetching(true);
    try {
      const response = await fetch("/api/couriers");
      if (response.ok) {
        const data = await response.json();
        setCouriers(data);
      }
    } catch (err) {
      console.error("Error fetching couriers:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCourierId) {
      setError("Please select a courier");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courierId: selectedCourierId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to assign courier");
      }

      onSuccess();
      onOpenChange(false);
      setSelectedCourierId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Courier</DialogTitle>
          <DialogDescription>
            Assign a courier to order {orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {fetching ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : couriers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No couriers available</p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="courier">Select Courier</Label>
              <select
                id="courier"
                value={selectedCourierId}
                onChange={(e) => setSelectedCourierId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- Select Courier --</option>
                {couriers.map((courier) => (
                  <option key={courier.id} value={courier.id}>
                    {courier.name} ({courier.phone})
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedCourierId}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Courier"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
