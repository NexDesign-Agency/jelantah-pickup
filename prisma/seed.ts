import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

// Use Prisma singleton for seeding
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

async function main() {
  console.log("🌱 Seeding database...");

  // Hash passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const courierPassword = await bcrypt.hash("kurir123", 10);
  const warehousePassword = await bcrypt.hash("warehouse123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { phone: "admin" },
    update: {},
    create: {
      phone: "admin",
      name: "Admin User",
      email: "admin@jelantah.com",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log("✅ Created admin user:", admin.phone);

  // Create courier user
  const courier = await prisma.user.upsert({
    where: { phone: "kurir1" },
    update: {},
    create: {
      phone: "kurir1",
      name: "Kurir 1",
      email: "kurir1@jelantah.com",
      password: courierPassword,
      role: UserRole.COURIER,
    },
  });
  console.log("✅ Created courier user:", courier.phone);

  // Create warehouse user
  const warehouse = await prisma.user.upsert({
    where: { phone: "warehouse" },
    update: {},
    create: {
      phone: "warehouse",
      name: "Warehouse Staff",
      email: "warehouse@jelantah.com",
      password: warehousePassword,
      role: UserRole.WAREHOUSE,
    },
  });
  console.log("✅ Created warehouse user:", warehouse.phone);

  // Create sample customer
  const customer = await prisma.user.upsert({
    where: { phone: "081234567890" },
    update: {},
    create: {
      phone: "081234567890",
      name: "Customer Sample",
      email: "customer@example.com",
      password: customerPassword,
      role: UserRole.CUSTOMER,
      address: "Jl. Contoh No. 123",
      district: "Kebayoran Baru",
      city: "Jakarta Selatan",
      latitude: -6.2442,
      longitude: 106.7998,
      bankName: "Bank BCA",
      bankAccount: "1234567890",
      bankHolder: "Customer Sample",
    },
  });
  console.log("✅ Created customer user:", customer.phone);

  // Create pricing tiers
  const pricingTiers = [
    {
      minLiters: 1,
      maxLiters: 99,
      pricePerLiter: 6500,
      isActive: true,
    },
    {
      minLiters: 100,
      maxLiters: 200,
      pricePerLiter: 7000,
      isActive: true,
    },
    {
      minLiters: 201,
      maxLiters: null,
      pricePerLiter: 7500,
      isActive: true,
    },
  ];

  // Clear existing tiers and create new ones
  await prisma.pricingTier.deleteMany({});
  
  for (const tier of pricingTiers) {
    await prisma.pricingTier.create({
      data: tier,
    });
  }
  console.log("✅ Created pricing tiers");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

