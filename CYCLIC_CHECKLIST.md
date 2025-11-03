# ✅ Cyclic.sh Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Database Setup (Supabase)
- [ ] Buat Supabase project
- [ ] Set database password (simpan dengan aman!)
- [ ] Dapatkan connection string
- [ ] Test connection string lokal
- [ ] Run Prisma migrations: `npx prisma db push`
- [ ] Seed initial data: `npm run seed` (optional)

### 2. Cyclic.sh Account
- [ ] Sign up di https://cyclic.sh
- [ ] Connect dengan GitHub account
- [ ] Create new app
- [ ] Connect repository: `NexDesign-Agency/jelantah-pickup`
- [ ] Pilih branch: `develop` atau `main`

### 3. Environment Variables di Cyclic
- [ ] `DATABASE_URL` - Supabase connection string
- [ ] `NEXTAUTH_URL` - https://your-app.cyclic.app
- [ ] `NEXTAUTH_SECRET` - Generate dengan `openssl rand -base64 32`
- [ ] `NODE_ENV` - production
- [ ] `PORT` - 3000 (optional, Cyclic auto-assign)

#### SMTP (Email)
- [ ] `SMTP_HOST` - smtp.gmail.com
- [ ] `SMTP_PORT` - 587
- [ ] `SMTP_USER` - your-email@gmail.com
- [ ] `SMTP_PASS` - Gmail app password
- [ ] `SMTP_FROM` - JelantahGO <noreply@jelantahgo.com>

#### Google Sheets (Optional)
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- [ ] `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- [ ] `GOOGLE_SHEET_ID`

### 4. Code Preparation
- [ ] `server.js` menggunakan `0.0.0.0` untuk hostname ✅
- [ ] `package.json` script `start` sudah benar ✅
- [ ] `package.json` script `postinstall` untuk Prisma ✅
- [ ] `cyclic.json` sudah dibuat ✅
- [ ] All commits pushed ke GitHub

### 5. First Deployment
- [ ] Cyclic auto-deploy setelah connect repo
- [ ] Check deployment logs di Cyclic dashboard
- [ ] Pastikan build success (no errors)
- [ ] Get app URL: `https://your-app.cyclic.app`

---

## 🧪 Post-Deployment Testing

### Basic Functionality
- [ ] Homepage accessible
- [ ] Login page accessible
- [ ] Can login dengan test account
- [ ] Dashboard accessible after login

### Database Connection
- [ ] Database queries working
- [ ] Can create/read data
- [ ] Prisma Client working

### Real-Time Features
- [ ] Socket.io connection working
- [ ] Live tracking page loads
- [ ] Chat page loads
- [ ] Can send/receive real-time messages

### Authentication
- [ ] NextAuth working
- [ ] Session persists
- [ ] Role-based access working

### Email Integration
- [ ] Test email sends successfully
- [ ] Email notifications working
- [ ] Check email inbox

### Google Sheets (if enabled)
- [ ] Test connection successful
- [ ] Manual sync works
- [ ] Auto-sync on billing paid

---

## 🐛 Common Issues & Solutions

### Issue: Build Failed - Prisma Client Missing
**Solution:**
```bash
# Pastikan postinstall script ada di package.json
"postinstall": "prisma generate"
```

### Issue: Database Connection Error
**Solution:**
1. Double-check `DATABASE_URL` di Cyclic
2. Pastikan password benar (tanpa placeholder)
3. Test connection string lokal dulu

### Issue: Socket.io Not Connecting
**Solution:**
1. Pastikan `server.js` digunakan (bukan Next.js default)
2. Check `NEXTAUTH_URL` menggunakan HTTPS
3. Check browser console untuk WebSocket errors

### Issue: NextAuth Redirect Error
**Solution:**
1. Pastikan `NEXTAUTH_URL` = Cyclic app URL (dengan https)
2. Generate `NEXTAUTH_SECRET` baru
3. Clear browser cookies

---

## 📊 Monitoring

### Cyclic Dashboard
- [ ] Check logs regularly
- [ ] Monitor resource usage
- [ ] Check deployment history

### Application
- [ ] Monitor error logs
- [ ] Test features periodically
- [ ] Check database connections

---

## 🔄 Update Process

Ketika ada update:

1. **Local Development:**
   ```bash
   git checkout develop
   # Make changes
   git add .
   git commit -m "Update: description"
   ```

2. **Push to GitHub:**
   ```bash
   git push  # Auto-deploy ke Cyclic!
   ```

3. **Verify:**
   - Check Cyclic logs
   - Test updated features
   - Verify no errors

---

## 🎯 Success Criteria

Aplikasi siap production jika:
- ✅ All checklist items completed
- ✅ No critical errors in logs
- ✅ All features tested and working
- ✅ Database connected and stable
- ✅ Real-time features working
- ✅ Email notifications working
- ✅ Performance acceptable

---

**Last Updated:** Setelah setup Cyclic

