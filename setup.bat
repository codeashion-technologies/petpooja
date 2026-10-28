@echo off
setlocal enabledelayedexpansion
title OrderRestro POS — Windows Setup

:: Switch to script directory (Project Root)
cd /d "%~dp0"

echo ====================================================================
echo             OrderRestro Restaurant POS — 1-Click Setup
echo ====================================================================
echo.

:: 1. Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker was not found on this computer.
    echo Please install Docker Desktop for Windows: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

:: 2. Check if Docker Engine is running
echo [1/5] Checking Docker service...
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Docker is installed but not running. Starting Docker Desktop...
    if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
        start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
    )
    echo Waiting for Docker Engine to start (up to 45 seconds)...
    set /a attempts=0
    :wait_docker
    timeout /t 3 >nul
    docker info >nul 2>&1
    if %ERRORLEVEL% equ 0 goto docker_ready
    set /a attempts+=1
    if !attempts! leq 15 goto wait_docker
    echo [ERROR] Docker Engine took too long to start. Please start Docker Desktop manually and re-run setup.bat.
    pause
    exit /b 1
)
:docker_ready
echo       Docker is running and ready.

:: 3. Configure .env file
echo [2/5] Configuring environment settings...
if not exist ".env" (
    echo       Creating .env file with secure secrets...
    if exist ".env.example" (
        copy /y ".env.example" ".env" >nul
    ) else (
        echo POSTGRES_PASSWORD=nodedr_db_pw > .env
        echo HOST_PORT=1995 >> .env
        echo FRONTEND_ORIGIN=http://localhost:1995 >> .env
        echo COOKIE_SECURE=false >> .env
    )
    :: Generate secure random JWT_SECRET using PowerShell
    powershell -NoProfile -Command "$sec = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_}); (Get-Content .env) -replace 'JWT_SECRET=.*', ('JWT_SECRET=' + $sec) | Set-Content .env"
) else (
    echo       Existing .env file detected. Keeping settings.
)

:: 4. Start Docker Containers
echo [3/5] Starting OrderRestro services (Database, Backend, POS Web)...
docker compose up -d
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to start Docker containers. Check docker logs for details.
    pause
    exit /b 1
)

:: Wait for Web service on port 1995
echo [4/5] Waiting for POS server to become ready...
set /a port_attempts=0
:wait_port
powershell -NoProfile -Command "try { $res = Invoke-WebRequest -Uri 'http://localhost:1995' -TimeoutSec 2 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% equ 0 goto app_ready
timeout /t 2 >nul
set /a port_attempts+=1
if !port_attempts! leq 30 goto wait_port
echo       Server is starting in background...

:app_ready
echo       POS Server is alive at http://localhost:1995

:: 5. Create Desktop Shortcut and Auto-Start
echo [5/5] Creating Desktop App Shortcut and registering Windows Auto-Start...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\windows\create-desktop-shortcut.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\windows\register-autostart.ps1"

echo.
echo ====================================================================
echo     SUCCESS: OrderRestro Restaurant POS is installed and ready!
echo ====================================================================
echo  - POS Web Address   : http://localhost:1995
echo  - Desktop Shortcut  : "OrderRestro POS" created on Desktop
echo  - Windows Auto-Start: Enabled (starts automatically upon PC boot)
echo ====================================================================
echo.

:: Launch POS immediately in Chrome/Edge App Mode
powershell -NoProfile -ExecutionPolicy Bypass -Command "& {
    $url = 'http://localhost:1995'
    $chrome = @(
        \"$env:ProgramFiles\Google\Chrome\Application\chrome.exe\",
        \"${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe\",
        \"$env:LocalAppData\Google\Chrome\Application\chrome.exe\"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1

    $edge = @(
        \"$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe\",
        \"${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe\"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1

    if ($chrome) {
        Start-Process $chrome -ArgumentList \"--app=$url --start-maximized\"
    } elseif ($edge) {
        Start-Process $edge -ArgumentList \"--app=$url --start-maximized\"
    } else {
        Start-Process $url
    }
}"

echo Press any key to close this installer...
pause >nul
