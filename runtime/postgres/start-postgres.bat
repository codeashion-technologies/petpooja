@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-postgres.ps1"
exit /b %ERRORLEVEL%
