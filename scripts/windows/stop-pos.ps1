$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path "$projectRoot\apps")) {
    $projectRoot = "D:\Flutter\flutter_projects\restaurant"
}

Write-Host "Stopping OrderRestro POS services..." -ForegroundColor Yellow

# 1. Stop Web server (port 1995)
$web = Get-NetTCPConnection -LocalPort 1995 -State Listen -ErrorAction SilentlyContinue
if ($web) {
    Stop-Process -Id $web.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "Web server stopped." -ForegroundColor Green
}

# 2. Stop Backend (port 4000)
$backend = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue
if ($backend) {
    Stop-Process -Id $backend.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "Backend API stopped." -ForegroundColor Green
}

# 3. Stop PostgreSQL (port 5432)
$pg = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
if ($pg) {
    Stop-Process -Name "postgres" -Force -ErrorAction SilentlyContinue
    Write-Host "Database stopped." -ForegroundColor Green
}

# Clean stale pid if any
$pidFile = "$projectRoot\runtime\postgres\data\postmaster.pid"
if (Test-Path $pidFile) {
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

Write-Host "All OrderRestro services stopped successfully." -ForegroundColor Green

