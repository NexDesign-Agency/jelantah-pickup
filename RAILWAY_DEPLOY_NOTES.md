# Railway Deployment Notes

## Current Issue: Build Errors

Railway build is failing with:
1. `date-fns` module not found
2. Duplicate state definitions in `billing/page.tsx`

## ✅ Fixed in Commit `c10a39a`

- ✅ Added `date-fns` to `package.json` dependencies
- ✅ Fixed duplicate state definitions in `src/app/(dashboard)/admin/billing/page.tsx`
- ✅ Added `@radix-ui/react-select` and `select.tsx` component
- ✅ Fixed auth exports for NextAuth v5
- ✅ Updated middleware for NextAuth v5

## 🔧 Railway Configuration Check

**Important**: Ensure Railway is configured to:
1. Use branch: `develop` (not `main`)
2. Build command: `npm install && npx prisma generate && npm run build`
3. Start command: `node server.js`

## 📝 Steps to Fix Railway Deployment

### Option 1: Verify Branch Configuration
1. Go to Railway Dashboard → Your Project → Settings
2. Check "Source" → Ensure branch is set to `develop`
3. Click "Redeploy" to trigger new build

### Option 2: Manual Trigger
If Railway is linked to GitHub:
```bash
# Railway should auto-deploy from develop branch
# But you can manually trigger by:
railway up
```

### Option 3: Merge to Main (if Railway uses main)
```bash
git checkout main
git merge develop
git push origin main
```

## 🔍 Verification Commands

Verify files are correct in repository:
```bash
# Check package.json has date-fns
git show HEAD:package.json | grep "date-fns"

# Check billing page has no duplicates
git show HEAD:src/app/\(dashboard\)/admin/billing/page.tsx | grep -c "availableOrders"
# Should return: 1 (only one definition)
```

## 📦 Current Commit
- Commit: `c10a39a`
- Branch: `develop`
- Message: "Fix build errors: Add date-fns, select component, fix auth exports, and middleware for NextAuth v5"

