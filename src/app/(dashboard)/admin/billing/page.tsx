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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, FileText } from "lucide-react";
import { BillingDetailDialog } from "@/components/billing/billing-detail-dialog";
import { GenerateBillingDialog } from "@/components/billing/generate-billing-dialog";
import { SelectOrderDialog } from "@/components/billing/select-order-dialog";
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

export default function BillingPage() {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BillingStatus | "all">("all");
  const [search, setSearch] = useState("");

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);

  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isSelectOrderDialogOpen, setIsSelectOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    orderNumber: string;
    actualLiters: number | null;
    customer: { name: string; phone: string };
  } | null>(null);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const fetchBillings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "all") query.append("status", statusFilter);
      if (search) query.append("search", search);

      const response = await fetch(`/api/billing?${query.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch billings");
      }

      setBillings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillings();
  }, [statusFilter, search]);

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

  const handleViewDetails = (billing: Billing) => {
    setSelectedBilling(billing);
    setIsDetailDialogOpen(true);
  };

  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [isSelectOrderDialogOpen, setIsSelectOrderDialogOpen] = useState(false);

  const fetchAvailableOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await fetch("/api/orders/completed-unbilled");
      const data = await response.json();
      if (response.ok) {
        setAvailableOrders(data);
      }
    } catch (err) {
      console.error("Error fetching available orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleGenerateBilling = () => {
    fetchAvailableOrders();
    setIsSelectOrderDialogOpen(true);
  };

  const handleSelectOrder = (order: any) => {
    setSelectedOrder({
      id: order.id,
      orderNumber: order.orderNumber,
      actualLiters: order.actualLiters,
      customer: order.customer,
    });
    setIsSelectOrderDialogOpen(false);
    setIsGenerateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage billing and payments for orders
          </p>
        </div>
        <Button onClick={handleGenerateBilling}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Billing
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by bill number, order number, or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(value: BillingStatus | "all") =>
            setStatusFilter(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(BillingStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading billings...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill Number</TableHead>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Liters</TableHead>
                <TableHead>Customer Amount</TableHead>
                <TableHead>Courier Fee</TableHead>
                <TableHead>Affiliate Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No billings found.
                  </TableCell>
                </TableRow>
              ) : (
                billings.map((billing) => (
                  <TableRow key={billing.id}>
                    <TableCell className="font-medium">
                      {billing.billNumber}
                    </TableCell>
                    <TableCell>{billing.order.orderNumber}</TableCell>
                    <TableCell>
                      {billing.order.customer.name} <br />
                      <span className="text-sm text-muted-foreground">
                        ({billing.order.customer.phone})
                      </span>
                    </TableCell>
                    <TableCell>{billing.totalLiters} L</TableCell>
                    <TableCell>
                      {formatCurrency(billing.order.customerAmount)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(billing.order.courierFee)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(billing.order.affiliateFee)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getStatusBadgeVariant(billing.status) as
                            | "default"
                            | "secondary"
                            | "destructive"
                            | "outline"
                        }
                      >
                        {billing.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(billing)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedBilling && (
        <BillingDetailDialog
          billing={selectedBilling}
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
          onSuccess={() => {
            fetchBillings();
            setIsDetailDialogOpen(false);
          }}
        />
      )}

      <SelectOrderDialog
        orders={availableOrders}
        isOpen={isSelectOrderDialogOpen}
        onClose={() => setIsSelectOrderDialogOpen(false)}
        onSelect={handleSelectOrder}
        isLoading={isLoadingOrders}
      />

      {selectedOrder && (
        <GenerateBillingDialog
          order={selectedOrder}
          isOpen={isGenerateDialogOpen}
          onClose={() => {
            setIsGenerateDialogOpen(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            fetchBillings();
            setIsGenerateDialogOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
