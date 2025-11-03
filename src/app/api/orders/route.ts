import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { OrderStatus, UserRole } from "@prisma/client";
import { sendOrderCreatedEmail } from "@/lib/email";

const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  estimatedLiters: z.number().positive().optional(),
  courierId: z.string().uuid().optional(),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  pickupDate: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Verify customer exists
    const customer = await prisma.user.findUnique({
      where: { id: validatedData.customerId, role: UserRole.CUSTOMER },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // If courier is assigned, verify it exists
    let assignedCourier = null;
    if (validatedData.courierId) {
      assignedCourier = await prisma.user.findUnique({
        where: { id: validatedData.courierId, role: UserRole.COURIER },
      });

      if (!assignedCourier) {
        return NextResponse.json(
          { error: "Courier not found" },
          { status: 404 }
        );
      }
    }

    // Generate order number: ORD-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    const orderNumber = `ORD-${dateStr}-${randomNum}`;

    // Determine status
    const status = validatedData.courierId ? OrderStatus.ASSIGNED : OrderStatus.PENDING;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: validatedData.customerId,
        courierId: validatedData.courierId || null,
        status,
        estimatedLiters: validatedData.estimatedLiters || null,
        address: validatedData.pickupAddress,
        district: validatedData.district,
        city: validatedData.city,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        pickupDate: validatedData.pickupDate ? new Date(validatedData.pickupDate) : null,
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

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: customer.id,
        title: "New Pickup Order Created",
        message: `Your pickup order ${orderNumber} has been created. ${status === OrderStatus.ASSIGNED ? "A courier has been assigned." : "Waiting for courier assignment."}`,
        type: "order_update",
      },
    });

    // Send email to customer
    if (customer.email) {
      await sendOrderCreatedEmail({
        customerEmail: customer.email,
        customerName: customer.name,
        orderNumber,
        pickupAddress: validatedData.pickupAddress,
        estimatedLiters: validatedData.estimatedLiters || undefined,
      });
    }

    // Create notification for courier if assigned
    if (assignedCourier) {
      await prisma.notification.create({
        data: {
          userId: assignedCourier.id,
          title: "New Order Assigned",
          message: `You have been assigned to pickup order ${orderNumber} for ${customer.name}.`,
          type: "order_update",
        },
      });

      // Send email to courier and customer (courier assigned)
      if (assignedCourier.email || customer.email) {
        const { sendCourierAssignedEmail } = await import("@/lib/email");
        await sendCourierAssignedEmail({
          customerEmail: customer.email || undefined,
          customerName: customer.name,
          courierEmail: assignedCourier.email || undefined,
          courierName: assignedCourier.name,
          courierPhone: assignedCourier.phone,
          orderNumber,
          pickupAddress: validatedData.pickupAddress,
        });
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      // Support comma-separated statuses for filtering (e.g., "ASSIGNED,IN_PROGRESS")
      const statusList = status.split(",").map((s) => s.trim());
      const validStatuses = Object.values(OrderStatus);
      const filteredStatuses = statusList.filter((s) =>
        validStatuses.includes(s as OrderStatus)
      );

      if (filteredStatuses.length === 1) {
        where.status = filteredStatuses[0] as OrderStatus;
      } else if (filteredStatuses.length > 1) {
        where.status = { in: filteredStatuses as OrderStatus[] };
      }
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
