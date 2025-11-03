import { prisma } from "@/lib/prisma";

/**
 * Get the price per liter based on the actual liters
 * Finds the matching pricing tier and returns its price per liter
 */
export async function getPricePerLiter(liters: number): Promise<number> {
  if (liters <= 0) {
    throw new Error("Liters must be greater than 0");
  }

  // Find the matching active tier
  // The tier should match: minLiters <= liters <= maxLiters (or maxLiters is null)
  const tiers = await prisma.pricingTier.findMany({
    where: {
      isActive: true,
      minLiters: {
        lte: liters,
      },
      OR: [
        { maxLiters: null },
        { maxLiters: { gte: liters } },
      ],
    },
    orderBy: {
      minLiters: "desc", // Get the highest matching tier
    },
  });

  const tier = tiers[0]; // Get the first (highest minLiters) matching tier

  if (!tier) {
    // Default price if no tier matches (fallback)
    console.warn(`No pricing tier found for ${liters} liters, using default 6500`);
    return 6500;
  }

  return Number(tier.pricePerLiter);
}

