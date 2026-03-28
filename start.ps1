# ============================================================
#  GoKind - One-Command Startup
#  Usage: .\start.ps1
#
#  This script starts the entire GoKind stack:
#    1. Supabase (Database, Auth, API, Studio)
#    2. Applies database migrations
#    3. Builds and runs the Next.js web app in Docker
#
#  After startup, the app is live at http://localhost:3000
#  Supabase Studio is at http://localhost:54323
# ============================================================

Write-Host ""
Write-Host "  🍃 GoKind - Starting the full stack..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Start Supabase (DB + Auth + API)
Write-Host "📦 Step 1/3: Starting Supabase services..." -ForegroundColor Yellow
npx supabase start
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Supabase may already be running, continuing..." -ForegroundColor DarkYellow
}

# Step 2: Apply database migrations
Write-Host ""
Write-Host "🗄️  Step 2/3: Applying database migrations..." -ForegroundColor Yellow
npx supabase db reset
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to apply migrations!" -ForegroundColor Red
    exit 1
}

# Step 3: Build and Start the Web App
Write-Host ""
Write-Host "🚀 Step 3/3: Building and starting the web app..." -ForegroundColor Yellow
docker compose up --build -d

Write-Host ""
Write-Host "  ✅ GoKind is LIVE!" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Web App:        http://localhost:43000" -ForegroundColor White
Write-Host "  🔧 Supabase Studio: http://localhost:54323" -ForegroundColor White
Write-Host "  📧 Mailpit:         http://localhost:54324" -ForegroundColor White
Write-Host ""
Write-Host "  To expose via Cloudflare Tunnel:" -ForegroundColor DarkGray
Write-Host "    cloudflared tunnel --url http://localhost:43000" -ForegroundColor DarkGray
Write-Host ""
