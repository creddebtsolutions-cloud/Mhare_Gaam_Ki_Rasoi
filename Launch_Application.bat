@echo off
title Mhare Gaam Ki Rasoi - Local Server
echo ========================================================
echo   🌾 Starting Mhare Gaam Ki Rasoi Local Application...
echo ========================================================
cd /d "%~dp0"

netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo Server is already running on port 3000.
) else (
    echo Starting Node.js background server...
    start "" /b node web/server.js
    timeout /t 2 /nobreak >nul
)

echo.
echo Opening Customer Application in your browser...
start http://localhost:3000

echo.
echo ========================================================
echo   LOCAL ACCESS LINKS:
echo   📱 Customer App:       http://localhost:3000
echo   ⚙️ Admin & Billing:    http://localhost:3000/admin.html
echo.
echo   📶 MOBILE / WI-FI ACCESS (Any phone on same Wi-Fi):
echo   📱 Phone Customer App: http://192.168.31.133:3000
echo   ⚙️ Phone Admin Portal: http://192.168.31.133:3000/admin.html
echo ========================================================
echo Server is active. You can minimize this window.
pause
