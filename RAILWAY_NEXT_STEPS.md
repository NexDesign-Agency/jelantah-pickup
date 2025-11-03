# 🚂 Railway Next Steps - Setup Aplikasi Web Service

## Status Saat Ini:
- ✅ Railway login: Pierre (nexagency88@gmail.com)
- ✅ Project created: desirable-tranquility
- ✅ PostgreSQL database sudah ditambahkan
- ⚠️ Web service perlu dibuat/deployed

---

## 🎯 Option 1: Deploy dari Dashboard (RECOMMENDED)

Karena CLI untuk add service dengan repo agak kompleks, lebih mudah via Dashboard:

1. **Buka Railway Dashboard:**
   ```
   https://railway.com/project/46e230ee-59ef-4c88-8496-3b3185349bdb
   ```

2. **Klik "New" → "GitHub Repo"**

3. **Pilih Repository:**
   - `NexDesign-Agency/jelantah-pickup`
   - Pilih branch: `develop`

4. **Railway akan:**
   - Auto-detect Next.js
   - Setup build & start commands
   - Create service baru

5. **Configure di Settings:**
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `node server.js`
   - **Root Directory:** `/` (default)

---

## 🎯 Option 2: Deploy via CLI (Manual)

Jika ingin via CLI, kita perlu setup service terlebih dahulu:

### Step 1: Link Service

```powershell
# Lihat semua services yang ada
railway service

# Atau buat service baru tanpa repo (deploy manual)
railway add --service jelantahgo-app
```

### Step 2: Deploy Current Directory

```powershell
# Pastikan di root project
cd E:\nexag\Documents\Jelantah-pickup

# Deploy current directory
railway up
```

Railway akan:
- Detect framework (Next.js)
- Build aplikasi
- Deploy ke Railway

---

## ⚙️ Setup Environment Variables

Setelah service dibuat, set environment variables:

```powershell
# Generate NEXTAUTH_SECRET
$secret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "NEXTAUTH_SECRET: $secret"

# Atau pakai openssl (jika ada)
openssl rand -base64 32

# Set variables (ganti YOUR_APP_URL dengan URL dari Railway setelah deploy)
railway variables set NEXTAUTH_URL="https://YOUR_APP_URL.railway.app"
railway variables set NEXTAUTH_SECRET="paste-secret-di-sini"
railway variables set NODE_ENV="production"
railway variables set SMTP_HOST="smtp.gmail.com"
railway variables set SMTP_PORT="587"
railway variables set SMTP_USER="your-email@gmail.com"
railway variables set SMTP_PASS="your-gmail-app-password"
railway variables set SMTP_FROM="JelantahGO <noreply@jelantahgo.com>"
```

**Note:** `DATABASE_URL` sudah otomatis dari PostgreSQL service!

---

## 🗄️ Setup Database Schema

### Get DATABASE_URL:

```powershell
# View all variables (cari DATABASE_URL)
railway variables

# Atau get khusus dari PostgreSQL service
railway connect postgresql  # Ini akan open psql shell
```

### Run Migrations:

```powershell
# Copy DATABASE_URL dari Railway dashboard atau:
railway variables | Select-String "DATABASE_URL"

# Set lokal (temporary)
$env:DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/railway"

# Generate Prisma Client
npx prisma generate

# Push schema
npx prisma db push

# Seed (optional)
npm run seed
```

**Atau via Railway:**

```powershell
# Run command di Railway environment
railway run npx prisma generate
railway run npx prisma db push
railway run npm run seed
```

---

## 🚀 Deploy

### Via Dashboard:
1. Railway akan auto-deploy setelah connect GitHub repo
2. Atau klik "Redeploy" di dashboard

### Via CLI:
```powershell
railway up
```

---

## 📊 Verify Deployment

```powershell
# Check status
railway status

# View logs
railway logs --follow

# Get app URL
railway domain

# Open app
railway open
```

---

## ✅ Checklist Final

- [ ] Web service created (via dashboard atau CLI)
- [ ] GitHub repo connected
- [ ] Build command configured: `npm install && npx prisma generate && npm run build`
- [ ] Start command configured: `node server.js`
- [ ] Environment variables set (NEXTAUTH_URL, NEXTAUTH_SECRET, SMTP, etc.)
- [ ] Database migrations run (`npx prisma db push`)
- [ ] Deploy successful
- [ ] App accessible via Railway URL
- [ ] Login working
- [ ] Database connected
- [ ] Real-time features working

---

## 🐛 Troubleshooting

### Service Not Found:
```powershell
# List all services
railway service

# Link to specific service
railway service <service-name>
```

### Build Failed:
```powershell
# Check logs
railway logs --tail 100

# Test build locally
npm run build
```

### DATABASE_URL Missing:
- Check PostgreSQL service is running
- Verify service is linked to project
- Check environment variables

---

## 📚 Resources

- **Railway Dashboard:** https://railway.com/project/46e230ee-59ef-4c88-8496-3b3185349bdb
- **Railway Docs:** https://docs.railway.app
- **Project URL:** https://railway.com/project/46e230ee-59ef-4c88-8496-3b3185349bdb

---

**Rekomendasi: Pakai Dashboard untuk setup pertama kali, lebih mudah! 🎯**

