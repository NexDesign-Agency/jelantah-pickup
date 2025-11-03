import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-export";
import { z } from "zod";
import { OrderStatus, UserRole } from "@prisma/client";
import { sendPickupCompletedEmail } from "@/lib/email";

const verifyOrderSchema = z.object({
  actualLiters: z.number().positive("Actual liters must be greater than 0"),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "WAREHOUSE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = verifyOrderSchema.parse(body);

    // Get order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        courier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only verify orders that are IN_PROGRESS or ASSIGNED
    if (order.status !== OrderStatus.IN_PROGRESS && order.status !== OrderStatus.ASSIGNED) {
      return NextResponse.json(
        { error: `Cannot verify order with status: ${order.status}. Order must be ASSIGNED or IN_PROGRESS.` },
        { status: 400 }
      );
    }

    // Update order to COMPLETED with actual liters
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        actualLiters: validatedData.actualLiters,
        status: OrderStatus.COMPLETED,
        completedDate: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        courier: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // Create notifications
    // Notification for customer
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: "Order Verified",
        message: `Your order ${order.orderNumber} has been verified. Actual liters: ${validatedData.actualLiters} L.`,
        type: "order_update",
      },
    });

    // Notification for courier if exists
    if (order.courierId) {
      await prisma.notification.create({
        data: {
          userId: order.courierId,
          title: "Order Verified",
          message: `Order ${order.orderNumber} has been verified at warehouse. Actual liters: ${validatedData.actualLiters} L.`,
          type: "order_update",
        },
      });
    }

    // Send email to customer and courier
    await sendPickupCompletedEmail({
      customerEmail: updatedOrder.customer.email || undefined,
      customerName: updatedOrder.customer.name,
      courierEmail: updatedOrder.courier?.email || undefined,
      orderNumber: updatedOrder.orderNumber,
      actualLiters: validatedData.actualLiters,
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error verifying order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

