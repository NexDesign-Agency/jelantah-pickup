# Script untuk Setup Database setelah PostgreSQL terinstall
# Jalankan: .\setup-database.ps1

Write-Host "=== Setup Database Jelantah Pickup ===" -ForegroundColor Cyan
Write-Host ""

# Cek apakah psql tersedia
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "⚠️  PostgreSQL command line tools tidak ditemukan di PATH." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Tolong:" -ForegroundColor Cyan
    Write-Host "1. Pastikan PostgreSQL sudah terinstall" -ForegroundColor White
    Write-Host "2. Tambahkan PostgreSQL bin ke PATH:" -ForegroundColor White
    Write-Host "   C:\Program Files\PostgreSQL\18\bin" -ForegroundColor Gray
    Write-Host "   (atau C:\Program Files\PostgreSQL\16\bin jika versi 16)" -ForegroundColor Gray
    Write-Host "3. Restart PowerShell" -ForegroundColor White
    Write-Host ""
    Write-Host "Atau gunakan pgAdmin 4 untuk membuat database secara manual." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL command line tools ditemukan!" -ForegroundColor Green
Write-Host ""

# Baca password dari user
Write-Host "Masukkan password untuk user 'postgres':" -ForegroundColor Yellow
$securePassword = Read-Host -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
)

# Test koneksi
Write-Host ""
Write-Host "Menguji koneksi ke PostgreSQL..." -ForegroundColor Yellow

$env:PGPASSWORD = $password
$testConnection = psql -U postgres -h localhost -c "SELECT version();" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Gagal terhubung ke PostgreSQL!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Kemungkinan masalah:" -ForegroundColor Yellow
    Write-Host "1. Password salah" -ForegroundColor White
    Write-Host "2. PostgreSQL service tidak berjalan (cek di Services)" -ForegroundColor White
    Write-Host "3. Port tidak sesuai (default: 5432)" -ForegroundColor White
    Write-Host ""
    $env:PGPASSWORD = ""
    exit 1
}

Write-Host "✅ Koneksi berhasil!" -ForegroundColor Green
Write-Host ""

# Cek apakah database sudah ada
Write-Host "Mengecek apakah database 'jelantah_pickup' sudah ada..." -ForegroundColor Yellow
$dbExists = psql -U postgres -h localhost -tAc "SELECT 1 FROM pg_database WHERE datname='jelantah_pickup'" 2>&1

if ($dbExists -eq "1") {
    Write-Host "⚠️  Database 'jelantah_pickup' sudah ada." -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Apakah Anda ingin menghapus dan membuat ulang? (y/N)"
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Menghapus database yang ada..." -ForegroundColor Yellow
        psql -U postgres -h localhost -c "DROP DATABASE jelantah_pickup;" 2>&1 | Out-Null
        Write-Host "✅ Database lama dihapus." -ForegroundColor Green
    } else {
        Write-Host "Menggunakan database yang sudah ada." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Langkah selanjutnya:" -ForegroundColor Cyan
        Write-Host "1. Update password di file .env jika berbeda" -ForegroundColor White
        Write-Host "2. Jalankan: npx prisma migrate dev --name init" -ForegroundColor White
        $env:PGPASSWORD = ""
        exit 0
    }
}

# Buat database baru
Write-Host "Membuat database 'jelantah_pickup'..." -ForegroundColor Yellow
$createDb = psql -U postgres -h localhost -c "CREATE DATABASE jelantah_pickup;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Gagal membuat database!" -ForegroundColor Red
    Write-Host $createDb -ForegroundColor Red
    $env:PGPASSWORD = ""
    exit 1
}

Write-Host "✅ Database 'jelantah_pickup' berhasil dibuat!" -ForegroundColor Green
Write-Host ""

# Update .env jika password berbeda dari default
$envContent = Get-Content .env -Raw
$defaultPassword = "postgres"

if ($password -ne $defaultPassword) {
    Write-Host "Password berbeda dari default. Update file .env..." -ForegroundColor Yellow
    
    # Escape password untuk URL
    $escapedPassword = [System.Uri]::EscapeDataString($password)
    $newDatabaseUrl = "DATABASE_URL=`"postgresql://postgres:$escapedPassword@localhost:5432/jelantah_pickup?schema=public`""
    
    $envContent = $envContent -replace 'DATABASE_URL="postgresql://postgres:.*?@localhost:5432/jelantah_pickup\?schema=public"', $newDatabaseUrl
    
    Set-Content -Path .env -Value $envContent -NoNewline
    Write-Host "✅ File .env telah diupdate dengan password baru." -ForegroundColor Green
    Write-Host ""
}

# Clear password dari environment
$env:PGPASSWORD = ""

Write-Host "=== Setup Database Selesai! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Langkah selanjutnya:" -ForegroundColor Cyan
Write-Host "1. Jalankan: npx prisma migrate dev --name init" -ForegroundColor White
Write-Host "2. (Optional) Jalankan: npm run seed" -ForegroundColor White

