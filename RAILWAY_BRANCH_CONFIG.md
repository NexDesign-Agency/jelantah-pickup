# Railway Branch Configuration Guide

## ✅ Branch `go-ama` Created

Branch `go-ama` telah dibuat dari `develop` dan di-push ke GitHub.

## 🔧 Cara Konfigurasi Railway untuk Deploy dari Branch `go-ama`

### **Metode 1: Via Railway Dashboard (Recommended)**

1. **Buka Railway Dashboard**
   - Login ke https://railway.app
   - Pilih project **JelantahGO**

2. **Ubah Branch Configuration**
   - Klik **Settings** (⚙️) di project
   - Scroll ke bagian **Source**
   - Klik **"..."** di samping GitHub repository
   - Pilih tab **"Deploy"**
   - Ubah **Branch** dari `develop` atau `main` ke **`go-ama`**
   - Klik **Save**

3. **Trigger Deployment**
   - Klik **"Redeploy"** untuk trigger build baru
   - Atau tunggu auto-deploy jika GitHub integration aktif

### **Metode 2: Via Railway CLI**

```bash
# Login ke Railway (jika belum)
railway login

# Link ke project yang sudah ada
railway link

# Set branch untuk deployment
railway variables set RAILWAY_GIT_BRANCH=go-ama

# Atau deploy langsung dari branch go-ama
git checkout go-ama
railway up
```

### **Metode 3: Via GitHub Integration Settings**

1. **Di Railway Dashboard**
   - Settings → **GitHub**
   - Klik **"Disconnect"** (jika sudah terhubung)
   - Klik **"Connect GitHub"** lagi
   - Pilih repository: `NexDesign-Agency/jelantah-pickup`
   - **Pilih branch**: `go-ama`
   - Klik **Deploy**

## 📋 Verifikasi

Setelah konfigurasi:
1. Cek di Railway Dashboard → **Deployments**
2. Deployment terbaru harus dari branch `go-ama`
3. Build log harus menunjukkan commit dari branch `go-ama`

## 🔄 Update Branch `go-ama`

Setiap kali ingin update deployment:

```bash
# Switch ke branch go-ama
git checkout go-ama

# Merge latest dari develop
git merge develop

# Push ke remote
git push origin go-ama
```

Railway akan otomatis detect perubahan dan trigger build baru.

## 📝 Current Status

- ✅ Branch `go-ama` created
- ✅ Merged from `develop`
- ✅ Pushed to GitHub
- ⏳ Railway configuration needed (pilih salah satu metode di atas)

## 🚀 Quick Command

Untuk deploy cepat dari branch `go-ama`:

```bash
git checkout go-ama
git merge develop
git push origin go-ama
railway up  # Jika menggunakan Railway CLI
```

