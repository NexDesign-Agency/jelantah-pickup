import { prisma } from "@/lib/prisma";
import { OrderStatus, BillingStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { getPricePerLiter } from "./calculations";

interface BillingCalculation {
  customerAmount: Decimal;
  courierFee: Decimal;
  affiliateFee: Decimal;
}

/**
 * Calculate billing amounts based on liters and pricing
 */
function calculateBillingAmounts(
  liters: number,
  pricePerLiter: number,
  hasReferrer: boolean
): BillingCalculation {
  const customerAmount = new Decimal(liters).mul(pricePerLiter);
  const courierFee = new Decimal(liters).mul(1000); // Fixed fee: Rp 1,000 per liter
  const affiliateFee = hasReferrer ? new Decimal(liters).mul(200) : new Decimal(0); // Rp 200 per liter if has referrer

  return {
    customerAmount,
    courierFee,
    affiliateFee,
  };
}

/**
 * Generate billing for a completed order
 * This function:
 * 1. Gets order with customer (check if has referrer)
 * 2. Gets price per liter from tiers
 * 3. Calculates amounts
 * 4. Generates billNumber
 * 5. Creates billing record
 * 6. Updates order status and amounts
 * 7. Creates notifications
 */
export async function generateBilling(
  orderId: string,
  actualLiters: number
) {
  if (actualLiters <= 0) {
    throw new Error("Actual liters must be greater than 0");
  }

  // 1. Get order with customer and check if has referrer
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        include: {
          referredBy: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      },
      courier: {
        select: {
          id: true,
          name: true,
        },
      },
      billing: true, // Check if billing already exists
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.billing) {
    throw new Error("Billing already exists for this order");
  }

  // Only generate billing for COMPLETED orders
  if (order.status !== OrderStatus.COMPLETED) {
    throw new Error(
      `Cannot generate billing for order with status: ${order.status}. Order must be COMPLETED.`
    );
  }

  // 2. Get price per liter from tiers
  const pricePerLiter = await getPricePerLiter(actualLiters);

  // 3. Calculate amounts
  const hasReferrer = !!order.customer.referredBy;
  const { customerAmount, courierFee, affiliateFee } =
    calculateBillingAmounts(actualLiters, pricePerLiter, hasReferrer);

  // 4. Generate billNumber: BILL-YYYYMMDD-XXXX
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.billing.count({
    where: {
      createdAt: {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        lt: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        ),
      },
    },
  });
  const billNumber = `BILL-${dateStr}-${(count + 1).toString().padStart(4, "0")}`;

  // 5. Create billing record and update order in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create billing
    const billing = await tx.billing.create({
      data: {
        billNumber,
        orderId: order.id,
        totalLiters: actualLiters,
        pricePerLiter: pricePerLiter,
        fees: affiliateFee, // Store affiliate fee in fees field
        status: BillingStatus.PENDING,
      },
    });

    // Update order with amounts (status remains COMPLETED, billing tracks payment)
    await tx.order.update({
      where: { id: order.id },
      data: {
        actualLiters,
        customerAmount: customerAmount,
        courierFee: courierFee,
        affiliateFee: affiliateFee,
        // Status remains COMPLETED - billing status tracks payment
      },
    });

    // 7. Create notifications
    // Notification for customer
    await tx.notification.create({
      data: {
        userId: order.customerId,
        title: "Billing Generated",
        message: `Your billing ${billNumber} has been generated. Total amount: Rp ${Number(customerAmount).toLocaleString("id-ID")}`,
        type: "billing",
      },
    });

      // Notification for courier if exists
      if (order.courierId) {
        await tx.notification.create({
          data: {
            userId: order.courierId,
            title: "Courier Fee Calculated",
            message: `Courier fee for order ${order.orderNumber}: Rp ${Number(courierFee).toLocaleString("id-ID")}`,
            type: "billing",
          },
        });
      }

      // Notification for referrer if exists
      if (order.customer.referredBy) {
        await tx.notification.create({
          data: {
            userId: order.customer.referredBy.id,
            title: "Affiliate Fee Earned",
            message: `You earned an affiliate fee of Rp ${Number(affiliateFee).toLocaleString("id-ID")} for referral of ${order.customer.name}`,
            type: "affiliate",
          },
        });
      }

    return billing;
  });

  return result;
}

