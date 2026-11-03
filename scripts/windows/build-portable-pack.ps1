param(
    [string]$TargetDir = "D:\OrderRestro-POS-Portable"
)

$ErrorActionPreference = "Stop"
$projectRoot = "D:\Flutter\flutter_projects\restaurant"

Write-Host "Creating portable distribution package at: $TargetDir" -ForegroundColor Cyan

# 1. Create directory structure
$binNode = Join-Path $TargetDir "bin\node"
$binPg = Join-Path $TargetDir "bin\postgres"
$serverDir = Join-Path $TargetDir "backend"
$webDir = Join-Path $TargetDir "web"
$scriptsDir = Join-Path $TargetDir "scripts"

New-Item -ItemType Directory -Force -Path $binNode | Out-Null
New-Item -ItemType Directory -Force -Path $binPg | Out-Null
New-Item -ItemType Directory -Force -Path $serverDir | Out-Null
New-Item -ItemType Directory -Force -Path $webDir | Out-Null
New-Item -ItemType Directory -Force -Path $scriptsDir | Out-Null

# 2. Copy Portable Node.js
$nodeExe = (Get-Command node).Source
if (Test-Path $nodeExe) {
    Copy-Item $nodeExe -Destination "$binNode\node.exe" -Force
    Write-Host "Copied standalone node.exe" -ForegroundColor Green
}

# 3. Copy Portable PostgreSQL runtime + initialized data
Write-Host "Copying PostgreSQL binaries and initialized database..." -ForegroundColor Cyan
Copy-Item "$projectRoot\runtime\postgres\bin" -Destination $binPg -Recurse -Force
Copy-Item "$projectRoot\runtime\postgres\lib" -Destination $binPg -Recurse -Force
Copy-Item "$projectRoot\runtime\postgres\share" -Destination $binPg -Recurse -Force
Copy-Item "$projectRoot\runtime\postgres\data" -Destination $binPg -Recurse -Force

# Clean postmaster.pid in target data if present
if (Test-Path "$binPg\data\postmaster.pid") {
    Remove-Item "$binPg\data\postmaster.pid" -Force -ErrorAction SilentlyContinue
}

# 4. Copy Backend compiled dist + Prisma + root node_modules needed
Write-Host "Copying compiled backend..." -ForegroundColor Cyan
Copy-Item "$projectRoot\apps\backend\dist" -Destination $serverDir -Recurse -Force
Copy-Item "$projectRoot\apps\backend\prisma" -Destination $serverDir -Recurse -Force
Copy-Item "$projectRoot\apps\backend\package.json" -Destination "$serverDir\package.json" -Force
Copy-Item "$projectRoot\apps\backend\.env" -Destination "$serverDir\.env" -Force
Copy-Item "$projectRoot\node_modules" -Destination "$TargetDir\node_modules" -Recurse -Force

# 5. Copy Web Standalone build
Write-Host "Copying Next.js standalone web build..." -ForegroundColor Cyan
Copy-Item "$projectRoot\apps\web\.next\standalone\*" -Destination $webDir -Recurse -Force

# 6. Copy Root scripts & Environment
Copy-Item "$projectRoot\Start-POS.bat" -Destination "$TargetDir\Start-POS.bat" -Force
Copy-Item "$projectRoot\Stop-POS.bat" -Destination "$TargetDir\Stop-POS.bat" -Force
Copy-Item "$projectRoot\scripts\windows\start-pos.ps1" -Destination "$scriptsDir\start-pos.ps1" -Force
Copy-Item "$projectRoot\scripts\windows\stop-pos.ps1" -Destination "$scriptsDir\stop-pos.ps1" -Force

Write-Host "Portable package assembled successfully at $TargetDir!" -ForegroundColor Green

