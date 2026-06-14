@echo off
title Ice Cream Control Center - LIVE
color 0A
cd /d "%~dp0"

echo.
echo  ====================================================
echo   DEPLOYING FROM GITHUB - ICE CREAM CONTROL CENTER
echo  ====================================================
echo.
echo  GitHub: https://github.com/sk5195/ice-cream-control-center
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Install Node.js from https://nodejs.org
    pause
    exit /b 1
)

if not exist "client\dist\index.html" (
    echo Building website...
    call npm run build
)

echo Starting server...
start "Server" cmd /k "cd /d %~dp0server && set USE_MEMORY_DB=true && set NODE_ENV=production && node src/index.js"

timeout /t 15 /nobreak >nul

echo Starting public tunnel...
echo.
echo YOUR LIVE LINK will appear below in a few seconds...
echo.

npx --yes localtunnel --port 5000

pause
