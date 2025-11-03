import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-export";
import { generateBilling } from "@/lib/billing";
import { z } from "zod";

const generateBillingSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  actualLiters: z.number().positive("Actual liters must be greater than 0"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = generateBillingSchema.parse(body);

    const billing = await generateBilling(
      validatedData.orderId,
      validatedData.actualLiters
    );

    // Fetch the complete billing with order details
    const { prisma } = await import("@/lib/prisma");
    const billingWithDetails = await prisma.billing.findUnique({
      where: { id: billing.id },
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
    });

    return NextResponse.json(billingWithDetails, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error generating billing:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

