# ⚡ Quick Git Guide - AMAN untuk JelantahGO

## ✅ SETUP SUDAH SELESAI!

- ✅ Branch `develop` sudah dibuat
- ✅ Anda sekarang di branch `develop`
- ✅ Default branch: `develop`
- ✅ **JANGAN LANGSUNG PUSH KE MAIN!**

---

## 🚀 Workflow Standar (Yang Anda Pakai Setiap Hari):

### **1. Kerjakan di Develop (Current Branch):**

```bash
# Check branch saat ini (harus develop)
git branch

# Buat perubahan
# ... edit files ...

# Add, Commit, Push (AMAN - otomatis ke develop)
git add .
git commit -m "Update: deskripsi perubahan"
git push
```

**✅ AMAN** - Push ini akan ke branch `develop`, bukan `main`!

---

### **2. Kalau Mau Buat Fitur Baru:**

```bash
# Buat branch fitur dari develop
git checkout develop
git pull  # update dulu
git checkout -b feature/nama-fitur

# Kerjakan fitur
# ... edit files ...

# Commit & Push ke branch fitur
git add .
git commit -m "Add: nama fitur"
git push -u origin feature/nama-fitur
```

---

## ⛔ YANG JANGAN DILAKUKAN:

```bash
# ❌ JANGAN INI:
git push origin main

# ❌ JANGAN INI:
git checkout main
git add .
git commit -m "..."
git push
```

---

## 📋 Checklist Sebelum Push:

1. ✅ Cek branch: `git branch` (harus ada tanda * di develop)
2. ✅ Commit message jelas
3. ✅ Push: `git push` (bukan `git push origin main`)

---

## 🔄 Status Saat Ini:

```
Branch lokal:  develop ✅
Branch remote: develop ✅ (sudah di-push)
Main branch:   PROTECTED (jangan sentuh!)
```

---

## 💡 Tips:

- **Selalu cek `git branch`** sebelum push
- **Default sudah develop**, jadi aman
- **Jika ragu, cek dulu branch nya**
- **Main hanya untuk production-ready code**

---

## 🆘 Jika Ada Masalah:

```bash
# Cek branch saat ini
git branch

# Kembali ke develop
git checkout develop

# Cek status
git status

# Lihat log
git log --oneline -5
```

---

**Ingat: Push aman ke develop! Main hanya untuk merge setelah testing! 🎉**

