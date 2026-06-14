@echo off
title Deploy Ice Cream Control Center Online
color 0B
cd /d "%~dp0"

echo.
echo  ====================================================
echo   DEPLOY ICE CREAM CONTROL CENTER ONLINE
echo  ====================================================
echo.
echo  This opens Render.com where you can deploy for FREE.
echo  You get one public link like:
echo  https://icecream-control-center.onrender.com
echo.
echo  STEPS:
echo  1. Push this folder to GitHub (see DEPLOY.md)
echo  2. Sign in at Render.com
echo  3. New + ^> Blueprint ^> connect your repo
echo  4. Click Apply - wait 5-8 minutes
echo.
echo  Opening Render dashboard...
start https://dashboard.render.com/select-repo?type=blueprint
echo.
echo  Full guide: open DEPLOY.md in this folder
echo.
pause
