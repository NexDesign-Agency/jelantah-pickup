"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PackagePlus, MapPin } from "lucide-react";

const createOrderSchema = z.object({
  estimatedLiters: z.union([z.number().positive(), z.string()]).optional(),
  courierId: z.string().uuid().optional(),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  pickupDate: z.string().optional(),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

interface CreateOrderFormProps {
  customer: any;
  onSuccess: (order: any) => void;
  onCancel: () => void;
}

export function CreateOrderForm({ customer, onSuccess, onCancel }: CreateOrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loadingCouriers, setLoadingCouriers] = useState(true);
  const [courierAssignment, setCourierAssignment] = useState<"manual" | "auto">("manual");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      pickupAddress: customer.address || "",
      district: customer.district || "",
      city: customer.city || "",
      latitude: customer.latitude || -6.2442,
      longitude: customer.longitude || 106.7998,
    },
  });

  // Fetch couriers
  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const response = await fetch("/api/couriers");
        if (response.ok) {
          const data = await response.json();
          setCouriers(data);
        }
      } catch (err) {
        console.error("Error fetching couriers:", err);
      } finally {
        setLoadingCouriers(false);
      }
    };

    fetchCouriers();
  }, []);

  // Auto-assign courier
  const handleAutoAssign = () => {
    if (couriers.length > 0) {
      const randomCourier = couriers[Math.floor(Math.random() * couriers.length)];
      setValue("courierId", randomCourier.id);
      setCourierAssignment("auto");
    }
  };

  // Get user location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", position.coords.latitude);
          setValue("longitude", position.coords.longitude);
        },
        () => {
          alert("Unable to get location. Please enter manually.");
        }
      );
    }
  };

  const onSubmit = async (data: CreateOrderFormData) => {
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        customerId: customer.id,
        pickupAddress: data.pickupAddress,
        district: data.district,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      if (data.estimatedLiters) {
        const liters = typeof data.estimatedLiters === "string" 
          ? parseFloat(data.estimatedLiters) 
          : data.estimatedLiters;
        if (!isNaN(liters) && liters > 0) {
          payload.estimatedLiters = liters;
        }
      }

      if (data.courierId) {
        payload.courierId = data.courierId;
      }

      if (data.pickupDate) {
        payload.pickupDate = new Date(data.pickupDate).toISOString();
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create order");
      }

      onSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Pickup Order</CardTitle>
        <CardDescription>
          Create a new pickup order for {customer.name} ({customer.phone})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Pickup Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Pickup Address</h3>
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Address *</Label>
              <Input
                id="pickupAddress"
                {...register("pickupAddress")}
                placeholder="Jl. Example No. 123"
              />
              {errors.pickupAddress && (
                <p className="text-sm text-red-500">{errors.pickupAddress.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  {...register("district")}
                  placeholder="Kebayoran Baru"
                />
                {errors.district && (
                  <p className="text-sm text-red-500">{errors.district.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Jakarta Selatan"
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  {...register("latitude", { valueAsNumber: true })}
                />
                {errors.latitude && (
                  <p className="text-sm text-red-500">{errors.latitude.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  {...register("longitude", { valueAsNumber: true })}
                />
                {errors.longitude && (
                  <p className="text-sm text-red-500">{errors.longitude.message}</p>
                )}
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

          {/* Order Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Order Details</h3>
            <div className="space-y-2">
              <Label htmlFor="estimatedLiters">Estimated Liters (Optional)</Label>
              <Input
                id="estimatedLiters"
                type="number"
                step="0.1"
                {...register("estimatedLiters")}
                placeholder="e.g., 25.5"
              />
              {errors.estimatedLiters && (
                <p className="text-sm text-red-500">{errors.estimatedLiters.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupDate">Pickup Date Preference (Optional)</Label>
              <Input
                id="pickupDate"
                type="datetime-local"
                {...register("pickupDate")}
              />
              {errors.pickupDate && (
                <p className="text-sm text-red-500">{errors.pickupDate.message}</p>
              )}
            </div>
          </div>

          {/* Courier Assignment */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Courier Assignment</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={courierAssignment === "auto" ? "default" : "outline"}
                onClick={() => {
                  setCourierAssignment("auto");
                  handleAutoAssign();
                }}
                disabled={loadingCouriers || couriers.length === 0}
              >
                Auto-assign
              </Button>
              <Button
                type="button"
                variant={courierAssignment === "manual" ? "default" : "outline"}
                onClick={() => {
                  setCourierAssignment("manual");
                  setValue("courierId", "");
                }}
              >
                Manual Select
              </Button>
            </div>
            {courierAssignment === "manual" && (
              <div className="space-y-2">
                <Label htmlFor="courierId">Select Courier</Label>
                {loadingCouriers ? (
                  <div className="text-sm text-muted-foreground">Loading couriers...</div>
                ) : couriers.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No couriers available</div>
                ) : (
                  <select
                    id="courierId"
                    {...register("courierId")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">-- Select Courier --</option>
                    {couriers.map((courier) => (
                      <option key={courier.id} value={courier.id}>
                        {courier.name} ({courier.phone})
                      </option>
                    ))}
                  </select>
                )}
                {errors.courierId && (
                  <p className="text-sm text-red-500">{errors.courierId.message}</p>
                )}
              </div>
            )}
            {courierAssignment === "auto" && watch("courierId") && (
              <div className="text-sm text-green-600">
                ✓ Auto-assigned: {couriers.find((c) => c.id === watch("courierId"))?.name}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Create Order
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
