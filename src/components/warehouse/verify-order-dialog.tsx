"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

const verifyOrderSchema = z.object({
  actualLiters: z.number().positive("Actual liters must be greater than 0"),
});

interface VerifyOrderDialogProps {
  order: {
    id: string;
    orderNumber: string;
    customer: {
      name: string;
      phone: string;
    };
    estimatedLiters: number | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VerifyOrderDialog({
  order,
  isOpen,
  onClose,
  onSuccess,
}: VerifyOrderDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof verifyOrderSchema>>({
    resolver: zodResolver(verifyOrderSchema),
    defaultValues: {
      actualLiters: order.estimatedLiters || 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof verifyOrderSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actualLiters: data.actualLiters,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to verify order");
      }

      onSuccess();
      onClose();
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify Order: {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Enter the actual liters collected for customer {order.customer.name}{" "}
            ({order.customer.phone}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="actualLiters">Actual Liters *</Label>
            <Input
              id="actualLiters"
              type="number"
              step="0.1"
              placeholder="e.g., 150.5"
              {...register("actualLiters", { valueAsNumber: true })}
            />
            {order.estimatedLiters && (
              <p className="text-sm text-muted-foreground">
                Estimated: {order.estimatedLiters} L
              </p>
            )}
            {errors.actualLiters && (
              <p className="text-sm text-red-500">
                {errors.actualLiters.message}
              </p>
            )}
          </div>
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Verify Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

