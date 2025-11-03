# PostgreSQL Setup Guide untuk Windows

## Cara 1: Install PostgreSQL Langsung di Windows

### Langkah 1: Download PostgreSQL
1. Kunjungi https://www.postgresql.org/download/windows/
2. Download PostgreSQL installer untuk Windows
3. Atau gunakan link langsung: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

### Langkah 2: Install PostgreSQL
1. Jalankan installer yang telah didownload
2. Pilih lokasi instalasi (default: `C:\Program Files\PostgreSQL\18` atau `16` atau versi terbaru)
3. Set password untuk user `postgres` (catat password ini!)
4. Pilih port (default: `5432`)
5. Pilih locale (bisa pilih `Default locale` atau `Indonesian, Indonesia`)
6. Tunggu hingga instalasi selesai

### Langkah 3: Tambahkan PostgreSQL ke PATH (Opsional)
1. Buka **System Properties** → **Environment Variables**
2. Edit **Path** di **System variables**
3. Tambahkan: `C:\Program Files\PostgreSQL\18\bin` (sesuaikan versi: `18`, `16`, `15`, dll)
4. Restart PowerShell/Command Prompt

### Langkah 4: Buat Database
Setelah PostgreSQL terinstall, buka **SQL Shell (psql)** atau **pgAdmin 4** dan jalankan:

```sql
CREATE DATABASE jelantah_pickup;
```

Atau via command line (setelah ditambahkan ke PATH):
```bash
psql -U postgres
# Masukkan password
CREATE DATABASE jelantah_pickup;
\q
```

## Cara 2: Install via Docker (Lebih Mudah)

### Prerequisites
Install Docker Desktop untuk Windows: https://www.docker.com/products/docker-desktop

### Langkah 1: Jalankan PostgreSQL Container
```bash
docker run --name jelantah-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=jelantah_pickup -p 5432:5432 -d postgres:16
```

### Langkah 2: Verifikasi Container Berjalan
```bash
docker ps
```

### Langkah 3: Update .env
Pastikan file `.env` memiliki konfigurasi:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jelantah_pickup?schema=public"
```

## Setup Database dengan Prisma

Setelah PostgreSQL berjalan dan database dibuat, jalankan:

```bash
# Generate Prisma Client
npx prisma generate

# Buat migration dan apply ke database
npx prisma migrate dev --name init

# (Optional) Seed database dengan data demo
npm run seed
```

## Troubleshooting

### Error: Connection refused
- Pastikan PostgreSQL service berjalan (Services → postgresql-x64-16)
- Atau untuk Docker: `docker start jelantah-postgres`

### Error: Password authentication failed
- Cek password di file `.env` sesuai dengan password yang di-set saat install
- Default Docker: `postgres`

### Error: Database does not exist
- Pastikan database `jelantah_pickup` sudah dibuat
- Atau gunakan Docker yang otomatis membuat database

