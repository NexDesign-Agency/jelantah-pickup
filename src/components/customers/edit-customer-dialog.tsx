"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2, MapPin } from "lucide-react";

const editCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  latitude: z.union([z.number().min(-90).max(90), z.string()]).optional(),
  longitude: z.union([z.number().min(-180).max(180), z.string()]).optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankHolder: z.string().optional(),
});

type EditCustomerFormData = z.infer<typeof editCustomerSchema>;

interface EditCustomerDialogProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditCustomerDialog({
  customerId,
  open,
  onOpenChange,
  onSuccess,
}: EditCustomerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<EditCustomerFormData>({
    resolver: zodResolver(editCustomerSchema),
  });

  useEffect(() => {
    if (open && customerId) {
      fetchCustomer();
    }
  }, [open, customerId]);

  const fetchCustomer = async () => {
    setFetching(true);
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        reset({
          name: data.name || "",
          email: data.email || "",
          address: data.address || "",
          district: data.district || "",
          city: data.city || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          bankName: data.bankName || "",
          bankAccount: data.bankAccount || "",
          bankHolder: data.bankHolder || "",
        });
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", position.coords.latitude.toString());
          setValue("longitude", position.coords.longitude.toString());
        },
        () => {
          alert("Unable to get location. Please enter manually.");
        }
      );
    }
  };

  const onSubmit = async (data: EditCustomerFormData) => {
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        name: data.name,
        email: data.email || "",
        address: data.address || "",
        district: data.district || "",
        city: data.city || "",
        bankName: data.bankName || "",
        bankAccount: data.bankAccount || "",
        bankHolder: data.bankHolder || "",
      };

      if (data.latitude) {
        payload.latitude = typeof data.latitude === 'string' ? parseFloat(data.latitude) : data.latitude;
      }
      if (data.longitude) {
        payload.longitude = typeof data.longitude === 'string' ? parseFloat(data.longitude) : data.longitude;
      }

      const response = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update customer");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>Update customer information</DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Basic Information</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Address</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input id="district" {...register("district")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    {...register("latitude")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    {...register("longitude")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    className="w-full"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Location
                  </Button>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Bank Information</h3>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" {...register("bankName")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Account Number</Label>
                  <Input id="bankAccount" {...register("bankAccount")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankHolder">Account Holder</Label>
                  <Input id="bankHolder" {...register("bankHolder")} />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Customer"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
