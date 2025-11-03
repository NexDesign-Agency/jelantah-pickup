# 🚂 Railway Setup Progress - JelantahGO

## ✅ Progress Checklist

### Completed:
- [x] Railway CLI installed (v4.11.0)
- [x] Login ke Railway (Pierre - nexagency88@gmail.com)
- [x] Project created: **desirable-tranquility**
- [x] Project URL: https://railway.com/project/46e230ee-59ef-4c88-8496-3b3185349bdb
- [x] PostgreSQL database adding (in progress...)

### Next Steps:
- [ ] Verify PostgreSQL database added
- [ ] Check DATABASE_URL environment variable
- [ ] Set required environment variables (NEXTAUTH_URL, NEXTAUTH_SECRET, SMTP, etc.)
- [ ] Run database migrations (npx prisma db push)
- [ ] Deploy application (railway up)
- [ ] Verify deployment
- [ ] Test application

---

## 📋 Environment Variables yang Perlu Di-Set:

```bash
# NextAuth (WAJIB)
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=generate-dengan-openssl-rand-base64-32

# Node Environment
NODE_ENV=production

# SMTP Email (WAJIB untuk notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=JelantahGO <noreply@jelantahgo.com>

# Google Sheets (Optional)
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-sheet-id
```

**Note:** `DATABASE_URL` akan otomatis di-set oleh Railway setelah PostgreSQL ditambahkan.

---

## 🔄 Commands untuk Lanjutkan:

```powershell
# 1. Check status & verify PostgreSQL
railway status
railway variables

# 2. Generate NEXTAUTH_SECRET
openssl rand -base64 32

# 3. Set environment variables
railway variables set NEXTAUTH_SECRET="your-generated-secret"
railway variables set NODE_ENV="production"
railway variables set SMTP_HOST="smtp.gmail.com"
railway variables set SMTP_PORT="587"
# ... dan seterusnya

# 4. Get DATABASE_URL untuk lokal migration
railway variables  # Check DATABASE_URL value

# 5. Run migrations
$env:DATABASE_URL="postgresql://..."  # Copy dari Railway
npx prisma generate
npx prisma db push

# 6. Deploy
railway up
```

---

## 📊 Current Project Info:

- **Project Name:** desirable-tranquility
- **Project ID:** 46e230ee-59ef-4c88-8496-3b3185349bdb
- **Account:** Pierre (nexagency88@gmail.com)
- **Dashboard:** https://railway.com/project/46e230ee-59ef-4c88-8496-3b3185349bdb

---

**Last Updated:** After PostgreSQL add command

