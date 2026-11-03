@echo off
setlocal
cd /d "%~dp0"

set "PGDATA=%~dp0data"
set "PGBIN=%~dp0bin"

:: Try graceful shutdown via pg_ctl
"%PGBIN%\pg_ctl.exe" -D "%PGDATA%" stop -m fast >nul 2>&1

:: If still running or postmaster.pid left over, terminate postgres processes
timeout /t 1 >nul
taskkill /f /im postgres.exe >nul 2>&1

if exist "%PGDATA%\postmaster.pid" (
    del /f /q "%PGDATA%\postmaster.pid" >nul 2>&1
)

exit /b 0

