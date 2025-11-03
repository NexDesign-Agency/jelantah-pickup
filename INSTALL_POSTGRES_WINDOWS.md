# Panduan Install PostgreSQL di Windows

## Langkah 1: Download PostgreSQL

1. Buka browser dan kunjungi: **https://www.postgresql.org/download/windows/**
2. Klik tombol **"Download the installer"**
3. Atau langsung ke: **https://www.enterprisedb.com/downloads/postgres-postgresql-downloads**
4. Pilih versi terbaru (PostgreSQL 18, 16, atau 15 - semua kompatibel)
   - ✅ PostgreSQL 18 (terbaru - disarankan)
   - ✅ PostgreSQL 16 (stabil)
   - ✅ PostgreSQL 15 (juga didukung)
5. Download installer untuk Windows (64-bit)

## Langkah 2: Install PostgreSQL

1. **Jalankan installer** yang telah didownload
2. **Klik Next** pada welcome screen
3. **Pilih lokasi instalasi** (default: `C:\Program Files\PostgreSQL\18` atau `16` atau sesuai versi)
   - Klik Next (bisa gunakan default)
4. **Pilih komponen** yang akan diinstall:
   - ✅ PostgreSQL Server (wajib)
   - ✅ pgAdmin 4 (tool untuk manage database - disarankan)
   - ✅ Stack Builder (opsional)
   - ✅ Command Line Tools (disarankan)
   - Klik Next
5. **Pilih lokasi data** (default: `C:\Program Files\PostgreSQL\18\data` atau sesuai versi)
   - Klik Next
6. **Set password untuk user `postgres`** ⚠️ **PENTING: CATAT PASSWORD INI!**
   - Masukkan password yang mudah diingat (contoh: `postgres` atau `admin123`)
   - Konfirmasi password
   - **Simpan password ini, akan digunakan di file .env**
7. **Pilih port** (default: `5432`)
   - Klik Next (gunakan default)
8. **Pilih locale**:
   - Pilih `[Default locale]` atau `Indonesian, Indonesia`
   - Klik Next
9. **Klik Next** untuk konfirmasi
10. **Tunggu proses instalasi selesai** (beberapa menit)
11. **Hilangkan centang** pada "Launch Stack Builder" (opsional)
12. **Klik Finish**

## Langkah 3: Verifikasi Instalasi

Setelah instalasi selesai, PostgreSQL service seharusnya sudah berjalan otomatis.

### Cara Verifikasi:

1. Buka **Windows Services** (Win + R → ketik `services.msc` → Enter)
2. Cari service **"postgresql-x64-18"** atau **"postgresql-x64-16"** atau **"PostgreSQL"** (sesuai versi)
3. Pastikan statusnya **"Running"**
4. Jika tidak running, klik kanan → **Start**

## Langkah 4: Tambahkan PostgreSQL ke PATH (Opsional tapi Disarankan)

Ini memungkinkan Anda menggunakan command `psql` dari terminal manapun:

1. Buka **System Properties**:
   - Win + R → ketik `sysdm.cpl` → Enter
   - Atau: Settings → System → About → Advanced system settings
2. Klik tab **"Advanced"** → Klik **"Environment Variables"**
3. Di bagian **"System variables"**, cari dan pilih **"Path"** → Klik **"Edit"**
4. Klik **"New"** dan tambahkan:
   ```
   C:\Program Files\PostgreSQL\18\bin
   ```
   *(Sesuaikan versi sesuai yang terinstall: `18`, `16`, `15`, dll)*
5. Klik **OK** pada semua dialog
6. **Restart PowerShell/Command Prompt** untuk apply perubahan

## Langkah 5: Test Koneksi

Setelah instalasi dan PATH sudah ditambahkan, test dengan command:

```powershell
psql -U postgres -c "SELECT version();"
```

Masukkan password yang telah di-set saat instalasi.

Jika berhasil, berarti PostgreSQL sudah siap digunakan!

## Langkah Selanjutnya

Setelah PostgreSQL terinstall:

1. **Update file .env** dengan password yang benar
2. **Buat database** `jelantah_pickup`
3. **Jalankan Prisma migration**

Saya akan membantu langkah-langkah ini setelah instalasi selesai!

