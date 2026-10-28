@echo off
setlocal
cd /d "%~dp0\..\.."

echo ===================================================
echo   Starting OrderRestro Restaurant POS...
echo ===================================================

docker compose up -d

echo.
echo Launching POS Desktop Window...
powershell -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0create-desktop-shortcut.ps1'"
start "" "http://localhost:1995"

echo.
echo OrderRestro POS is running at http://localhost:1995
timeout /t 3 >nul
