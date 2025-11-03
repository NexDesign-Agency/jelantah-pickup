# Jelantah Pickup

A Next.js 14 application with TypeScript, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui**
- **Prisma** (ORM)
- **NextAuth v5** (Authentication)
- **React Hook Form** + **Zod** (Form handling & validation)
- **bcryptjs** (Password hashing)
- **ESLint** + **Prettier** (Code quality)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Setup Environment Variables

File `.env` sudah dibuat dengan konfigurasi default. Jika perlu mengubah, edit file `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jelantah_pickup?schema=public"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**Catatan**: Ubah password di `DATABASE_URL` sesuai dengan password PostgreSQL Anda.

### Setup PostgreSQL

PostgreSQL belum terinstall. Pilih salah satu metode:

#### Metode 1: Menggunakan Script Helper (Disarankan)
```bash
# Jalankan script setup otomatis
.\setup-postgres.ps1
```

Script akan:
- Otomatis detect Docker (jika tersedia)
- Membuat dan menjalankan PostgreSQL container
- Memberikan instruksi lanjutan

#### Metode 2: Install PostgreSQL Manual
**Panduan lengkap**: Lihat `INSTALL_POSTGRES_WINDOWS.md`

**Langkah cepat:**
1. Download & Install PostgreSQL: https://www.postgresql.org/download/windows/
   - Saat install, **catat password** untuk user `postgres`
   - Pastikan PostgreSQL service berjalan (cek di Windows Services)
2. **Setup database otomatis** (setelah PostgreSQL terinstall):
   ```bash
   .\setup-database.ps1
   ```
   Script akan membuat database dan update `.env` jika diperlukan.
   
   **Atau manual via pgAdmin 4:**
   - Buka pgAdmin 4 (terinstall bersama PostgreSQL)
   - Koneksi ke server → Klik kanan Databases → Create → Database
   - Nama: `jelantah_pickup` → Save

#### Metode 3: Menggunakan PostgreSQL Online
1. Daftar di [Supabase](https://supabase.com) atau [Neon](https://neon.tech)
2. Ambil connection string dari dashboard
3. Update `DATABASE_URL` di file `.env`

### Initialize Database

Setelah PostgreSQL berjalan, jalankan:

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name init

# (Optional) Seed database with demo accounts
npm run seed
```

**Status Saat Ini**: 
- ✅ Prisma Client sudah di-generate
- ✅ File `.env` sudah dibuat
- ⏳ PostgreSQL perlu di-setup (jalankan `.\setup-postgres.ps1`)

See `prisma/MIGRATION_GUIDE.md` for detailed migration instructions.

### Demo Accounts

After seeding, you can login with:

- **Admin**: `admin` / `admin123`
- **Courier**: `kurir1` / `kurir123`
- **Warehouse**: `warehouse` / `warehouse123`

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utility functions
└── types/           # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

