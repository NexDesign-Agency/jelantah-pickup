import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-export";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    // Verify admin authentication
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const couriers = await prisma.user.findMany({
      where: {
        role: UserRole.COURIER,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(couriers);
  } catch (error) {
    console.error("Error fetching couriers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
