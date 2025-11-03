import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-export";
import { prisma } from "@/lib/prisma";
import { syncOrderToSheets } from "@/lib/sheets";
import { BillingStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    // Get billing with order details
    const billing = await prisma.billing.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            customer: {
              select: {
                name: true,
                phone: true,
              },
            },
            courier: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!billing) {
      return NextResponse.json(
        { error: "Billing not found for this order" },
        { status: 404 }
      );
    }

    if (billing.status !== BillingStatus.PAID) {
      return NextResponse.json(
        { error: "Can only sync paid billings" },
        { status: 400 }
      );
    }

    const totalAmount = Number(
      billing.order.customerAmount ||
        billing.totalLiters * Number(billing.pricePerLiter)
    );

    const success = await syncOrderToSheets({
      orderNumber: billing.order.orderNumber,
      date: billing.paidAt || billing.createdAt,
      customerName: billing.order.customer.name,
      customerPhone: billing.order.customer.phone,
      courierName: billing.order.courier?.name || null,
      liters: billing.totalLiters,
      pricePerLiter: Number(billing.pricePerLiter),
      totalAmount,
    });

    return NextResponse.json({
      success,
      message: success
        ? "Order synced to Google Sheets successfully"
        : "Failed to sync order to Google Sheets",
    });
  } catch (error) {
    console.error("Error syncing to sheets:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

