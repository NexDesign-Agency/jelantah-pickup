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
import { Loader2, Edit, Plus, Power, PowerOff } from "lucide-react";
import { PricingTierFormDialog } from "@/components/pricing/pricing-tier-form-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PricingTier = {
  id: string;
  minLiters: number;
  maxLiters: number | null;
  pricePerLiter: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default function PricingPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

  const fetchTiers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pricing-tiers");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch pricing tiers");
      }

      setTiers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleEdit = (tier: PricingTier) => {
    setSelectedTier(tier);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedTier(null);
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (tier: PricingTier) => {
    try {
      const response = await fetch(`/api/pricing-tiers/${tier.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !tier.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tier status");
      }

      fetchTiers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const formatRange = (min: number, max: number | null) => {
    if (max === null) {
      return `${min}+ liters`;
    }
    return `${min} - ${max} liters`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pricing Tiers</h1>
          <p className="text-muted-foreground mt-2">
            Manage pricing tiers for billing calculations
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Tier
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading pricing tiers...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Tiers</CardTitle>
            <CardDescription>
              Configure pricing based on liter ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Range</TableHead>
                    <TableHead>Price per Liter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No pricing tiers found. Create your first tier.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tiers.map((tier) => (
                      <TableRow key={tier.id}>
                        <TableCell className="font-medium">
                          {formatRange(tier.minLiters, tier.maxLiters)}
                        </TableCell>
                        <TableCell>{formatPrice(Number(tier.pricePerLiter))}</TableCell>
                        <TableCell>
                          <Badge variant={tier.isActive ? "default" : "secondary"}>
                            {tier.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(tier)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(tier)}
                            >
                              {tier.isActive ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <PricingTierFormDialog
        tier={selectedTier}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          fetchTiers();
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
}

