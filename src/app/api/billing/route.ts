import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { BillingStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};

    if (status) {
      const validStatuses = Object.values(BillingStatus);
      if (validStatuses.includes(status as BillingStatus)) {
        where.status = status as BillingStatus;
      }
    }

    if (search) {
      where.OR = [
        { billNumber: { contains: search, mode: "insensitive" } },
        {
          order: {
            orderNumber: { contains: search, mode: "insensitive" },
          },
        },
        {
          order: {
            customer: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    const billings = await prisma.billing.findMany({
      where,
      include: {
        order: {
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(billings);
  } catch (error) {
    console.error("Error fetching billings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

