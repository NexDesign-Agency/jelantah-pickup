"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Upload } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { BillingStatus } from "@prisma/client";

type Billing = {
  id: string;
  billNumber: string;
  totalLiters: number;
  pricePerLiter: number;
  fees: number | null;
  status: BillingStatus;
  paymentProofUrl: string | null;
  paidAt: Date | null;
  createdAt: Date;
  order: {
    id: string;
    orderNumber: string;
    customerAmount: number | null;
    courierFee: number | null;
    affiliateFee: number | null;
    customer: {
      id: string;
      name: string;
      phone: string;
    };
    courier: {
      id: string;
      name: string;
    } | null;
  };
};

interface BillingDetailDialogProps {
  billing: Billing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BillingDetailDialog({
  billing,
  isOpen,
  onClose,
  onSuccess,
}: BillingDetailDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState(
    billing.paymentProofUrl || ""
  );

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: BillingStatus) => {
    switch (status) {
      case BillingStatus.PENDING:
        return "yellow";
      case BillingStatus.PAID:
        return "green";
      case BillingStatus.FAILED:
        return "red";
      case BillingStatus.REFUNDED:
        return "gray";
      default:
        return "gray";
    }
  };

  const handleMarkPaid = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/billing/${billing.id}/pay`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentProofUrl: paymentProofUrl || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to mark billing as paid");
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Billing Details: {billing.billNumber}</DialogTitle>
          <DialogDescription>
            Detailed information about the billing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge
              variant={
                getStatusBadgeVariant(billing.status) as
                  | "default"
                  | "secondary"
                  | "destructive"
                  | "outline"
              }
            >
              {billing.status}
            </Badge>
          </div>

          {/* Order Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">Order Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Order Number
                </p>
                <p className="font-semibold">{billing.order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Customer
                </p>
                <p className="font-semibold">
                  {billing.order.customer.name} ({billing.order.customer.phone})
                </p>
              </div>
              {billing.order.courier && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Courier
                  </p>
                  <p className="font-semibold">{billing.order.courier.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Billing Details */}
          <div className="space-y-2">
            <h3 className="font-semibold">Billing Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Liters
                </p>
                <p className="font-semibold">{billing.totalLiters} L</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Price per Liter
                </p>
                <p className="font-semibold">
                  {formatCurrency(Number(billing.pricePerLiter))}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Customer Amount
                </p>
                <p className="font-semibold text-lg text-primary">
                  {formatCurrency(billing.order.customerAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Courier Fee
                </p>
                <p className="font-semibold">
                  {formatCurrency(billing.order.courierFee)}
                </p>
              </div>
              {billing.order.affiliateFee && billing.order.affiliateFee > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Affiliate Fee
                  </p>
                  <p className="font-semibold">
                    {formatCurrency(billing.order.affiliateFee)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          {billing.status === BillingStatus.PENDING && (
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="font-semibold">Mark as Paid</h3>
              <div className="space-y-2">
                <Label htmlFor="paymentProofUrl">
                  Payment Proof URL (Optional)
                </Label>
                <Input
                  id="paymentProofUrl"
                  type="url"
                  placeholder="https://example.com/proof.jpg"
                  value={paymentProofUrl}
                  onChange={(e) => setPaymentProofUrl(e.target.value)}
                />
              </div>
              <Button
                onClick={handleMarkPaid}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Mark as Paid
              </Button>
            </div>
          )}

          {billing.status === BillingStatus.PAID && (
            <div className="space-y-2">
              <h3 className="font-semibold">Payment Information</h3>
              {billing.paymentProofUrl && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Payment Proof
                  </p>
                  <a
                    href={billing.paymentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Proof
                  </a>
                </div>
              )}
              {billing.paidAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Paid At
                  </p>
                  <p className="font-semibold">
                    {format(new Date(billing.paidAt), "PPP p")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="font-semibold">
                {format(new Date(billing.createdAt), "PPP p")}
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

