"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@prisma/client";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        phone,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Map NextAuth errors to user-friendly messages
        const errorMessages: Record<string, string> = {
          CredentialsSignin: "Invalid phone number or password. Please try again.",
          Default: "An error occurred during login. Please try again.",
        };
        setError(errorMessages[result.error] || errorMessages.Default);
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Fetch session to get role, then redirect
        const sessionResult = await fetch("/api/auth/session");
        const session = await sessionResult.json();

        const role = session?.user?.role as UserRole;
        const dashboardMap: Record<UserRole, string> = {
          ADMIN: "/admin",
          CUSTOMER: "/customer",
          COURIER: "/courier",
          WAREHOUSE: "/warehouse",
        };

        const redirectPath = dashboardMap[role] || "/";
        window.location.href = redirectPath;
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your phone and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="text"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo Accounts:</p>
            <div className="mt-2 space-y-1">
              <p>admin / admin123</p>
              <p>kurir1 / kurir123</p>
              <p>warehouse / warehouse123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

