"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, UserPlus } from "lucide-react";

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^[0-9]{10,13}$/, "Invalid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  bankName: z.string().min(1, "Bank name is required"),
  bankAccount: z.string().min(1, "Bank account is required"),
  bankHolder: z.string().min(1, "Bank holder name is required"),
  referredByPhone: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface CustomerRegistrationFormProps {
  initialPhone?: string;
  onSuccess: (customer: any) => void;
  onCancel: () => void;
}

export function CustomerRegistrationForm({
  initialPhone = "",
  onSuccess,
  onCancel,
}: CustomerRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      phone: initialPhone,
      latitude: -6.2442, // Default Jakarta coordinates
      longitude: 106.7998,
    },
  });

  const referredByPhone = watch("referredByPhone");

  // Check referrer when phone changes
  useEffect(() => {
    const checkReferrer = async () => {
      if (referredByPhone && referredByPhone.length >= 10) {
        try {
          const response = await fetch(
            `/api/customers/check-phone?phone=${encodeURIComponent(referredByPhone)}`
          );
          const data = await response.json();
          if (data.exists && data.customer) {
            setReferrerName(data.customer.name);
          } else {
            setReferrerName(null);
          }
        } catch {
          setReferrerName(null);
        }
      } else {
        setReferrerName(null);
      }
    };

    const timeoutId = setTimeout(checkReferrer, 500);
    return () => clearTimeout(timeoutId);
  }, [referredByPhone]);

  // Get user location (simplified - in production use a map picker)
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

  const onSubmit = async (data: RegistrationFormData) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create customer");
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
        <CardTitle>Register New Customer</CardTitle>
        <CardDescription>Fill in the customer information below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="081234567890"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Address Information</h3>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Jl. Example No. 123"
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
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

          {/* Bank Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Bank Information</h3>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input
                id="bankName"
                {...register("bankName")}
                placeholder="Bank BCA"
              />
              {errors.bankName && (
                <p className="text-sm text-red-500">{errors.bankName.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Account Number *</Label>
                <Input
                  id="bankAccount"
                  {...register("bankAccount")}
                  placeholder="1234567890"
                />
                {errors.bankAccount && (
                  <p className="text-sm text-red-500">{errors.bankAccount.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankHolder">Account Holder Name *</Label>
                <Input
                  id="bankHolder"
                  {...register("bankHolder")}
                  placeholder="John Doe"
                />
                {errors.bankHolder && (
                  <p className="text-sm text-red-500">{errors.bankHolder.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Referral Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Referral (Optional)</h3>
            <div className="space-y-2">
              <Label htmlFor="referredByPhone">Referred By Phone</Label>
              <Input
                id="referredByPhone"
                {...register("referredByPhone")}
                placeholder="081234567890"
              />
              {referrerName && (
                <p className="text-sm text-green-600">✓ Found: {referrerName}</p>
              )}
              {errors.referredByPhone && (
                <p className="text-sm text-red-500">{errors.referredByPhone.message}</p>
              )}
            </div>
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
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Customer
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
