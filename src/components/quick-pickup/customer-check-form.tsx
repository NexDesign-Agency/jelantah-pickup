"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

interface CustomerCheckFormProps {
  onCustomerFound: (customer: any) => void;
  onCustomerNotFound: (phone: string) => void;
}

export function CustomerCheckForm({
  onCustomerFound,
  onCustomerNotFound,
}: CustomerCheckFormProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/customers/check-phone?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check customer");
      }

      if (data.exists && data.customer) {
        onCustomerFound(data.customer);
      } else {
        onCustomerNotFound(phone);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check Customer</CardTitle>
        <CardDescription>Enter phone number to check if customer exists</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCheck} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Check
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
