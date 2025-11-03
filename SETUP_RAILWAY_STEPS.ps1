# Railway Setup Script untuk JelantahGO
# PowerShell Script untuk memandu setup Railway

Write-Host "🚂 Railway Setup untuk JelantahGO" -ForegroundColor Green
Write-Host ""

# Check Railway CLI
Write-Host "📦 Checking Railway CLI..." -ForegroundColor Yellow
$railwayVersion = railway --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Railway CLI installed: $railwayVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Railway CLI tidak terinstall" -ForegroundColor Red
    Write-Host "Install dengan: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Langkah-langkah Setup:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Login ke Railway:" -ForegroundColor Yellow
Write-Host "   railway login" -ForegroundColor White
Write-Host ""
Write-Host "2. Initialize Project:" -ForegroundColor Yellow
Write-Host "   railway init" -ForegroundColor White
Write-Host "   → Pilih 'Create new project'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Add PostgreSQL Database:" -ForegroundColor Yellow
Write-Host "   railway add postgresql" -ForegroundColor White
Write-Host ""
Write-Host "4. Set Environment Variables:" -ForegroundColor Yellow
Write-Host "   railway variables set NEXTAUTH_URL='https://your-app.railway.app'" -ForegroundColor White
Write-Host "   railway variables set NEXTAUTH_SECRET='generate-dengan-openssl'" -ForegroundColor White
Write-Host "   railway variables set NODE_ENV='production'" -ForegroundColor White
Write-Host "   # ... dan lainnya (lihat RAILWAY_QUICK_START.md)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Setup Database Schema:" -ForegroundColor Yellow
Write-Host "   npx prisma db push" -ForegroundColor White
Write-Host ""
Write-Host "6. Deploy:" -ForegroundColor Yellow
Write-Host "   railway up" -ForegroundColor White
Write-Host ""
Write-Host "7. Monitor:" -ForegroundColor Yellow
Write-Host "   railway logs --follow" -ForegroundColor White
Write-Host "   railway status" -ForegroundColor White
Write-Host "   railway open" -ForegroundColor White
Write-Host ""
Write-Host "📚 Dokumentasi lengkap: RAILWAY_QUICK_START.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siap mulai? Jalankan: railway login" -ForegroundColor Green

