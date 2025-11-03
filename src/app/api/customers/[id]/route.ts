import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { UserRole, OrderStatus } from "@prisma/client";

const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankHolder: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: UserRole.CUSTOMER,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        district: true,
        city: true,
        latitude: true,
        longitude: true,
        bankName: true,
        bankAccount: true,
        bankHolder: true,
        referredById: true,
        createdAt: true,
        referredBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        ordersAsCustomer: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            estimatedLiters: true,
            actualLiters: true,
            createdAt: true,
            completedDate: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        referredUsers: {
          select: {
            id: true,
            name: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Calculate aggregations
    const totalLiters = customer.ordersAsCustomer
      .filter((o) => o.status === OrderStatus.COMPLETED && o.actualLiters)
      .reduce((sum, o) => sum + (o.actualLiters || 0), 0);

    const downlineCount = customer.referredUsers.length;
    const lastOrderDate =
      customer.ordersAsCustomer.length > 0
        ? customer.ordersAsCustomer[0].createdAt
        : null;

    // Calculate isActive (active if last order was within 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const isActive = lastOrderDate && new Date(lastOrderDate) >= thirtyDaysAgo;

    return NextResponse.json({
      ...customer,
      totalLiters,
      downlineCount,
      lastOrderDate,
      isActive: !!isActive,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const validatedData = updateCustomerSchema.parse(body);

    // Check if customer exists
    const existingCustomer = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: UserRole.CUSTOMER,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Update customer
    const updatedCustomer = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email !== undefined && {
          email: validatedData.email || null,
        }),
        ...(validatedData.address !== undefined && {
          address: validatedData.address || null,
        }),
        ...(validatedData.district !== undefined && {
          district: validatedData.district || null,
        }),
        ...(validatedData.city !== undefined && {
          city: validatedData.city || null,
        }),
        ...(validatedData.latitude !== undefined && {
          latitude: validatedData.latitude || null,
        }),
        ...(validatedData.longitude !== undefined && {
          longitude: validatedData.longitude || null,
        }),
        ...(validatedData.bankName !== undefined && {
          bankName: validatedData.bankName || null,
        }),
        ...(validatedData.bankAccount !== undefined && {
          bankAccount: validatedData.bankAccount || null,
        }),
        ...(validatedData.bankHolder !== undefined && {
          bankHolder: validatedData.bankHolder || null,
        }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        district: true,
        city: true,
        latitude: true,
        longitude: true,
        bankName: true,
        bankAccount: true,
        bankHolder: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
