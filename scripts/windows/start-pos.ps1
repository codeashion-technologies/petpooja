$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path "$projectRoot\apps")) {
    $projectRoot = "D:\Flutter\flutter_projects\restaurant"
}

$pgDir = Join-Path $projectRoot "runtime\postgres"
$backendDir = Join-Path $projectRoot "apps\backend"
$webDir = Join-Path $projectRoot "apps\web"

# 1. Start PostgreSQL if not already running
$pgPort = Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue
if (-not $pgPort) {
    Write-Host "[1/3] Starting Database..." -ForegroundColor Cyan
    & "$pgDir\start-postgres.ps1"
} else {
    Write-Host "[1/3] Database is already running." -ForegroundColor Green
}

# 2. Start Backend if not already running
$backendPort = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue
if (-not $backendPort) {
    Write-Host "[2/3] Starting Backend API..." -ForegroundColor Cyan
    & "$backendDir\start-backend.ps1"
} else {
    Write-Host "[2/3] Backend API is already running." -ForegroundColor Green
}

# 3. Start Web POS if not already running
$webPort = Get-NetTCPConnection -LocalPort 1995 -State Listen -ErrorAction SilentlyContinue
if (-not $webPort) {
    Write-Host "[3/3] Starting Web POS..." -ForegroundColor Cyan
    & "$webDir\start-web.ps1"
} else {
    Write-Host "[3/3] Web POS is already running." -ForegroundColor Green
}

# 4. Open in Chrome/Edge App Mode
$url = "http://localhost:1995"
$chrome = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

$edge = @(
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($chrome) {
    Start-Process $chrome -ArgumentList "--app=$url --start-maximized"
} elseif ($edge) {
    Start-Process $edge -ArgumentList "--app=$url --start-maximized"
} else {
    Start-Process $url
}

Write-Host "OrderRestro POS launched successfully!" -ForegroundColor Green

