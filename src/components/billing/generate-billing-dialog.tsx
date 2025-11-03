"use client";

import { useState, useEffect } from "react";
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
import { Loader2, FileText } from "lucide-react";

const generateBillingSchema = z.object({
  actualLiters: z.number().positive("Actual liters must be greater than 0"),
});

interface GenerateBillingDialogProps {
  order: {
    id: string;
    orderNumber: string;
    actualLiters: number | null;
    customer: {
      name: string;
      phone: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GenerateBillingDialog({
  order,
  isOpen,
  onClose,
  onSuccess,
}: GenerateBillingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof generateBillingSchema>>({
    resolver: zodResolver(generateBillingSchema),
    defaultValues: {
      actualLiters: order.actualLiters || 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        actualLiters: order.actualLiters || 0,
      });
      setError(null);
    }
  }, [isOpen, order.actualLiters, reset]);

  const onSubmit = async (data: z.infer<typeof generateBillingSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          actualLiters: data.actualLiters,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate billing");
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
          <DialogTitle>Generate Billing for {order.orderNumber}</DialogTitle>
          <DialogDescription>
            {order.actualLiters
              ? `Generate billing for ${order.customer.name} (${order.customer.phone}). Actual liters: ${order.actualLiters} L (from warehouse verification).`
              : `Enter the actual liters collected to generate billing for customer ${order.customer.name} (${order.customer.phone}).`}
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
                <FileText className="mr-2 h-4 w-4" />
              )}
              Generate Billing
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

