# GIS Hospital Dashboard Setup Script (PowerShell)

Write-Host "🏥 Setting up GIS Hospital Dashboard..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Start database services
Write-Host "📦 Starting PostgreSQL and Redis containers..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Backend setup
Write-Host "🔧 Setting up backend..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Gray
    @"
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hospital_db
REDIS_URL=redis://localhost:6379
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
}

if (-not (Test-Path node_modules)) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Gray
    npm install
}
Set-Location ..

# Frontend setup
Write-Host "🔧 Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

if (-not (Test-Path node_modules)) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Gray
    npm install
}
Set-Location ..

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "  1. Backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "  2. Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "The backend will initialize the database on first run." -ForegroundColor Gray
Write-Host "Frontend will be available at http://localhost:3000" -ForegroundColor Gray
