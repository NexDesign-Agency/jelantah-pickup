# PowerShell Script untuk Setup PostgreSQL di Windows
# Jalankan script ini: .\setup-postgres.ps1

Write-Host "=== Setup PostgreSQL untuk Jelantah Pickup ===" -ForegroundColor Cyan
Write-Host ""

# Cek apakah Docker tersedia
$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerAvailable) {
    Write-Host "✅ Docker ditemukan!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Menggunakan Docker untuk menjalankan PostgreSQL..." -ForegroundColor Yellow
    
    # Cek apakah container sudah ada
    $containerExists = docker ps -a --filter "name=jelantah-postgres" --format "{{.Names}}"
    
    if ($containerExists -eq "jelantah-postgres") {
        Write-Host "Container PostgreSQL sudah ada. Menjalankan container..." -ForegroundColor Yellow
        docker start jelantah-postgres
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL container berhasil dijalankan!" -ForegroundColor Green
            Write-Host "Menunggu PostgreSQL siap (10 detik)..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        } else {
            Write-Host "❌ Gagal menjalankan container. Coba jalankan: docker start jelantah-postgres" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Membuat container PostgreSQL baru..." -ForegroundColor Yellow
        docker run --name jelantah-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=jelantah_pickup -p 5432:5432 -d postgres:16
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL container berhasil dibuat dan dijalankan!" -ForegroundColor Green
            Write-Host "Menunggu PostgreSQL siap (15 detik)..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
        } else {
            Write-Host "❌ Gagal membuat container. Pastikan Docker Desktop berjalan." -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host ""
    Write-Host "✅ PostgreSQL siap digunakan!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Langkah selanjutnya:" -ForegroundColor Cyan
    Write-Host "1. Jalankan: npx prisma migrate dev --name init" -ForegroundColor White
    Write-Host "2. (Optional) Jalankan: npm run seed" -ForegroundColor White
    
} else {
    Write-Host "⚠️  Docker tidak ditemukan." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pilih salah satu metode setup:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "METODE 1: Install Docker Desktop (Disarankan)" -ForegroundColor Yellow
    Write-Host "1. Download: https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host "2. Install Docker Desktop" -ForegroundColor White
    Write-Host "3. Restart komputer" -ForegroundColor White
    Write-Host "4. Jalankan script ini lagi: .\setup-postgres.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "METODE 2: Install PostgreSQL Langsung" -ForegroundColor Yellow
    Write-Host "1. Download: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "2. Install PostgreSQL (catat password untuk user 'postgres')" -ForegroundColor White
    Write-Host "3. Update file .env dengan password yang benar" -ForegroundColor White
    Write-Host "4. Buat database: CREATE DATABASE jelantah_pickup;" -ForegroundColor White
    Write-Host "   (Gunakan pgAdmin 4 atau SQL Shell)" -ForegroundColor White
    Write-Host "5. Jalankan: npx prisma migrate dev --name init" -ForegroundColor White
    Write-Host ""
    Write-Host "METODE 3: Gunakan PostgreSQL Online (Supabase/Neon)" -ForegroundColor Yellow
    Write-Host "1. Daftar di https://supabase.com atau https://neon.tech" -ForegroundColor White
    Write-Host "2. Buat project baru dan ambil connection string" -ForegroundColor White
    Write-Host "3. Update DATABASE_URL di file .env dengan connection string dari provider" -ForegroundColor White
    Write-Host "4. Jalankan: npx prisma migrate dev --name init" -ForegroundColor White
}

