# 🖥️ CLI Deployment Guide - Cyclic.sh & Alternatif

## ⚠️ IMPORTANT: Cyclic.sh Sudah Ditutup

Cyclic.sh telah mengumumkan penutupan:
- ❌ Pendaftaran baru **DITUTUP**
- ❌ Free tier berakhir: **10 Mei 2024**
- ❌ Paid tier berakhir: **31 Mei 2024**

**Alternatif yang direkomendasikan:**
1. **Railway** - CLI support, gratis $5 credit
2. **Render** - CLI support, gratis dengan sleep
3. **Fly.io** - CLI support, gratis dengan limit

---

## 🚂 Railway CLI (RECOMMENDED Alternative)

### Install Railway CLI

```bash
# Via npm
npm install -g @railway/cli

# Atau via Homebrew (Mac)
brew install railway

# Atau via Scoop (Windows)
scoop bucket add railway https://github.com/railwayapp/homebrew-tap
scoop install railway
```

### Setup Railway

```bash
# 1. Login
railway login

# 2. Initialize project
railway init

# 3. Link ke existing project (atau buat baru)
railway link

# 4. Set environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set NEXTAUTH_URL="https://..."
railway variables set NEXTAUTH_SECRET="..."

# 5. Deploy
railway up
```

### Railway Commands

```bash
# Deploy
railway up

# View logs
railway logs

# Open app
railway open

# List all services
railway status

# Set variables
railway variables set KEY=value

# Get variables
railway variables

# Connect database
railway add postgresql
```

---

## 🎨 Render CLI

### Install Render CLI

```bash
# Via npm
npm install -g render

# Atau download binary dari:
# https://github.com/renderinc/cli/releases
```

### Setup Render

```bash
# 1. Login
render login

# 2. Create service
render service:create

# 3. Deploy
render deploy

# 4. View logs
render logs

# 5. Set environment variables
render env:set DATABASE_URL="postgresql://..."
```

### Render Commands

```bash
# Deploy
render deploy

# View services
render services:list

# View logs
render logs

# Set environment variables
render env:set KEY=value

# Get environment variables
render env:list
```

---

## ✈️ Fly.io CLI (Great for Real-Time)

### Install Fly.io CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

### Setup Fly.io

```bash
# 1. Login
fly auth login

# 2. Launch app (first time)
fly launch

# 3. Deploy
fly deploy

# 4. View logs
fly logs

# 5. Set secrets (environment variables)
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set NEXTAUTH_SECRET="..."

# 6. Open app
fly open
```

### Fly.io Commands

```bash
# Deploy
fly deploy

# View logs
fly logs

# View status
fly status

# Set secrets
fly secrets set KEY=value

# List secrets
fly secrets list

# Open app
fly open

# SSH into app
fly ssh console
```

### Fly.io untuk JelantahGO

Karena Fly.io bagus untuk real-time (WebSocket), setup khusus:

1. **Create Dockerfile** (jika belum ada):
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **fly.toml** (auto-generated):
```toml
app = "jelantahgo"
primary_region = "sin" # Singapore

[build]
  builder = "paketobuildpacks/builder:base"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
```

---

## 🔄 Deployment Workflow dengan CLI

### Standard Workflow:

```bash
# 1. Development lokal
git checkout develop
# ... make changes ...

# 2. Test lokal
npm run dev
# ... test features ...

# 3. Commit
git add .
git commit -m "Update: description"

# 4. Push ke GitHub
git push

# 5. Deploy via CLI
railway up    # Railway
# atau
fly deploy    # Fly.io
# atau
render deploy # Render
```

---

## 📋 Environment Variables via CLI

### Railway

```bash
# Set single variable
railway variables set KEY=value

# Set multiple variables
railway variables set DATABASE_URL="..." NEXTAUTH_SECRET="..." NEXTAUTH_URL="..."

# Set from file
railway variables < .env

# Get all variables
railway variables
```

### Fly.io

```bash
# Set secrets (secure)
fly secrets set KEY=value

# Set multiple
fly secrets set KEY1=value1 KEY2=value2

# List secrets
fly secrets list

# Remove secret
fly secrets unset KEY
```

### Render

```bash
# Set environment variable
render env:set KEY=value

# Set from file
render env:set < .env

# List all
render env:list

# Remove
render env:unset KEY
```

---

## 🚀 Quick Deploy Script

Buat script untuk deploy cepat:

### deploy.sh (Linux/Mac)

```bash
#!/bin/bash

echo "🚀 Deploying JelantahGO..."

# Build
echo "📦 Building..."
npm run build

# Deploy
echo "🚀 Deploying..."
railway up  # atau fly deploy / render deploy

# Check status
echo "✅ Checking status..."
railway status

echo "🎉 Deployment complete!"
```

### deploy.ps1 (Windows PowerShell)

```powershell
Write-Host "🚀 Deploying JelantahGO..." -ForegroundColor Green

# Build
Write-Host "📦 Building..." -ForegroundColor Yellow
npm run build

# Deploy
Write-Host "🚀 Deploying..." -ForegroundColor Yellow
railway up  # atau fly deploy / render deploy

# Check status
Write-Host "✅ Checking status..." -ForegroundColor Yellow
railway status

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
```

---

## 📊 Monitoring via CLI

### Railway

```bash
# View logs (real-time)
railway logs --follow

# View logs (last 100 lines)
railway logs --tail 100

# View metrics
railway metrics
```

### Fly.io

```bash
# View logs (real-time)
fly logs

# View logs (follow)
fly logs --follow

# View status
fly status

# View metrics
fly metrics
```

### Render

```bash
# View logs
render logs

# View service info
render services:show SERVICE_ID
```

---

## 🔧 Troubleshooting CLI

### Issue: Command Not Found

**Solution:**
```bash
# Railway
npm install -g @railway/cli

# Fly.io
# Re-install sesuai OS Anda

# Render
npm install -g render
```

### Issue: Authentication Failed

**Solution:**
```bash
# Railway
railway logout
railway login

# Fly.io
fly auth logout
fly auth login

# Render
render logout
render login
```

### Issue: Deploy Failed

**Solution:**
```bash
# Check logs
railway logs --tail 100
# atau
fly logs

# Check build locally
npm run build

# Check environment variables
railway variables
# atau
fly secrets list
```

---

## 💡 Rekomendasi untuk JelantahGO

### **Pilihan 1: Railway** ⭐ RECOMMENDED
- ✅ CLI support
- ✅ $5 credit gratis (cukup untuk testing)
- ✅ PostgreSQL included
- ✅ Auto-deploy dari GitHub
- ✅ Real-time support

### **Pilihan 2: Fly.io** ⭐ BEST FOR REAL-TIME
- ✅ CLI support
- ✅ Bagus untuk WebSocket/Socket.io
- ✅ Global edge network
- ✅ Free tier dengan limit
- ⚠️ Setup sedikit lebih kompleks (Docker)

### **Pilihan 3: Render**
- ✅ CLI support
- ✅ Setup mudah
- ✅ PostgreSQL included
- ⚠️ Free tier ada sleep (15 menit idle)

---

## 📝 Quick Start: Railway (Contoh)

```bash
# 1. Install
npm install -g @railway/cli

# 2. Login
railway login

# 3. Init project
cd E:\nexag\Documents\Jelantah-pickup
railway init

# 4. Link ke project (atau create new)
railway link

# 5. Add PostgreSQL
railway add postgresql

# 6. Set variables
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# 7. Deploy!
railway up
```

---

**Pilih platform mana yang ingin Anda gunakan? Railway, Fly.io, atau Render?**

