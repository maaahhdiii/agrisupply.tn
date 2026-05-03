@echo off
echo ===========================================
echo   Starting AgriSupply.tn Local Environment
echo ===========================================
echo.

echo [1/2] Checking and installing dependencies...
call npm install

echo.
echo [2/2] Starting Vite development server...
echo.
call npm run dev

pause
