@echo off
setlocal
cd /d "%~dp0\..\.."

echo ===================================================
echo   Stopping OrderRestro Restaurant POS...
echo ===================================================

docker compose stop

echo.
echo OrderRestro POS has stopped.
timeout /t 3 >nul
