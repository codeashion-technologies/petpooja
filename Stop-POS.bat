@echo off
title OrderRestro POS Stopper
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\windows\stop-pos.ps1"
ping 127.0.0.1 -n 2 >nul
exit /b 0
