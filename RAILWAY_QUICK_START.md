# 🚂 Railway Quick Start - JelantahGO

## ✅ Railway CLI Sudah Terinstall!

Versi: `railway 4.11.0`

---

## 🚀 Langkah-Langkah Setup

### **Step 1: Login ke Railway**

```powershell
railway login
```

Ini akan:
- Membuka browser untuk login
- Atau menampilkan URL untuk copy-paste
- Setelah login, kembali ke terminal

---

### **Step 2: Initialize Project**

```powershell
railway init
```

Pilih opsi:
1. **Create new project** (untuk pertama kali)
2. Atau **Link existing project** (jika sudah ada di dashboard Railway)

---

### **Step 3: Add PostgreSQL Database**

```powershell
railway add postgresql
```

Railway akan:
- ✅ Membuat database PostgreSQL
- ✅ Otomatis set `DATABASE_URL` environment variable
- ✅ Database siap digunakan!

---

### **Step 4: Set Environment Variables**

```powershell
# NextAuth (WAJIB)
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
railway variables set NEXTAUTH_SECRET="your-secret-here"

# Generate NEXTAUTH_SECRET dengan:
# openssl rand -base64 32

# Node Environment
railway variables set NODE_ENV="production"

# SMTP Email (WAJIB untuk notifications)
railway variables set SMTP_HOST="smtp.gmail.com"
railway variables set SMTP_PORT="587"
railway variables set SMTP_USER="your-email@gmail.com"
railway variables set SMTP_PASS="your-gmail-app-password"
railway variables set SMTP_FROM="JelantahGO <noreply@jelantahgo.com>"

# Google Sheets (Optional)
railway variables set GOOGLE_SERVICE_ACCOUNT_EMAIL="xxx@xxx.iam.gserviceaccount.com"
railway variables set GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
railway variables set GOOGLE_SHEET_ID="your-sheet-id"
```

**Note:** `DATABASE_URL` sudah otomatis di-set dari PostgreSQL service!

---

### **Step 5: Setup Database Schema**

```powershell
# Set DATABASE_URL lokal untuk migrations (ambil dari Railway dashboard)
$env:DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/railway"

# Generate Prisma Client
npx prisma generate

# Push schema ke Railway database
npx prisma db push

# Seed initial data (optional)
npm run seed
```

**Atau ambil connection string dari Railway:**
1. Railway Dashboard → PostgreSQL Service
2. Copy connection string
3. Set sebagai environment variable lokal
4. Run migrations

---

### **Step 6: Deploy!**

```powershell
railway up
```

Ini akan:
1. Build aplikasi
2. Deploy ke Railway
3. Start service dengan `node server.js`

---

### **Step 7: Monitor & Verify**

```powershell
# View logs (real-time)
railway logs --follow

# Check status
railway status

# Open app
railway open
```

---

## 📋 Checklist Setup

- [ ] Railway CLI installed ✅
- [ ] Login ke Railway (`railway login`)
- [ ] Initialize project (`railway init`)
- [ ] Add PostgreSQL (`railway add postgresql`)
- [ ] Set all environment variables
- [ ] Run database migrations (`npx prisma db push`)
- [ ] Deploy (`railway up`)
- [ ] Verify app accessible
- [ ] Test login
- [ ] Test real-time features
- [ ] Test email notifications

---

## 🔄 Auto-Deploy dari GitHub (Optional)

1. Railway Dashboard → Project → Settings
2. **Connect GitHub**
3. Pilih repository: `NexDesign-Agency/jelantah-pickup`
4. Pilih branch: `develop`
5. Enable **Auto-Deploy**

Sekarang setiap `git push` akan auto-deploy!

---

## 🐛 Troubleshooting

### Issue: Login Required

**Solution:**
```powershell
railway login
# Follow instructions di browser
```

### Issue: Project Not Found

**Solution:**
```powershell
# Create new project
railway init
# Pilih "Create new project"
```

### Issue: Database Connection Error

**Solution:**
```powershell
# Check DATABASE_URL
railway variables

# Verify PostgreSQL service
railway status

# Get connection string dari dashboard
```

### Issue: Build Failed

**Solution:**
```powershell
# Check logs
railway logs --tail 100

# Test build lokal
npm run build
```

---

## 💡 Tips

1. **Get App URL:**
   ```powershell
   railway domain
   # atau
   railway open
   ```

2. **View All Variables:**
   ```powershell
   railway variables
   ```

3. **Update Single Variable:**
   ```powershell
   railway variables set KEY=value
   ```

4. **View Logs:**
   ```powershell
   railway logs --follow
   ```

---

## 📊 Railway Dashboard

Akses dashboard di: https://railway.app

Fitur dashboard:
- ✅ View services
- ✅ Environment variables
- ✅ Logs viewer
- ✅ Metrics
- ✅ Deployments history
- ✅ Database connection info

---

## 🎯 Next Steps

Setelah deploy sukses:

1. ✅ Test aplikasi di Railway URL
2. ✅ Verify semua features working
3. ✅ Setup custom domain (optional)
4. ✅ Monitor logs & metrics
5. ✅ Enable auto-deploy dari GitHub

---

**Siap untuk mulai setup? Jalankan `railway login` sekarang! 🚂**

