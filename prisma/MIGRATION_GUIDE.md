# Prisma Migration Guide

## Database Setup

### 1. Create `.env` file

Create a `.env` file in the root directory with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/jelantah_pickup?schema=public"
```

### 2. Run Migration

Once your `.env` file is configured with a valid `DATABASE_URL`, run:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the migration SQL file in `prisma/migrations/`
- Apply the migration to your database
- Generate the Prisma Client

### 3. (Optional) Generate Prisma Client Only

If you only need to regenerate the Prisma Client after schema changes:

```bash
npx prisma generate
```

## Schema Overview

The schema includes:

- **User**: Multi-role system (ADMIN, CUSTOMER, COURIER, WAREHOUSE)
- **Order**: Order management with status workflow
- **Billing**: Payment and billing information
- **PricingTier**: Dynamic pricing based on liters
- **Notification**: User notification system
- **Settings**: Application settings storage

All tables are properly indexed for performance optimization.

