# Git Workflow Guide - JelantahGO

## ⚠️ IMPORTANT: JANGAN LANGSUNG PUSH KE MAIN!

Setelah trauma dengan Supabase, kita pakai workflow yang lebih aman:

## 📋 Branch Strategy

### Branch yang Tersedia:
- **`main`** → Production branch (HANYA untuk code yang sudah tested & ready)
- **`develop`** → Development branch (untuk semua development work)

### Current Setup:
- ✅ Default branch: `develop`
- ✅ Push protection: Tidak langsung ke main
- ✅ Auto setup remote: Enabled

---

## 🚀 Workflow yang Benar

### **Untuk Development (Yang Anda Lakukan Sekarang):**

```bash
# 1. Pastikan di branch develop
git checkout develop

# 2. Buat perubahan
# ... edit files ...

# 3. Add & Commit
git add .
git commit -m "Your commit message"

# 4. PUSH KE DEVELOP (BUKAN MAIN!)
git push
```

**Note:** `git push` otomatis push ke branch `develop` karena Anda sudah di branch tersebut.

---

### **Jika Ingin Buat Fitur Baru:**

```bash
# 1. Buat branch baru dari develop
git checkout develop
git pull  # update develop dulu
git checkout -b feature/nama-fitur

# 2. Kerjakan fitur
# ... edit files ...

# 3. Commit & Push ke branch fitur
git add .
git commit -m "Add: nama fitur"
git push -u origin feature/nama-fitur

# 4. Setelah selesai, merge ke develop via GitHub PR atau:
git checkout develop
git merge feature/nama-fitur
git push
```

---

### **Cara Merge Develop ke Main (SETELAH TESTING):**

**Opsi 1: Via GitHub Pull Request (RECOMMENDED)**
1. Push develop ke GitHub
2. Buat Pull Request dari `develop` → `main` di GitHub
3. Review & test
4. Merge via GitHub UI

**Opsi 2: Via Command Line (HATI-HATI!)**
```bash
# HANYA jika Anda yakin 100% code sudah ready!
git checkout main
git merge develop
git push origin main
```

---

## ✅ Commands yang Aman (Tidak Akan Push ke Main):

```bash
# Check branch saat ini
git branch

# Switch ke develop
git checkout develop

# Push ke branch saat ini (otomatis develop)
git push

# Buat branch baru
git checkout -b feature/something
```

---

## ⛔ Commands yang HARUS DIHINDARI:

```bash
# ❌ JANGAN langsung push ke main!
git push origin main

# ❌ JANGAN checkout main kecuali untuk merge
git checkout main

# ❌ JANGAN langsung commit ke main
```

---

## 📝 Current Status:

- **Current Branch:** `develop` ✅
- **Default Branch:** `develop` ✅
- **Remote:** `origin` → https://github.com/NexDesign-Agency/jelantah-pickup.git

---

## 🔄 Quick Reference:

| Tujuan | Command |
|--------|---------|
| **Development normal** | `git add . && git commit -m "msg" && git push` |
| **Buat fitur baru** | `git checkout -b feature/name` |
| **Kembali ke develop** | `git checkout develop` |
| **Lihat branch** | `git branch` |
| **Update develop** | `git checkout develop && git pull` |

---

## 💡 Tips:

1. **Selalu cek branch** sebelum push: `git branch`
2. **Default sudah develop**, jadi `git push` aman
3. **Main hanya untuk production-ready code**
4. **Gunakan GitHub PR** untuk merge ke main (lebih aman)

---

## 🆘 Jika Terlanjur Push ke Main:

```bash
# 1. Revert commit di main (jika belum banyak yang pull)
git checkout main
git revert HEAD
git push origin main

# 2. Atau buat branch baru dari main, fix, lalu merge kembali
```

---

**Selamat coding dengan aman! 🎉**

