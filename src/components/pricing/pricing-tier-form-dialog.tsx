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
import { Loader2, Save } from "lucide-react";

const pricingTierSchema = z.object({
  minLiters: z.number().min(0, "Minimum liters must be 0 or greater"),
  maxLiters: z.number().nullable().optional(),
  pricePerLiter: z.number().positive("Price per liter must be positive"),
  isActive: z.boolean(),
});

type PricingTierFormData = z.infer<typeof pricingTierSchema>;

interface PricingTierFormDialogProps {
  tier?: {
    id: string;
    minLiters: number;
    maxLiters: number | null;
    pricePerLiter: number;
    isActive: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PricingTierFormDialog({
  tier,
  isOpen,
  onClose,
  onSuccess,
}: PricingTierFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PricingTierFormData>({
    resolver: zodResolver(pricingTierSchema),
    defaultValues: {
      minLiters: 0,
      maxLiters: null,
      pricePerLiter: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (tier) {
        reset({
          minLiters: tier.minLiters,
          maxLiters: tier.maxLiters ?? undefined,
          pricePerLiter: Number(tier.pricePerLiter),
          isActive: tier.isActive,
        });
      } else {
        reset({
          minLiters: 0,
          maxLiters: undefined,
          pricePerLiter: 0,
          isActive: true,
        });
      }
      setError(null);
    }
  }, [isOpen, tier, reset]);

  const onSubmit = async (data: PricingTierFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = tier
        ? `/api/pricing-tiers/${tier.id}`
        : "/api/pricing-tiers";
      const method = tier ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          maxLiters: data.maxLiters || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save pricing tier");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {tier ? "Edit Pricing Tier" : "Create Pricing Tier"}
          </DialogTitle>
          <DialogDescription>
            {tier
              ? "Update the pricing tier details."
              : "Create a new pricing tier for the billing system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minLiters">Minimum Liters *</Label>
              <Input
                id="minLiters"
                type="number"
                step="0.1"
                {...register("minLiters", { valueAsNumber: true })}
              />
              {errors.minLiters && (
                <p className="text-sm text-red-500">
                  {errors.minLiters.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLiters">Maximum Liters (Optional)</Label>
              <Input
                id="maxLiters"
                type="number"
                step="0.1"
                placeholder="Leave empty for unlimited"
                {...register("maxLiters", {
                  setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                })}
              />
              {errors.maxLiters && (
                <p className="text-sm text-red-500">
                  {errors.maxLiters.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePerLiter">Price per Liter (Rp) *</Label>
            <Input
              id="pricePerLiter"
              type="number"
              step="0.01"
              {...register("pricePerLiter", { valueAsNumber: true })}
            />
            {errors.pricePerLiter && (
              <p className="text-sm text-red-500">
                {errors.pricePerLiter.message}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {tier ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

