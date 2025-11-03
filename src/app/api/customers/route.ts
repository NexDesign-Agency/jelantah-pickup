import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserRole, OrderStatus } from "@prisma/client";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^[0-9]{10,13}$/, "Invalid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  bankName: z.string().min(1, "Bank name is required"),
  bankAccount: z.string().min(1, "Bank account is required"),
  bankHolder: z.string().min(1, "Bank holder name is required"),
  referredByPhone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = customerSchema.parse(body);

    // Check if phone already exists
    const existingCustomer = await prisma.user.findUnique({
      where: { phone: validatedData.phone },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 }
      );
    }

    // Handle referred by
    let referredById: string | null = null;
    if (validatedData.referredByPhone) {
      const referrer = await prisma.user.findUnique({
        where: { phone: validatedData.referredByPhone },
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // Generate a default password (customer can change later)
    const defaultPassword = await bcrypt.hash("password123", 10);

    // Create customer
    const customer = await prisma.user.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email || null,
        password: defaultPassword,
        role: UserRole.CUSTOMER,
        address: validatedData.address,
        district: validatedData.district,
        city: validatedData.city,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        bankName: validatedData.bankName,
        bankAccount: validatedData.bankAccount,
        bankHolder: validatedData.bankHolder,
        referredById: referredById,
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
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating customer:", error);
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
    const search = searchParams.get("search");
    const status = searchParams.get("status"); // active/inactive

    // Build where clause
    const where: any = {
      role: UserRole.CUSTOMER,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get customers with aggregations
    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        district: true,
        city: true,
        createdAt: true,
        ordersAsCustomer: {
          select: {
            actualLiters: true,
            createdAt: true,
            status: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        referredUsers: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate aggregations and filter by status
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const customersWithStats = customers
      .map((customer) => {
        const completedOrders = customer.ordersAsCustomer.filter(
          (o) => o.status === OrderStatus.COMPLETED && o.actualLiters
        );
        const totalLiters = completedOrders.reduce(
          (sum, o) => sum + (o.actualLiters || 0),
          0
        );

        const downlineCount = customer.referredUsers.length;
        const lastOrderDate =
          customer.ordersAsCustomer.length > 0
            ? customer.ordersAsCustomer[0].createdAt
            : null;

        const isActive =
          lastOrderDate && new Date(lastOrderDate) >= thirtyDaysAgo;

        return {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          district: customer.district,
          city: customer.city,
          totalLiters,
          downlineCount,
          lastOrderDate,
          isActive,
          createdAt: customer.createdAt,
        };
      })
      .filter((customer) => {
        if (status === "active") return customer.isActive;
        if (status === "inactive") return !customer.isActive;
        return true;
      });

    return NextResponse.json(customersWithStats);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
