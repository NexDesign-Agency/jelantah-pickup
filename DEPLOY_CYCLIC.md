# 🚀 Deployment Guide: JelantahGO ke Cyclic.sh

## ✅ Kenapa Cyclic.sh?

- ✅ **Always-On** - Tidak pernah sleep (tidak seperti Render free tier)
- ✅ **Gratis selamanya** - 1 aplikasi gratis
- ✅ **Custom Server Support** - Mendukung server.js untuk Socket.io
- ✅ **WebSocket Support** - Perfect untuk real-time features
- ✅ **Setup mudah** - Connect GitHub, deploy otomatis

---

## 📋 Prerequisites

1. ✅ GitHub repository sudah ada (sudah ada: `NexDesign-Agency/jelantah-pickup`)
2. ✅ Supabase account (untuk PostgreSQL database)
3. ✅ Email SMTP credentials (Gmail atau lainnya)
4. ✅ Google Service Account (untuk Google Sheets integration - optional)

---

## 🎯 Step 1: Setup Supabase Database (External)

Karena Cyclic tidak menyediakan PostgreSQL gratis, kita pakai **Supabase**:

### 1.1. Buat Supabase Project

1. Buka: https://supabase.com
2. Sign up / Login
3. Klik "New Project"
4. Isi:
   - **Name**: `jelantahgo-db`
   - **Database Password**: (buat password kuat)
   - **Region**: Pilih terdekat (Asia Pacific - Singapore)
5. Klik "Create new project"
6. Tunggu setup selesai (~2 menit)

### 1.2. Get Database Connection String

1. Di Supabase Dashboard → **Settings** → **Database**
2. Scroll ke **Connection string**
3. Pilih **URI** (bukan Session mode)
4. Copy connection string, format:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. **GANTI** `[YOUR-PASSWORD]` dengan password yang Anda buat di step 1.1
6. Simpan untuk step berikutnya

### 1.3. Run Prisma Migrations di Supabase

**Opsi A: Via Local Machine (Recommended)**

```bash
# Set DATABASE_URL ke Supabase
export DATABASE_URL="postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Generate Prisma Client
npx prisma generate

# Push schema ke Supabase
npx prisma db push

# Seed initial data (jika perlu)
npm run seed
```

**Opsi B: Via Supabase SQL Editor**

1. Di Supabase Dashboard → **SQL Editor**
2. Jalankan query dari `prisma/schema.prisma` secara manual (tidak recommended)

---

## 🚀 Step 2: Setup Cyclic.sh Account

### 2.1. Sign Up

1. Buka: https://cyclic.sh
2. Klik "Sign Up"
3. Pilih "Sign in with GitHub"
4. Authorize Cyclic untuk akses GitHub repository

### 2.2. Connect Repository

1. Setelah login, klik **"Create App"**
2. Pilih repository: `NexDesign-Agency/jelantah-pickup`
3. Pilih branch: `develop` atau `main`
4. Klik **"Connect"**

---

## ⚙️ Step 3: Configure Cyclic App

### 3.1. Environment Variables

Di Cyclic Dashboard → Your App → **Environment Variables**, tambahkan:

#### **Database:**
```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

#### **NextAuth:**
```env
NEXTAUTH_URL=https://your-app-name.cyclic.app
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### **SMTP (Email):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=JelantahGO <noreply@jelantahgo.com>
```

#### **Google Sheets (Optional):**
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-sheet-id
```

#### **Node Environment:**
```env
NODE_ENV=production
PORT=3000
```

**Note:** `PORT` akan otomatis di-assign oleh Cyclic, tapi kita set untuk fallback.

---

## 🔧 Step 4: Update server.js untuk Production

File `server.js` sudah OK, tapi pastikan menggunakan `process.env.PORT`:

```javascript
const port = parseInt(process.env.PORT || "3000", 10);
```

✅ **Sudah benar di file server.js Anda!**

---

## 📦 Step 5: Update package.json (Optional)

Pastikan script `start` sudah benar:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

✅ **Sudah benar di package.json Anda!**

---

## 🚀 Step 6: Deploy

### 6.1. Auto Deploy (Recommended)

Cyclic akan **otomatis deploy** setiap kali Anda push ke branch yang terhubung:

```bash
# Push ke develop
git add .
git commit -m "Ready for Cyclic deployment"
git push  # Auto deploy ke Cyclic!
```

### 6.2. Manual Deploy

1. Di Cyclic Dashboard → Your App
2. Klik **"Deploy"** → **"Deploy Now"**

---

## ✅ Step 7: Verify Deployment

### 7.1. Check App URL

Setelah deploy, Anda akan dapat URL:
```
https://your-app-name.cyclic.app
```

### 7.2. Check Logs

1. Di Cyclic Dashboard → Your App → **Logs**
2. Cek apakah ada error
3. Pastikan melihat:
   ```
   > Ready on http://localhost:3000
   > Socket.io initialized on /api/socket
   ```

### 7.3. Test Application

1. ✅ Akses URL: `https://your-app-name.cyclic.app`
2. ✅ Test login
3. ✅ Test Socket.io connection
4. ✅ Test real-time features

---

## 🐛 Troubleshooting

### Issue 1: Build Failed

**Error:** `Cannot find module 'xxx'`

**Solution:**
```bash
# Pastikan semua dependencies ter-install
npm install

# Rebuild
npm run build

# Commit & push lagi
git add package-lock.json
git commit -m "Fix: Update dependencies"
git push
```

---

### Issue 2: Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
1. Cek `DATABASE_URL` di Cyclic Environment Variables
2. Pastikan password benar (tanpa `[YOUR-PASSWORD]`)
3. Cek Supabase Dashboard → Database → Connection pooling (jika perlu)
4. Pastikan Supabase project masih aktif

---

### Issue 3: Socket.io Not Working

**Error:** WebSocket connection failed

**Solution:**
1. Pastikan `server.js` sudah digunakan (Cyclic menggunakan `startCommand`)
2. Cek logs untuk error
3. Pastikan `NEXTAUTH_URL` benar (https, bukan http)
4. Test dengan browser console:
   ```javascript
   const socket = io('https://your-app.cyclic.app');
   ```

---

### Issue 4: NextAuth Error

**Error:** `NEXTAUTH_SECRET missing`

**Solution:**
1. Pastikan `NEXTAUTH_SECRET` sudah di-set di Cyclic Environment Variables
2. Generate secret baru: `openssl rand -base64 32`
3. Update `NEXTAUTH_URL` dengan URL Cyclic Anda

---

### Issue 5: Prisma Client Error

**Error:** `PrismaClient is not configured`

**Solution:**

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   git add prisma
   git commit -m "Fix: Generate Prisma Client"
   git push
   ```

2. **Atau tambahkan di Cyclic build command:**
   ```json
   {
     "buildCommand": "npm install && npx prisma generate && npm run build"
   }
   ```

---

## 📊 Monitoring

### Cyclic Dashboard Features:

1. **Logs** - Real-time application logs
2. **Metrics** - CPU, Memory usage
3. **Deployments** - History semua deployment
4. **Environment** - Manage environment variables

---

## 🔄 Update Deployment

Untuk update aplikasi:

```bash
# 1. Buat perubahan
# ... edit files ...

# 2. Commit & Push
git add .
git commit -m "Update: description"
git push

# 3. Cyclic akan auto-deploy!
```

---

## 🎉 Success Checklist

- [ ] Supabase database setup & connected
- [ ] Cyclic app created & connected to GitHub
- [ ] All environment variables set
- [ ] First deployment successful
- [ ] App accessible via Cyclic URL
- [ ] Login working
- [ ] Socket.io connection working
- [ ] Real-time features working
- [ ] Email notifications working (test)
- [ ] Google Sheets sync working (optional)

---

## 🔗 Important Links

- **Cyclic Dashboard:** https://app.cyclic.sh
- **Supabase Dashboard:** https://app.supabase.com
- **Your App URL:** `https://your-app-name.cyclic.app`

---

## 💡 Tips

1. **Always test locally first** sebelum push ke GitHub
2. **Check Cyclic logs** jika ada masalah
3. **Environment variables** jangan di-commit ke git (sudah di .gitignore)
4. **Database migrations** lakukan di lokal, lalu push ke Supabase
5. **Monitor resource usage** di Cyclic dashboard

---

## 🆘 Support

- **Cyclic Docs:** https://docs.cyclic.sh
- **Supabase Docs:** https://supabase.com/docs
- **Issues:** Check GitHub repository issues

---

**Selamat! Aplikasi JelantahGO Anda sudah siap untuk production di Cyclic.sh! 🎉**

