import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-export";
import { z } from "zod";
import { BillingStatus } from "@prisma/client";
import { sendPaymentReceivedEmail } from "@/lib/email";
import { syncOrderToSheets } from "@/lib/sheets";

const markPaidSchema = z.object({
  paymentProofUrl: z.string().url("Invalid URL").optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = markPaidSchema.parse(body);

    // Get billing with order details
    const billing = await prisma.billing.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                referredBy: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            courier: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!billing) {
      return NextResponse.json({ error: "Billing not found" }, { status: 404 });
    }

    if (billing.status === BillingStatus.PAID) {
      return NextResponse.json(
        { error: "Billing is already paid" },
        { status: 400 }
      );
    }

    // Update billing and create notifications in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update billing
      const updatedBilling = await tx.billing.update({
        where: { id },
        data: {
          status: BillingStatus.PAID,
          paymentProofUrl: validatedData.paymentProofUrl || null,
          paidAt: new Date(),
        },
      });

      // Create notification for customer
      await tx.notification.create({
        data: {
          userId: billing.order.customerId,
          title: "Payment Received",
          message: `Your payment for billing ${billing.billNumber} has been confirmed. Thank you!`,
          type: "payment",
        },
      });

      // Create notification for courier if exists
      if (billing.order.courierId) {
        await tx.notification.create({
          data: {
            userId: billing.order.courierId,
            title: "Payment Confirmed",
            message: `Payment for order ${billing.order.orderNumber} has been confirmed. Your fee will be processed.`,
            type: "payment",
          },
        });
      }

      return updatedBilling;
    });

    // Send payment received emails
    const totalAmount = Number(
      billing.order.customerAmount || billing.totalLiters * Number(billing.pricePerLiter)
    );

    await sendPaymentReceivedEmail({
      customerEmail: billing.order.customer.email || undefined,
      customerName: billing.order.customer.name,
      courierEmail: billing.order.courier?.email || undefined,
      affiliateEmail: billing.order.customer.referredBy?.email || undefined,
      orderNumber: billing.order.orderNumber,
      billNumber: billing.billNumber,
      totalAmount,
    });

    // Sync to Google Sheets (async, don't wait for it)
    syncOrderToSheets({
      orderNumber: billing.order.orderNumber,
      date: new Date(),
      customerName: billing.order.customer.name,
      customerPhone: billing.order.customer.phone,
      courierName: billing.order.courier?.name || null,
      liters: billing.totalLiters,
      pricePerLiter: Number(billing.pricePerLiter),
      totalAmount,
    }).catch((error) => {
      console.error("Failed to sync to Google Sheets:", error);
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error marking billing as paid:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

