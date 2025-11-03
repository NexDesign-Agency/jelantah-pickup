import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-export";
import { z } from "zod";

const pricingTierSchema = z.object({
  minLiters: z.number().min(0, "Minimum liters must be 0 or greater"),
  maxLiters: z.number().nullable().optional(),
  pricePerLiter: z.number().positive("Price per liter must be positive"),
  isActive: z.boolean().optional().default(true),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tiers = await prisma.pricingTier.findMany({
      orderBy: [
        { minLiters: "asc" },
      ],
    });

    return NextResponse.json(tiers);
  } catch (error) {
    console.error("Error fetching pricing tiers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = pricingTierSchema.parse(body);

    // Check for overlapping tiers (optional validation)
    const existingTiers = await prisma.pricingTier.findMany({
      where: { isActive: true },
    });

    // Create tier
    const tier = await prisma.pricingTier.create({
      data: {
        minLiters: validatedData.minLiters,
        maxLiters: validatedData.maxLiters ?? null,
        pricePerLiter: validatedData.pricePerLiter,
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json(tier, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating pricing tier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

