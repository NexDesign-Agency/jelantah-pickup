import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

const updatePricingTierSchema = z.object({
  minLiters: z.number().min(0).optional(),
  maxLiters: z.number().nullable().optional(),
  pricePerLiter: z.number().positive().optional(),
  isActive: z.boolean().optional(),
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
    const validatedData = updatePricingTierSchema.parse(body);

    const tier = await prisma.pricingTier.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(tier);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating pricing tier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await prisma.pricingTier.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Pricing tier deleted" });
  } catch (error) {
    console.error("Error deleting pricing tier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

