@echo off
title Ice Cream Control Center - Presentation
color 0A
cd /d "%~dp0"

echo.
echo  ====================================================
echo   ICE CREAM CONTROL CENTER - OFFICE PRESENTATION
echo  ====================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  ERROR: Node.js is not installed on this laptop.
    echo.
    echo  Install Node.js from: https://nodejs.org
    echo  Choose the LTS version, install it, then run this file again.
    echo.
    pause
    exit /b 1
)

echo  [1/3] Checking dependencies...
if not exist "node_modules" (
    echo  First time setup - installing packages. This may take 2-3 minutes...
    call npm run install:all
    if %ERRORLEVEL% NEQ 0 (
        echo  Install failed. Check your internet connection and try again.
        pause
        exit /b 1
    )
)

echo  [2/3] Building website...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo  Build failed.
    pause
    exit /b 1
)

echo  [3/3] Starting server...
echo.
echo  Keep this window OPEN during your presentation.
echo  Browser will open automatically in ~20 seconds.
echo  Share the OFFICE LINK shown below with colleagues.
echo.

start "" cmd /c "timeout /t 20 /nobreak >nul && start http://localhost:5000"

cd server
set USE_MEMORY_DB=true
node src/index.js

pause
