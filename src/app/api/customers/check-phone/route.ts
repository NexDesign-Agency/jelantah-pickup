import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { UserRole } from "@prisma/client";

export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const customer = await prisma.user.findUnique({
      where: {
        phone: phone,
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
      },
    });

    return NextResponse.json({
      exists: !!customer,
      customer: customer || null,
    });
  } catch (error) {
    console.error("Error checking customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
