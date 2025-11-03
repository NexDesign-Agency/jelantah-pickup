"use client";

import { useState } from "react";
import { CustomerCheckForm } from "@/components/quick-pickup/customer-check-form";
import { CustomerRegistrationForm } from "@/components/quick-pickup/customer-registration-form";
import { CreateOrderForm } from "@/components/quick-pickup/create-order-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PackagePlus, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickPickupPage() {
  const [step, setStep] = useState<"check" | "register" | "ready" | "creating" | "created">("check");
  const [customer, setCustomer] = useState<any>(null);
  const [registeredCustomer, setRegisteredCustomer] = useState<any>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [phoneToRegister, setPhoneToRegister] = useState<string>("");
  const router = useRouter();

  const handleCustomerFound = (foundCustomer: any) => {
    setCustomer(foundCustomer);
    setRegisteredCustomer(foundCustomer);
    setStep("ready");
  };

  const handleCustomerNotFound = (phone: string) => {
    setPhoneToRegister(phone);
    setStep("register");
    setCustomer(null);
  };

  const handleRegistrationSuccess = (newCustomer: any) => {
    setRegisteredCustomer(newCustomer);
    setStep("ready");
  };

  const handleCreatePickup = () => {
    setStep("creating");
  };

  const handleOrderSuccess = (order: any) => {
    setCreatedOrder(order);
    setStep("created");
  };

  const handleReset = () => {
    setStep("check");
    setCustomer(null);
    setRegisteredCustomer(null);
    setCreatedOrder(null);
    setPhoneToRegister("");
  };

  const handleViewOrder = () => {
    router.push(`/admin/orders`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quick Pickup</h1>
        <p className="text-muted-foreground mt-2">
          Check customer or register new customer for quick pickup
        </p>
      </div>

      {step === "check" && (
        <CustomerCheckForm
          onCustomerFound={handleCustomerFound}
          onCustomerNotFound={(phone) => handleCustomerNotFound(phone)}
        />
      )}

      {step === "register" && (
        <CustomerRegistrationForm
          initialPhone={phoneToRegister}
          onSuccess={handleRegistrationSuccess}
          onCancel={handleReset}
        />
      )}

      {step === "ready" && registeredCustomer && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Customer {customer ? "Found" : "Registered"} Successfully
            </CardTitle>
            <CardDescription>
              Customer is ready for pickup order creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-semibold">{registeredCustomer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="font-semibold">{registeredCustomer.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="font-semibold">
                  {registeredCustomer.address}, {registeredCustomer.district}, {registeredCustomer.city}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bank</p>
                <p className="font-semibold">{registeredCustomer.bankName}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreatePickup} className="flex-1">
                <PackagePlus className="mr-2 h-4 w-4" />
                Create Pickup Order
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Check Another Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "creating" && registeredCustomer && (
        <CreateOrderForm
          customer={registeredCustomer}
          onSuccess={handleOrderSuccess}
          onCancel={() => setStep("ready")}
        />
      )}

      {step === "created" && createdOrder && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-blue-600" />
              Order Created Successfully!
            </CardTitle>
            <CardDescription>
              Order {createdOrder.orderNumber} has been created
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                <p className="font-semibold">{createdOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="font-semibold">{createdOrder.status}</p>
              </div>
              {createdOrder.estimatedLiters && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estimated Liters</p>
                  <p className="font-semibold">{createdOrder.estimatedLiters} L</p>
                </div>
              )}
              {createdOrder.courier && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Courier</p>
                  <p className="font-semibold">{createdOrder.courier.name}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleViewOrder} className="flex-1">
                View Order Details
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Create Another Pickup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}