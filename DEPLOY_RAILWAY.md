# 🚂 Railway Deployment Guide - JelantahGO

## ✅ Kenapa Railway?

- ✅ **CLI Support** - Deploy dari terminal
- ✅ **$5 Credit Gratis** - Cukup untuk testing
- ✅ **PostgreSQL Included** - Database gratis
- ✅ **Auto-Deploy** - Dari GitHub
- ✅ **Always-On** - Tidak sleep
- ✅ **Real-Time Support** - WebSocket/Socket.io ready

---

## 📋 Prerequisites

1. ✅ GitHub repository: `NexDesign-Agency/jelantah-pickup`
2. ✅ Railway account: https://railway.app
3. ✅ Node.js & npm installed (sudah ada)

---

## 🚀 Step 1: Install Railway CLI

### Windows (PowerShell)

```powershell
npm install -g @railway/cli
```

### Verify Installation

```bash
railway --version
```

---

## 🔐 Step 2: Login to Railway

```bash
railway login
```

Ini akan:
- Buka browser untuk login
- Atau copy token untuk login di CLI

---

## 📦 Step 3: Initialize Project

```bash
# Di directory project Anda
cd E:\nexag\Documents\Jelantah-pickup

# Initialize Railway project
railway init
```

Pilih:
- **Create new project** (untuk pertama kali)
- Atau **Link existing project** (jika sudah ada di dashboard)

---

## 🗄️ Step 4: Add PostgreSQL Database

```bash
# Add PostgreSQL service
railway add postgresql

# Railway akan otomatis:
# - Create database
# - Set DATABASE_URL environment variable
```

**Note:** Connection string otomatis di-set sebagai `DATABASE_URL`

---

## ⚙️ Step 5: Set Environment Variables

### Set Required Variables:

```bash
# NextAuth
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Node Environment
railway variables set NODE_ENV="production"

# SMTP (Email)
railway variables set SMTP_HOST="smtp.gmail.com"
railway variables set SMTP_PORT="587"
railway variables set SMTP_USER="your-email@gmail.com"
railway variables set SMTP_PASS="your-app-password"
railway variables set SMTP_FROM="JelantahGO <noreply@jelantahgo.com>"

# Google Sheets (Optional)
railway variables set GOOGLE_SERVICE_ACCOUNT_EMAIL="xxx@xxx.iam.gserviceaccount.com"
railway variables set GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
railway variables set GOOGLE_SHEET_ID="your-sheet-id"
```

### Atau Set dari File:

Buat `.env.railway` (jangan commit ke git):

```env
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=your-secret-here
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=JelantahGO <noreply@jelantahgo.com>
```

Lalu set semua:

```bash
railway variables < .env.railway
```

**Note:** `DATABASE_URL` sudah otomatis dari PostgreSQL service!

---

## 🔧 Step 6: Configure Railway for Custom Server

Railway perlu tahu kita pakai custom server (`server.js`).

### Opsi A: Via Dashboard

1. Buka Railway Dashboard
2. Pilih service Anda
3. Settings → **Deploy**
4. Set:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `node server.js`

### Opsi B: Via railway.json (Create File)

Buat `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🗄️ Step 7: Setup Database Schema

### Run Prisma Migrations:

```bash
# Set DATABASE_URL untuk lokal (jika perlu)
# Railway sudah set otomatis, tapi untuk lokal testing:
export DATABASE_URL="postgresql://..."  # Dari Railway dashboard

# Generate Prisma Client
npx prisma generate

# Push schema ke Railway database
npx prisma db push

# Seed initial data (optional)
npm run seed
```

**Atau via Railway:**

1. Railway Dashboard → PostgreSQL Service
2. Click **Query** tab
3. Jalankan SQL dari schema.prisma (manual, tidak recommended)

**Better:** Setup database lokal dengan Railway connection string untuk migrations.

---

## 🚀 Step 8: Deploy!

```bash
# Deploy ke Railway
railway up
```

Ini akan:
1. Build aplikasi
2. Deploy ke Railway
3. Start service dengan `node server.js`

---

## 📊 Step 9: Monitor Deployment

### View Logs:

```bash
# Real-time logs
railway logs --follow

# Last 100 lines
railway logs --tail 100

# Service-specific logs
railway logs SERVICE_NAME
```

### Check Status:

```bash
railway status
```

### Open App:

```bash
railway open
```

Atau buka di dashboard untuk mendapatkan URL.

---

## ✅ Step 10: Verify Deployment

### Checklist:

- [ ] App accessible via Railway URL
- [ ] Login working
- [ ] Database connected (test create/read)
- [ ] Socket.io working (test real-time features)
- [ ] Email notifications working
- [ ] No errors in logs

### Test Commands:

```bash
# Test database connection
railway run npx prisma db pull

# Test build locally
npm run build

# View service info
railway status
```

---

## 🔄 Auto-Deploy from GitHub

Railway bisa auto-deploy dari GitHub:

1. Railway Dashboard → Project → Settings
2. **Connect GitHub**
3. Pilih repository: `NexDesign-Agency/jelantah-pickup`
4. Pilih branch: `develop`
5. Enable **Auto-Deploy**

Sekarang setiap `git push` akan auto-deploy!

---

## 📝 Update Deployment

### Standard Workflow:

```bash
# 1. Make changes
# ... edit files ...

# 2. Test locally
npm run dev

# 3. Commit
git add .
git commit -m "Update: description"

# 4. Push (auto-deploy jika enabled)
git push

# 5. Atau manual deploy
railway up
```

---

## 🐛 Troubleshooting

### Issue: Build Failed

**Error:** `Cannot find module 'prisma/client'`

**Solution:**
```bash
# Pastikan postinstall script ada
# Check package.json: "postinstall": "prisma generate"

# Re-deploy
railway up
```

### Issue: Database Connection Error

**Solution:**
```bash
# Check DATABASE_URL
railway variables

# Verify database service running
railway status

# Test connection
railway run npx prisma db pull
```

### Issue: Socket.io Not Working

**Solution:**
1. Pastikan `server.js` digunakan (check start command)
2. Check logs: `railway logs`
3. Verify `NEXTAUTH_URL` menggunakan HTTPS
4. Check Railway service health

### Issue: Port Error

**Solution:**
- Railway auto-assign PORT
- Pastikan `server.js` menggunakan `process.env.PORT`
- ✅ Sudah benar di server.js Anda!

---

## 💰 Railway Pricing

### Free Tier:
- $5 credit gratis (untuk testing)
- After credit habis, pay-as-you-go
- PostgreSQL: $5/bulan (atau free tier dengan limit)

### Estimate untuk JelantahGO:
- **Web Service**: ~$5-10/bulan
- **PostgreSQL**: $5/bulan
- **Total**: ~$10-15/bulan (setelah free credit)

---

## 🔗 Useful Commands

```bash
# Login
railway login

# Status
railway status

# Deploy
railway up

# Logs
railway logs --follow

# Open app
railway open

# Variables
railway variables
railway variables set KEY=value

# Services
railway service

# Database
railway add postgresql
railway connect postgresql
```

---

## 📚 Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Dashboard**: https://railway.app
- **CLI Reference**: `railway --help`

---

**Railway adalah pilihan yang sangat baik untuk JelantahGO dengan CLI support! 🚂**

