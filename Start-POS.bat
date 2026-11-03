@echo off
title OrderRestro POS Launcher
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\windows\start-pos.ps1"
ping 127.0.0.1 -n 2 >nul
exit /b 0
