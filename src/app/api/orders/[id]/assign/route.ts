import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { OrderStatus, UserRole } from "@prisma/client";
import { sendCourierAssignedEmail } from "@/lib/email";

const assignCourierSchema = z.object({
  courierId: z.string().uuid(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courierId } = assignCourierSchema.parse(body);
    const orderId = params.id;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify courier exists
    const courier = await prisma.user.findUnique({
      where: { id: courierId, role: UserRole.COURIER },
    });

    if (!courier) {
      return NextResponse.json(
        { error: "Courier not found" },
        { status: 404 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        courierId: courierId,
        status: OrderStatus.ASSIGNED,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        courier: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // Create notification for courier
    await prisma.notification.create({
      data: {
        userId: courier.id,
        title: "New Order Assigned",
        message: `You have been assigned to pickup order ${order.orderNumber} for ${order.customer.name}.`,
        type: "order_update",
      },
    });

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: "Courier Assigned",
        message: `A courier has been assigned to your order ${order.orderNumber}.`,
        type: "order_update",
      },
    });

    // Send email to customer and courier
    await sendCourierAssignedEmail({
      customerEmail: order.customer.email || undefined,
      customerName: order.customer.name,
      courierEmail: courier.email || undefined,
      courierName: courier.name,
      courierPhone: courier.phone,
      orderNumber: order.orderNumber,
      pickupAddress: order.address,
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error assigning courier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
